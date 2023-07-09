declare class Widget {
    window: Window;
    formfield: HTMLInputElement;
    id: string;
    constructor(window: Window, formfield: HTMLInputElement, id: string);
}
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
    callbackSolve: Function | null;
    callbackError: Function | null;
    theme: string;
    font: string;
    scale: number;
    constructor(pubkey: string, callbackSolve: Function | null, callbackError: Function | null, theme: string, font: string, scale: number);
}
/**
 * @returns {CaptchaOptions} The default options for a captcha widget with a custom pubkey.
 * @class
 */
export declare function defaultOptions(key: string): CaptchaOptions;
export {};
