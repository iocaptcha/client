import * as captcha from './iocaptcha';
import * as iosec from './iosec';
declare global {
    interface Window {
        iocom: object;
        callbacks: Record<string, undefined | ((data: any) => null)>;
    }
}
/**
 * @description The main API object used to access:
 *
 * - `[this.captcha]`       the captcha client
 * - `[this.iosec]`         the iosec client
 * - `[this.CONFIG]`        the API configuration
 */
export declare const iocom: {
    captcha: typeof captcha;
    iosec: typeof iosec;
    CONFIG: {
        /**
         * Whether to throw errors, or return them via respective functions. (Default: false)
         */
        throw_errors: boolean;
        /**
         * Whether to immediately scan the page for iocaptcha & iosec elements, or wait for the user to call `iocom.scan()`. (Default: true)
         */
        scan_immediately: boolean;
    };
};
