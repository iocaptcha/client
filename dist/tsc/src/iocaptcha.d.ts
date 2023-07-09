import { Widget } from './util';
export declare function render(element: HTMLElement): Widget | Error;
/**
 * @returns {undefined}
 * @description Performs a scan of the DOM and renders everything again.
 * NOTE that this is already done once on startup, and is
 * not expected or intended to be used again.
 * <br>
 * The method is only provided for extremely rare edge cases.
 */
export declare function scan_and_render(): void;
/**
 *
 * @param element {HTMLElement}
 * @param widgetid {string}
 * @param ops {CaptchaOptions}
 */
export declare function new_node(element: HTMLElement, widgetid: string, ops: CaptchaOptions): HTMLDivElement;
/**
 * Options data regarding a captcha widget.
 * @class
 * @constructor
 * @public
 * @property {string} [pubkey] The public key of the endpoint the widget is associated with.
 * @property {string} [callback-solve] The callback to call when the widget is solved. The Pass UUID is passed into the callback.
 * @property {string} [callback-expire] The callback to call when the current Pass UUID expires. This means the user needs to solve the captcha again.
 * @property {string} [callback-error] The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
 * @property {string} [theme] The theme of the widget. [light, dark, ...] - https://iocaptcha.com/explorer/
 * @property {string} [text-style] The text style of the widget. [roboto, mono, ...] - https://iocaptcha.com/explorer/
 * @property {number} [scale] The scale of the widget. [float]
 */
export declare class CaptchaOptions {
    pubkey: string;
    callbackSolve: undefined | ((data: any) => null);
    callbackError: undefined | ((data: any) => null);
    theme: string;
    font: string;
    scale: number;
    constructor(pubkey: string, callbackSolve: undefined | ((data: any) => null), callbackError: undefined | ((data: any) => null), theme: string, font: string, scale: number);
}
/**
 * @returns {CaptchaOptions} The default options for a captcha widget with a custom pubkey.
 * @class
 */
export declare function defaultOptions(key: string): CaptchaOptions;
/**
 * The captcha object.
 */
export declare class Iocaptcha {
    /**
     * @param {string} [target] The target query selector that the new widget will be placed in. ['.wrapper', '#captcha-container', ...]
     * @param {string|undefined} [id] The id that will be assigned to this captcha widget.
     * @param {CaptchaOptions|string} [options] The options to use for this captcha widget, or a string containing the public key for an endpoint.
     * <br>
     * @returns {Iocaptcha|Error} `[this]` The captcha object, or an error if the widget could not be created. [assuming CONFIG.throw_errors is disabled]
     * @description Creates a new captcha widget that is appended to the target element.
     * <br>
     * @example
     * captcha.create('#captcha-container', 'login2', {
     *      pubkey: '...',
     *      callbackSolve: (uuid) => { ... },
     *      callbackError: (err) => { ... },
     *      theme: 'light',
     *      font: 'roboto',
     *      scale: 1.0
     * });
     */
    create(target: string, id: string, options: CaptchaOptions | string): Widget | Error;
}
