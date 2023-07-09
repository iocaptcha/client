import * as util from "./util";
import { iocom } from "./manager";
import { error, rnd_str } from "./util";
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
export class IosecOptions {
    constructor(pubkey, action, callbackTokenRefresh, callbackError) {
        this.pubkey = pubkey;
        this.action = action;
        this.callbackTokenRefresh = callbackTokenRefresh;
        this.callbackError = callbackError;
        /**
         * The pubkey to use for the widget. [public key, https://iocaptcha.com/dashboard/endpoints]
         * @type {string}
         */
        this.pubkey = pubkey;
        /**
         * The action to use for the widget. [login, register, ...]
         * @type {string}
         */
        this.action = action;
        /**
         * The callback to call each time a new iosec token is generated. The token is passed into the callback as a string.
         * NOTE: This is called every few seconds after the widget is initialized, so you have to keep this value updated at all times,
         * so the token stays valid.
         * @type {string}
         */
        this.callbackTokenRefresh = null;
        /**
         * The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
         * @type {string}
         */
        this.callbackError = null;
    }
}
const EVENT_TYPES = ["new_pass_uuid"];
class Iosec {
    constructor(id, options, formfield, iframe) {
        this.id = id;
        this.options = options;
        this.formfield = formfield;
        this.iframe = iframe;
        this.events = {};
        this.id = id;
        this.options = options;
        this.formfield = formfield;
        this.iframe = iframe;
    }
    /**
     * Connect an event to this widget.
     * Possible events:
     * - `new_pass_uuid` - called when a new pass_uuid is set internally
     * @param event
     * @param callback
     */
    connect(event, callback) {
        if (EVENT_TYPES.indexOf(event) == -1)
            return error(`Invalid event type: ${event}, possible events: ${EVENT_TYPES.join(", ")}`);
        if (this.events[event] == undefined)
            this.events[event] = [];
        this.events[event].push(callback);
    }
    /**
     * Set the pass UUID for this widget.
     * <br>
     * **This is called automatically, it is not recommended to call this manually.**
     * <br><br>
     * However, we still expose this method for custom edge-cases, such as when you want to reuse a previous pass_uuid.
     * @param {string} pass_uuid
     */
    set_pass_uuid(pass_uuid) {
        this.formfield.setAttribute("iosec-pass-uuid", pass_uuid);
    }
    /**
     * Start the iosec widget.
     * Upon starting, the widget immediately begins bot verification & constant, automatic pass_uuid updates.
     * @param action
     */
    start(action) {
        var _a;
        (_a = this.iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
            method: "start_iosec",
            action: action
        }, { targetOrigin: util.UI_URL });
    }
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
    create(target, id, options) {
        id = id || util.rnd_str(16);
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
export function render(element) {
    let pubkey = element.getAttribute("data-pubkey");
    if (pubkey == null)
        return error("io-sec: missing data-pubkey attribute, can't continue");
    let callback = element.getAttribute("data-callback-token-refresh") || "";
    let cb = window.callbacks[callback];
    let callbackError = element.getAttribute("data-callback-error") || "";
    let cb_error = window.callbacks[callbackError];
    let widgetid = element.getAttribute("data-widgetid") || util.rnd_str(5);
    let action = element.getAttribute("data-action") || "unspecified";
    let options = new IosecOptions(pubkey, action, cb, cb_error);
    let formfield = window.document.createElement("input");
    formfield.hidden = true;
    element.appendChild(formfield);
    let iframe = window.document.createElement("iframe");
    iframe.src = util.UI_URL;
    iframe.hidden = true;
    element.appendChild(iframe);
    let widget = new Iosec(widgetid, options, formfield, iframe);
    iframe.onload = () => {
        var _a, _b, _c;
        (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
            method: "set_pubkey_iosec",
            pubkey: pubkey
        }, { targetOrigin: util.UI_URL });
        (_b = iframe.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage({
            method: "set_widgetid_iosec",
            widgetid: widgetid
        }, { targetOrigin: util.UI_URL });
        (_c = iframe.contentWindow) === null || _c === void 0 ? void 0 : _c.postMessage({
            method: "set_action_iosec",
            action: action
        }, { targetOrigin: util.UI_URL });
        window.addEventListener("message", (e) => {
            var _a;
            // verify origin url
            if (e.origin.toString() !== util.ORIGIN.toString()) {
                return;
            }
            let { id, method, uuid } = e.data;
            if (id !== widgetid) {
                return;
            }
            if (method === "set_pass_uuid") {
                widget.set_pass_uuid(uuid);
                if (callback != null) {
                    setTimeout(() => {
                        try {
                            window.callbacks[callback].apply(null, [uuid]);
                        }
                        catch (e) {
                            console.error(`io-sec callback-refresh-token error, widget-id: ${widgetid}, message: `, e);
                        }
                    });
                }
            }
            else if (method == "api_hello") {
                (_a = e.source) === null || _a === void 0 ? void 0 : _a.postMessage({
                    method: "hello_ui"
                }, { targetOrigin: "*" });
            }
        });
    };
    return widget;
}
export function new_node(element, widgetid, ops) {
    let div = document.createElement("div");
    div.className = "io-sec";
    div.setAttribute("data-widgetid", widgetid);
    div.setAttribute("data-pubkey", ops.pubkey);
    div.setAttribute("data-action", ops.action);
    if (ops.callbackTokenRefresh) {
        let id = rnd_str(16);
        window.callbacks[id] = ops.callbackTokenRefresh;
        div.setAttribute("data-callback-token-refresh", id);
    }
    if (ops.callbackError) {
        let id = rnd_str(16);
        window.callbacks[id] = ops.callbackError;
        div.setAttribute("data-callback-error", id);
    }
    element.appendChild(div);
    render(div);
    return div;
}
