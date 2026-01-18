'use client';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

/* ================= SDK LOADER ================= */

export const loadMetaSdk = (appId: string): Promise<void> => {
  return new Promise((resolve) => {
    if (window.FB) {
      console.log('Meta SDK already loaded');
      resolve();
      return;
    }

    console.log('Initializing Meta SDK with App ID:', appId);
    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        status: false,
        xfbml: false,
        version: 'v21.0'
      });
      console.log('Meta SDK initialized successfully');
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

    console.log('Launching Meta login with permissions:', scopes);
    window.FB.login(
      (response: any) => {
        console.log('Meta login response:', response);
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

export const launchEmbeddedSignup = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Meta SDK not loaded'));
      return;
    }

    console.log('Launching Meta Embedded Signup flow');
    window.FB.login(
      (response: any) => {
        console.log('Meta Embedded Signup login callback response:', response);
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
    console.log('Fetching businesses...');
    window.FB.api(
      '/me/businesses',
      'GET',
      { access_token: accessToken },
      (res: any) => {
        console.log('Fetch businesses response:', res);
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
      console.log(`Fetching WABAs from edge: ${edge} for business: ${businessId}`);
      window.FB.api(
        `/${businessId}/${edge}`,
        'GET',
        { access_token: accessToken },
        (res: any) => {
          console.log(`Fetch WABAs response for edge ${edge}:`, res);
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
    console.log('Fetching phone numbers for WABA:', wabaId);
    window.FB.api(
      `/${wabaId}/phone_numbers`,
      'GET',
      { access_token: accessToken },
      (res: any) => {
        console.log('Fetch phone numbers response:', res);
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

  console.log('Linking WhatsApp Business in backend with token:', shortLivedToken);
  
  const response = await fetch(`${baseUrl}/business/link-whatsapp-business`, {
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

  return await response.json();
};
