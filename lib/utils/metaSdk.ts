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
    // If FB is already fully initialized, resolve immediately
    if (window.FB && window.FB.init) {
      console.log("Meta SDK already loaded and initialized.");
      resolve();
      return;
    }

    // If we've already defined fbAsyncInit, we're already waiting for load
    if (window.fbAsyncInit) {
      const originalInit = window.fbAsyncInit;
      window.fbAsyncInit = function() {
        originalInit();
        resolve();
      };
      return;
    }

    window.fbAsyncInit = function () {
      console.log("Initializing Meta SDK with App ID:", appId);
      window.FB.init({
        appId,
        cookie: false, // Set to false to avoid "overriding access token" warnings
        xfbml: false,
        version: 'v21.0'
      });
      console.log("Meta SDK initialized.");
      resolve();
    };

    console.log("Loading Meta SDK script...");
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

    console.log("Launching FB.login for Embedded Signup...");
    window.FB.login(
      (response: any) => {
        console.log("FB.login response received:", response);
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
