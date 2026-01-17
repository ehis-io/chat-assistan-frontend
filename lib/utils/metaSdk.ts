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
      resolve();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
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
      (response: any) => {
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

    window.FB.login(
      (response: any) => {
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
