import * as captcha from './iocaptcha';
import * as iosec from './iosec';
/**
 * @description The main API object used to access:
 *
 * - `[this.captcha]`       the captcha api
 * - `[this.iosec]`         the iosec api
 * - `[this.CONFIG]`        the API configuration
 */
export const iocom = {
    captcha,
    iosec,
    CONFIG: {
        /**
         * Whether to throw errors, or return them via respective functions. (Default: false)
         */
        throw_errors: false,
        /**
         * Whether to immediately scan the page for iocaptcha & iosec elements, or wait for the user to call `iocom.scan()`. (Default: true)
         */
        scan_immediately: true
    }
};
try {
    const G = window !== null && window !== void 0 ? window : global;
    G.iocom = iocom;
}
catch (_) {
    Object.defineProperty(window, 'iocom', iocom);
}
