/**
 * JWT Authentication Utilities
 * Handles token validation, expiration checks, and user authentication
 */

interface DecodedToken {
    exp?: number;
    iat?: number;
    userId?: string;
    email?: string;
    role?: string;
    [key: string]: any;
}

/**
 * Decode a JWT token (without verification - for client-side use only)
 * For production, token verification should be done on the backend
 */
export function decodeToken(token: string): DecodedToken | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
}

/**
 * Get the token from localStorage
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

/**
 * Set the token in localStorage and cookies
 */
export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('token', token);
    
    // Also set as cookie for middleware access
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
}

/**
 * Remove the token from localStorage and cookies
 */
export function removeToken(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user_info'); // Also remove user info
    
    // Remove cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Store user information in localStorage
 */
export function setUserInfo(userInfo: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_info', JSON.stringify(userInfo));
}

/**
 * Get user information from localStorage
 */
export function getUserInfo(): any {
    if (typeof window === 'undefined') return null;
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) return null;
    try {
        return JSON.parse(userInfo);
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated with a valid token
 */
export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;
    
    return !isTokenExpired(token);
}

/**
 * Get user information from the token
 */
export function getUserFromToken(): DecodedToken | null {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        return null;
    }
    
    return decodeToken(token);
}

/**
 * Logout user by removing token and redirecting to login
 */
export function logout(redirectUrl: string = '/login'): void {
    removeToken();
    if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
    }
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: string): boolean {
    const user = getUserFromToken();
    if (!user) return false;
    
    // Check various possible role field names in the token
    const userRole = user.role || user.userRole || user.type || user.userType || user.user_type;
    
    if (!userRole) return false;
    
    // Handle both string and array roles
    if (Array.isArray(userRole)) {
        return userRole.some(r => r.toLowerCase() === role.toLowerCase());
    }
    
    return userRole.toLowerCase() === role.toLowerCase();
}

/**
 * Check if user is an admin
 * Supports both "admin" and "SUPER_ADMIN" role values
 * Checks localStorage user_info first (since user_type is not in JWT)
 */
export function isAdmin(): boolean {
    // First check localStorage for user_info (from login response)
    const userInfo = getUserInfo();
    if (userInfo) {
        const userType = userInfo.user_type || userInfo.userType || userInfo.role;
        if (userType) {
            const typeLower = userType.toLowerCase();
            if (typeLower === 'admin' || typeLower === 'super_admin') {
                return true;
            }
        }
    }
    
    // Fallback to checking JWT token (if backend adds user_type to token in future)
    const user = getUserFromToken();
    if (!user) return false;
    
    // Check various possible role field names in the token
    const userRole = user.role || user.userRole || user.type || user.userType || user.user_type;
    
    if (!userRole) return false;
    
    // Handle both string and array roles
    if (Array.isArray(userRole)) {
        return userRole.some(r => {
            const roleLower = r.toLowerCase();
            return roleLower === 'admin' || roleLower === 'super_admin';
        });
    }
    
    const roleLower = userRole.toLowerCase();
    return roleLower === 'admin' || roleLower === 'super_admin';
}

/**
 * Check if user has a valid active payment/subscription
 * Returns an object with hasValidPayment flag and optional error message
 */
export async function checkPaymentStatus(): Promise<{ hasValidPayment: boolean; error?: string }> {
    try {
        const token = getToken();
        if (!token || isTokenExpired(token)) {
            return { hasValidPayment: false, error: 'Not authenticated' };
        }
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
        const response = await fetch(`${baseUrl}/payment/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            // If the endpoint doesn't exist or returns error, assume no valid payment
            console.warn('Payment status check failed:', response.statusText);
            return { hasValidPayment: false };
        }
        
        const json = await response.json();
        const data = json.data || {};
        return { 
            hasValidPayment: data.hasValidPayment || data.isActive || false 
        };
    } catch (error) {
        console.error('Error checking payment status:', error);
        return { hasValidPayment: false, error: 'Failed to check payment status' };
    }
}

/**
 * Check if user has business setup complete
 * Returns true if user has business configured in their account
 */
export function hasBusinessSetup(): boolean {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    
    // Check if business exists in user info
    const business = userInfo.business || userInfo.business_id;
    return !!business;
}
