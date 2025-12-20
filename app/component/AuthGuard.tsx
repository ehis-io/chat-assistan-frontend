"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin, logout } from "@/lib/utils/auth";

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
}

/**
 * Client-side authentication guard component
 * Checks for valid JWT token and optionally checks for admin role
 */
export default function AuthGuard({ children, requireAuth = true, requireAdmin = false }: AuthGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            if (requireAuth) {
                const authenticated = isAuthenticated();

                if (!authenticated) {
                    // Token is missing or expired, redirect to login
                    logout('/login?session=expired');
                    return;
                }

                // If admin role is required, check for it
                if (requireAdmin) {
                    const userIsAdmin = isAdmin();

                    if (!userIsAdmin) {
                        // User is authenticated but not an admin
                        // Redirect to dashboard with access denied message
                        if (typeof window !== 'undefined') {
                            window.location.href = '/dashboard?error=access_denied';
                        }
                        return;
                    }
                }

                setIsAuthorized(true);
            } else {
                setIsAuthorized(true);
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [requireAuth, requireAdmin, router]);

    // Show loading state while checking authentication
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // Only render children if authorized
    return isAuthorized ? <>{children}</> : null;
}
