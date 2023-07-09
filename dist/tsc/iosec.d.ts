/**
 * Options data regarding a captcha widget.
 * @class
 * @constructor
 * @public
 * @property {string} [pubkey] The public key of the endpoint the widget is associated with.
 * @property {string} [action] The action to use for the widget. [login, register, ...] - https://iocaptcha.com/explorer/
 * @property {string} [callback-token-refresh] The callback to call when a new token is generated. The Pass UUID is passed into the callback every few seconds.
 * @property {string} [callback-error] The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
 */
export declare class IosecOptions {
    pubkey: string;
    action: string;
    callbackTokenRefresh: Function | null;
    callbackError: Function | null;
    constructor(pubkey: string, action: string, callbackTokenRefresh: Function | null, callbackError: Function | null);
}
declare class Iosec {
    id: string;
    options: IosecOptions;
    formfield: HTMLInputElement;
    iframe: HTMLIFrameElement;
    constructor(id: string, options: IosecOptions, formfield: HTMLInputElement, iframe: HTMLIFrameElement);
    private events;
    /**
     * Connect an event to this widget.
     * Possible events:
     * - `new_pass_uuid` - called when a new pass_uuid is set internally
     * @param event
     * @param callback
     */
    connect(event: string, callback: Function): Error | undefined;
    /**
     * Set the pass UUID for this widget.
     * <br>
     * **This is called automatically, it is not recommended to call this manually.**
     * <br><br>
     * However, we still expose this method for custom edge-cases, such as when you want to reuse a previous pass_uuid.
     * @param {string} pass_uuid
     */
    set_pass_uuid(pass_uuid: string): void;
    /**
     * Start the iosec widget.
     * Upon starting, the widget immediately begins bot verification & constant, automatic pass_uuid updates.
     * @param action
     */
    start(action: string): void;
    /**
     * @param {string} [target] The target query selector that the new widget will be placed in. ['.wrapper', '#captcha-container', ...]
     * @param {string|undefined} [id] The id that will be assigned to this widget.
     * @param {IosecOptions|string} [options] The options to use for this widget, or a string containing the public key for an endpoint.
     * <br>
     * @returns {Iosec|Error} `[this]` The captcha object, or an error if the widget could not be created. [assuming CONFIG.throw_errors is disabled]
     * @description Creates a new iosec widget that is appended to the target element.
     * <br>
     * @example
     *
     */
    create(target: string, id: string, options: IosecOptions): Error | undefined;
}
export declare function render(element: HTMLElement): Iosec | Error;
export declare function new_node(element: HTMLElement, widgetid: string, ops: IosecOptions): HTMLDivElement;
export {};
