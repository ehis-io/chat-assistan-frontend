"use client";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export const loadMetaSdk = (appId: string) => {
  return new Promise<void>((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v21.0'
      });
      resolve();
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      (js as any).src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

export const launchEmbeddedSignup = () => {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject(new Error("FB SDK not loaded"));
            return;
        }

        window.FB.login((response: any) => {
            if (response.authResponse) {
                // The code and assets are returned via message events, 
                // but this callback confirms the window was launched/closed.
                console.log("FB Login response:", response);
                resolve(response);
            } else {
                reject(new Error("User cancelled login or did not fully authorize."));
            }
        }, {
            scope: 'whatsapp_business_management,whatsapp_business_messaging',
            extras: {
                feature: 'whatsapp_embedded_signup',
                setup: {
                    // Pre-fill data can go here if needed
                }
            }
        });
    });
};

export const loginWithPermissions = (scopes: string[]) => {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject(new Error("FB SDK not loaded"));
            return;
        }

        window.FB.login((response: any) => {
            if (response.authResponse) {
                resolve(response.authResponse);
            } else {
                reject(new Error("User cancelled login or did not fully authorize."));
            }
        }, { scope: scopes.join(',') });
    });
};

export const fetchWabAs = async (accessToken: string) => {
    return new Promise((resolve, reject) => {
        window.FB.api(
            '/me/whatsapp_business_accounts',
            'GET',
            { access_token: accessToken },
            (response: any) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.data);
                }
            }
        );
    });
};

export const fetchPhoneNumbers = async (wabaId: string, accessToken: string) => {
    return new Promise((resolve, reject) => {
        window.FB.api(
            `/${wabaId}/phone_numbers`,
            'GET',
            { access_token: accessToken },
            (response: any) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.data);
                }
            }
        );
    });
};
