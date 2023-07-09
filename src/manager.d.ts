import { Iosec, IosecOptions } from './iosec';
import { Widget } from './util';
import { Iocaptcha, CaptchaOptions, scan_and_render } from './iocaptcha';
declare global {
    interface Window {
        config: object;
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
export declare const CONFIG: {
    /**
     * Whether to throw errors, or return them via respective functions. (Default: false)
     */
    throw_errors: boolean;
    /**
     * Whether to immediately scan the page for iocaptcha & iosec elements, or wait for the user to call `iocom.scan()`. (Default: true)
     */
    scan_immediately: boolean;
};
declare const _default: {
    Iosec: typeof Iosec;
    IosecOptions: typeof IosecOptions;
    Iocaptcha: typeof Iocaptcha;
    CaptchaOptions: typeof CaptchaOptions;
    Widget: typeof Widget;
    scan_and_render: typeof scan_and_render;
};
export default _default;
