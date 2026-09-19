import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
    suppressErrorToast?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuthRedirect?: boolean;
    suppressErrorToast?: boolean;
  }
}
