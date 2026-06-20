/// <reference types="vite/client" />

interface Window {
  google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: { access_token?: string; error?: string }) => void;
        }) => {
          requestAccessToken: (config: { prompt?: string }) => void;
          callback: (response: { access_token?: string; error?: string }) => void;
        };
        revoke: (token: string) => void;
      };
    };
  };
}
