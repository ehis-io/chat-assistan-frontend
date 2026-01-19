'use client';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

/* ================= TYPES ================= */

export interface MetaAuthResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
    expiresIn: string;
    signedRequest: string;
    graphDomain: string;
    grantedScopes: string;
  };
  status?: 'connected' | 'not_authorized' | 'unknown';
}

export interface BusinessData {
    name: string;
    type: string;
    description: string;
    whatYouOffer: string;
    contactInfo: string;
    availability: string;
    pricing: string;
    deliveryOptions: string;
    policies: string;
    commonQuestions: string;
}

/* ================= SDK LOADER ================= */

export const loadMetaSdk = (appId: string): Promise<void> => {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        status: false,
        xfbml: false,
        version: 'v21.0'
      });
      resolve();
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.body.appendChild(script);
  });
};

/* ================= LOGIN ================= */

export const loginWithPermissions = (
  scopes: string[]
): Promise<{ accessToken: string }> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Meta SDK not loaded'));
      return;
    }

    window.FB.login(
      (response: MetaAuthResponse) => {
        if (response.authResponse?.accessToken) {
          resolve({ accessToken: response.authResponse.accessToken });
        } else {
          reject(new Error('User cancelled login or denied permissions'));
        }
      },
      {
        scope: scopes.join(','),
      }
    );
  });
};

/* ================= EMBEDDED SIGNUP ================= */

export const launchEmbeddedSignup = (): Promise<MetaAuthResponse> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Meta SDK not loaded'));
      return;
    }

    window.FB.login(
      (response: MetaAuthResponse) => {
        resolve(response);
      },
      {
        scope: 'whatsapp_business_management,whatsapp_business_messaging',
        extras: {
          feature: 'whatsapp_embedded_signup'
        }
      }
    );
  });
};

/* ================= GRAPH HELPERS ================= */

export const fetchBusinesses = (accessToken: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    window.FB.api(
      '/me/businesses',
      'GET',
      { access_token: accessToken },
      (res: any) => {
        if (res?.error) reject(res.error);
        else resolve(res.data || []);
      }
    );
  });
};

export const fetchWabasForBusiness = (
  businessId: string,
  accessToken: string
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    // We try to fetch from multiple edges to cover both owned and client accounts
    const edges = ['owned_whatsapp_business_accounts', 'client_whatsapp_business_accounts'];
    const results: any[] = [];
    let pendingCount = edges.length;
    let lastError: any = null;

    edges.forEach(edge => {
      window.FB.api(
        `/${businessId}/${edge}`,
        'GET',
        { access_token: accessToken },
        (res: any) => {
          pendingCount--;
          if (res?.error) {
            console.warn(`Meta API warning for edge ${edge}:`, res.error);
            lastError = res.error;
          } else if (res?.data) {
            results.push(...res.data);
          }

          if (pendingCount === 0) {
            if (results.length > 0) {
              resolve(results);
            } else if (lastError && lastError.code !== 100) {
              // If we have no results and a "real" error (not field non-existence), reject
              reject(lastError);
            } else {
              // If both edges failed or returned nothing
              resolve([]);
            }
          }
        }
      );
    });
  });
};

export const fetchPhoneNumbers = (
  wabaId: string,
  accessToken: string
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    window.FB.api(
      `/${wabaId}/phone_numbers`,
      'GET',
      { access_token: accessToken },
      (res: any) => {
        if (res?.error) reject(res.error);
        else resolve(res.data || []);
      }
    );
  });
};

/* ================= BACKEND INTEGRATION ================= */

/**
 * Link WhatsApp Business account to the user's account in the backend
 * @param shortLivedToken The access token received from Meta login
 * @returns Response from the backend
 */
export const linkWhatsAppBusinessInBackend = async (shortLivedToken: string): Promise<any> => {
  const { getToken } = require('./auth');
  const token = getToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

  if (!token) {
    throw new Error('User is not authenticated');
  }
  
  const response = await fetch(`${baseUrl}/user/link-whatsapp-business`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ shortLivedToken })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to link WhatsApp Business account');
  }

  const responseData = await response.json();

  // Update local user info if returned by backend
  // This ensures the frontend immediately knows the status is CONNECTED
  if (responseData && (responseData.user || (responseData.data && responseData.data.user))) {
    try {
      // Use require to capture the latest version of auth utils
      const { setUserInfo } = require('./auth');
      const updatedUser = responseData.user || responseData.data.user;
      setUserInfo(updatedUser);
    } catch (e) {
      console.error('Failed to update local user info:', e);
    }
  }

  return responseData;
};

/**
 * Update the business profile and knowledge base in the backend
 * @param businessData The collected business data
 * @returns Response from the backend
 */
export const updateBusinessInBackend = async (businessData: BusinessData): Promise<any> => {
  const { getToken, getUserInfo } = require('./auth');
  const token = getToken();
  const userInfo = getUserInfo();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

  if (!token) {
    throw new Error('User is not authenticated');
  }

  // Use business ID from user info if available, otherwise it might be a new business creation
  const businessId = userInfo?.business?.id || userInfo?.business_id;
  const endpoint = businessId ? `${baseUrl}/business/${businessId}` : `${baseUrl}/user/create-business`;
  const method = businessId ? 'PATCH' : 'POST';
  
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(businessData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update business data');
  }

  return await response.json();
};
