import { error, ORIGIN, rnd_str, UI_URL } from "./util";
import { iocom } from "./manager";
class Widget {
    constructor(window, formfield, id) {
        this.window = window;
        this.formfield = formfield;
        this.id = id;
        this.window = window;
        this.formfield = formfield;
        this.id = id;
    }
}
export function render(element) {
    let pubkey = element.getAttribute("data-pubkey");
    if (pubkey == null)
        return error("io-captcha: missing data-pubkey attribute, can't continue");
    let callback = element.getAttribute("data-callback-solve") || "";
    let cb = window.callbacks[callback];
    let callbackError = element.getAttribute("data-callback-error") || "";
    let cb_error = window.callbacks[callbackError];
    let widgetid = element.getAttribute("data-widgetid") || rnd_str(5);
    let theme = element.getAttribute("data-theme") || "light";
    let scale = parseFloat(element.getAttribute("data-scale") || "1.0");
    let font = element.getAttribute("data-font") || "roboto";
    let formfield = window.document.createElement("input");
    formfield.hidden = true;
    element.appendChild(formfield);
    let iframe = window.document.createElement("iframe");
    iframe.src = UI_URL;
    iframe.style.overflow = "visible";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    element.appendChild(iframe);
    if (!iframe.contentWindow)
        return error("io-captcha: iframe.contentWindow is null");
    let widget = new Widget(iframe.contentWindow, formfield, widgetid);
    iframe.onload = () => {
        var _a, _b, _c, _d, _e;
        (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
            method: "set_pubkey",
            pubkey: pubkey
        }, { targetOrigin: UI_URL });
        (_b = iframe.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage({
            method: "set_widgetid",
            widgetid: widgetid
        }, { targetOrigin: UI_URL });
        (_c = iframe.contentWindow) === null || _c === void 0 ? void 0 : _c.postMessage({
            method: "set_theme",
            theme: theme
        }, { targetOrigin: UI_URL });
        (_d = iframe.contentWindow) === null || _d === void 0 ? void 0 : _d.postMessage({
            method: "set_scale",
            scale: scale
        }, { targetOrigin: UI_URL });
        (_e = iframe.contentWindow) === null || _e === void 0 ? void 0 : _e.postMessage({
            method: "set_font",
            font: font
        }, { targetOrigin: UI_URL });
        window.addEventListener("message", (e) => {
            var _a;
            // verify origin url
            if (e.origin.toString() !== ORIGIN.toString()) {
                return;
            }
            let data = e.data;
            if (data.id !== widgetid) {
                return;
            }
            if (data.method === "set_pass_uuid") {
                set_form_field(widget, data.uuid);
                if (callback != null) {
                    setTimeout(() => {
                        if (cb)
                            cb(data.uuid);
                    });
                }
            }
            else if (data.method === "set_error") {
                if (cb_error != null) {
                    setTimeout(() => {
                        if (cb_error)
                            cb_error(data.error);
                    });
                }
            }
            else if (data.method === "api_hello") {
                (_a = e.source) === null || _a === void 0 ? void 0 : _a.postMessage({
                    method: "hello_ui"
                }, { targetOrigin: "*" });
            }
            else if (data.method === "size_change") {
                resizeIframe(iframe, data.height, data.width);
            }
            else if (data.method === "dflex_size_change_complete") {
                element.style.paddingBottom = data.height.toString();
            }
        });
    };
    return widget;
}
function set_form_field(widget, uuid) {
    widget.formfield.setAttribute("iocaptcha-pass-uuid", uuid);
}
function resizeIframe(iframe, h, w) {
    iframe.height = h;
    iframe.width = w;
}
/**
 * @returns {undefined}
 * @description Performs a scan of the DOM and renders everything again.
 * NOTE that this is already done once on startup, and is
 * not expected or intended to be used again.
 * <br>
 * The method is only provided for extremely rare edge cases.
 */
export function scan_and_render() {
    let divs = window.document.getElementsByClassName("io-captcha");
    for (let i = 0; i < divs.length; i++) {
        let div = divs[i];
        render(div);
    }
}
/**
 *
 * @param element {HTMLElement}
 * @param widgetid {string}
 * @param ops {CaptchaOptions}
 */
export function new_node(element, widgetid, ops) {
    let div = document.createElement("div");
    div.className = "io-captcha";
    div.setAttribute("data-widgetid", widgetid);
    div.setAttribute("data-pubkey", ops.pubkey);
    if (ops.callbackSolve) {
        let id = rnd_str(16);
        window.callbacks[id] = ops.callbackSolve;
        div.setAttribute("data-callback-solve", id);
    }
    if (ops.callbackError) {
        let id = rnd_str(16);
        window.callbacks[id] = ops.callbackError;
        div.setAttribute("data-callback-error", id);
    }
    div.setAttribute("data-theme", ops.theme);
    div.setAttribute("data-font", ops.font);
    div.setAttribute("data-scale", ops.scale.toString());
    element.appendChild(div);
    render(div);
    return div;
}
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
export class CaptchaOptions {
    constructor(pubkey, callbackSolve, callbackError, theme, font, scale) {
        this.pubkey = pubkey;
        this.callbackSolve = callbackSolve;
        this.callbackError = callbackError;
        this.theme = theme;
        this.font = font;
        this.scale = scale;
        /**
         * The pubkey to use for the widget. [public captcha key, https://iocaptcha.com/dashboard/endpoints]
         * @type {string}
         */
        this.pubkey = pubkey;
        /**
         * The callback to call when the widget is solved. The Pass UUID is passed into the callback.
         * @type {string}
         */
        this.callbackSolve = null;
        /**
         * The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
         * @type {string}
         */
        this.callbackError = null;
        /**
         * The theme to use for the widget. [light, dark, ...]
         * @type {string}
         */
        this.theme = theme;
        /**
         * The text font to use for the widget. [mono, serif, etc.]
         * @type {string}
         * @default "roboto"
         */
        this.font = font;
        /**
         * The scale to use for the widget. [1.0, 2.0, ...]
         * @type {float}
         */
        this.scale = scale;
    }
}
/**
 * @returns {CaptchaOptions} The default options for a captcha widget with a custom pubkey.
 * @class
 */
export function defaultOptions(key) {
    return new CaptchaOptions(key, null, null, 'light', "roboto", 1.0);
}
/**
 * The captcha object.
 * @class
 * @constructor
 * @public
 * @property {object} [widget] The widgets objects containing DOM-related data & methods.
 */
class Iocaptcha {
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
    create(target, id, options) {
        options = options instanceof CaptchaOptions ? options : defaultOptions(options);
        id = id || rnd_str(16);
        let div = document.querySelector(target);
        if (div === null) {
            let err = new Error('Target element not found.');
            if (iocom.CONFIG.throw_errors) {
                throw err;
            }
            else {
                return err;
            }
        }
        let node = new_node(div, id, options);
        render(node);
    }
}
window.document.addEventListener("DOMContentLoaded", () => {
    if (iocom.CONFIG.scan_immediately)
        scan_and_render();
});
