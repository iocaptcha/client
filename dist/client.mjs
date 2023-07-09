// TODO: add support for multiple origins (eu-prod, us-prod) & fallbacks
function UI_URL() {
    return CONFIG.origin + '/index.html';
}
var WidgetType;
(function (WidgetType) {
    WidgetType[WidgetType["Iosec"] = 0] = "Iosec";
    WidgetType[WidgetType["Iocaptcha"] = 1] = "Iocaptcha";
})(WidgetType || (WidgetType = {}));
class Widget {
    constructor(type, ops, formfield, id, iframe, parent) {
        this.type = type;
        this.ops = ops;
        this.formfield = formfield;
        this.id = id;
        this.iframe = iframe;
        this.parent = parent;
    }
}
function rnd_str(len) {
    return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substring(0, len);
}
function error(msg) {
    const error = new Error(msg);
    if (CONFIG.throw_errors)
        throw error;
    return error;
}
function send(iframe, data) {
    var _a;
    (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage(data, { targetOrigin: "*" });
}

/**
 * Options data regarding a captcha widget.
 * @class
 * @constructor
 * @public
 * @property {string} [pubkey] The public key of the endpoint the widget is associated with.
 * @property {string} [action] The action to use for the widget. [login, register, ...] - https://iocaptcha.com/explorer/
 * @property {string} [callbackTokenRefresh] The callback to call when a new token is generated. The Pass UUID is passed into the callback every few seconds.
 * @property {string} [callbackError] The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
 */
class IosecOptions {
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
    }
}
const EVENT_TYPES = ['new_pass_uuid'];
class Iosec {
    constructor() {
        this.events = {};
    }
    /**
     * Connect an event to this widget.
     * Possible events:
     * - `new_pass_uuid` - called when a new pass_uuid is set internally
     * @param event
     * @param callback
     */
    connect(event, callback) {
        if (!EVENT_TYPES.includes(event)) {
            return error(`Invalid event type: ${event}, possible events: ${EVENT_TYPES.join(', ')}`);
        }
        if (this.events[event] === undefined)
            this.events[event] = [];
        this.events[event].push(callback);
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
        id = id !== null && id !== void 0 ? id : rnd_str(16);
        const div = document.querySelector(target);
        if (div === null) {
            const err = new Error('Target element not found.');
            if (CONFIG.throw_errors) {
                throw err;
            }
            else {
                return err;
            }
        }
        const node = new_node$1(div, id, options);
        return render$1(node);
    }
}
function render$1(element) {
    var _a, _b, _c, _d;
    const pubkey = element.getAttribute('data-pubkey');
    if (pubkey == null)
        return error("io-sec: missing data-pubkey attribute, can't continue");
    const callback = (_a = element.getAttribute('data-callback-token-refresh')) !== null && _a !== void 0 ? _a : '';
    const cb = window.callbacks[callback];
    const callback_error = (_b = element.getAttribute('data-callback-error')) !== null && _b !== void 0 ? _b : '';
    const cb_error = window.callbacks[callback_error];
    const widgetid = (_c = element.getAttribute('data-widgetid')) !== null && _c !== void 0 ? _c : rnd_str(5);
    const action = (_d = element.getAttribute('data-action')) !== null && _d !== void 0 ? _d : 'unspecified';
    const formfield = window.document.createElement('input');
    formfield.hidden = true;
    element.appendChild(formfield);
    const iframe = window.document.createElement('iframe');
    iframe.src = UI_URL();
    iframe.hidden = true;
    element.appendChild(iframe);
    const options = new IosecOptions(pubkey, action, cb, cb_error);
    const widget = new Widget(WidgetType.Iosec, options, formfield, widgetid, iframe, element);
    iframe.onload = () => {
        send(iframe, {
            method: 'set_pubkey_iosec',
            pubkey
        });
        send(iframe, {
            method: 'set_widgetid_iosec',
            widgetid
        });
        send(iframe, {
            method: 'set_action_iosec',
            action
        });
        send(iframe, {
            method: 'start_iosec'
        });
        window.addEventListener('message', (e) => {
            var _a;
            // verify origin url
            if (e.origin.toString() !== CONFIG.origin.toString()) {
                return;
            }
            const { id, method, uuid } = e.data;
            if (id !== widgetid) {
                return;
            }
            if (method === 'set_pass_uuid') {
                if (cb !== undefined) {
                    setTimeout(() => {
                        cb(uuid);
                    });
                }
            }
            else if (method === 'set_error') {
                // todo this is never called from the hook yet, since errors are handled gracefully
                // todo keep handling them gracefully, but send errors back anyway
                if (cb_error != null) {
                    setTimeout(() => {
                        if (cb_error != null)
                            cb_error(error);
                    });
                }
            }
            else if (method === 'api_hello') {
                (_a = e.source) === null || _a === void 0 ? void 0 : _a.postMessage({
                    method: 'hello_ui'
                }, { targetOrigin: '*' });
            }
        });
    };
    return widget;
}
function new_node$1(element, widgetid, ops) {
    const div = document.createElement('div');
    div.className = 'io-sec';
    div.setAttribute('data-widgetid', widgetid);
    div.setAttribute('data-pubkey', ops.pubkey);
    div.setAttribute('data-action', ops.action);
    if (ops.callbackTokenRefresh != null) {
        const id = rnd_str(16);
        window.callbacks[id] = ops.callbackTokenRefresh;
        div.setAttribute('data-callback-token-refresh', id);
    }
    if (ops.callbackError != null) {
        const id = rnd_str(16);
        window.callbacks[id] = ops.callbackError;
        div.setAttribute('data-callback-error', id);
    }
    element.appendChild(div);
    return div;
}

function render(element) {
    var _a, _b, _c, _d, _e, _f;
    const pubkey = element.getAttribute('data-pubkey');
    if (pubkey == null)
        return error("io-captcha: missing data-pubkey attribute, can't continue");
    const callback = (_a = element.getAttribute('data-callback-solve')) !== null && _a !== void 0 ? _a : '';
    const cb = window.callbacks[callback];
    const callback_error = (_b = element.getAttribute('data-callback-error')) !== null && _b !== void 0 ? _b : '';
    const cb_error = window.callbacks[callback_error];
    const widgetid = (_c = element.getAttribute('data-widgetid')) !== null && _c !== void 0 ? _c : rnd_str(5);
    const theme = (_d = element.getAttribute('data-theme')) !== null && _d !== void 0 ? _d : 'light';
    const scale = parseFloat((_e = element.getAttribute('data-scale')) !== null && _e !== void 0 ? _e : '1.0');
    const font = (_f = element.getAttribute('data-font')) !== null && _f !== void 0 ? _f : 'roboto';
    const formfield = window.document.createElement('input');
    formfield.hidden = true;
    element.appendChild(formfield);
    const iframe = window.document.createElement('iframe');
    iframe.src = UI_URL();
    iframe.style.overflow = 'visible';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    element.appendChild(iframe);
    if (iframe.contentWindow == null)
        return error('io-captcha: iframe.contentWindow is null');
    const options = new CaptchaOptions(pubkey, cb, cb_error, theme, font, scale);
    const widget = new Widget(WidgetType.Iocaptcha, options, formfield, widgetid, iframe, element);
    iframe.onload = () => {
        send(iframe, {
            method: 'set_pubkey',
            pubkey
        });
        send(iframe, {
            method: 'set_widgetid',
            widgetid
        });
        send(iframe, {
            method: 'set_theme',
            theme
        });
        send(iframe, {
            method: 'set_scale',
            scale
        });
        send(iframe, {
            method: 'set_font',
            font
        });
        window.addEventListener('message', (e) => {
            var _a;
            // verify origin url
            if (e.origin.toString() !== CONFIG.origin.toString()) {
                return;
            }
            const data = e.data;
            if (data.id !== widgetid) {
                return;
            }
            if (data.method === 'set_pass_uuid') {
                set_form_field(widget, data.uuid);
                if (callback != null) {
                    setTimeout(() => {
                        if (cb != null)
                            cb(data.uuid);
                    });
                }
            }
            else if (data.method === 'set_error') {
                if (cb_error != null) {
                    setTimeout(() => {
                        if (cb_error != null)
                            cb_error(data.error);
                    });
                }
            }
            else if (data.method === 'api_hello') {
                (_a = e.source) === null || _a === void 0 ? void 0 : _a.postMessage({
                    method: 'hello_ui'
                }, { targetOrigin: '*' });
            }
            else if (data.method === 'size_change') {
                resizeIframe(iframe, data.height, data.width);
            }
            else if (data.method === 'dflex_size_change_complete') {
                element.style.paddingBottom = data.height.toString();
            }
        });
    };
    return widget;
}
function set_form_field(widget, uuid) {
    widget.formfield.setAttribute('iocaptcha-pass-uuid', uuid);
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
function scan_and_render() {
    const divs = window.document.getElementsByClassName('io-captcha');
    for (let i = 0; i < divs.length; i++) {
        const div = divs[i];
        render(div);
    }
}
/**
 *
 * @param element {HTMLElement}
 * @param widgetid {string}
 * @param ops {CaptchaOptions}
 */
function new_node(element, widgetid, ops) {
    const div = document.createElement('div');
    div.className = 'io-captcha';
    div.setAttribute('data-widgetid', widgetid);
    div.setAttribute('data-pubkey', ops.pubkey);
    if (ops.callbackSolve !== null) {
        const id = rnd_str(16);
        window.callbacks[id] = ops.callbackSolve;
        div.setAttribute('data-callback-solve', id);
    }
    if (ops.callbackError !== null) {
        const id = rnd_str(16);
        window.callbacks[id] = ops.callbackError;
        div.setAttribute('data-callback-error', id);
    }
    div.setAttribute('data-theme', ops.theme);
    div.setAttribute('data-font', ops.font);
    div.setAttribute('data-scale', ops.scale.toString());
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
 * @property {string} [callbackSolve] The callback to call when the widget is solved. The Pass UUID is passed into the callback.
 * @property {string} [callbackError] The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
 * @property {string} [theme] The theme of the widget. [light, dark, ...] - https://iocaptcha.com/explorer/
 * @property {string} [font] The font style of the widget. [roboto, mono, ...] - https://iocaptcha.com/explorer/
 * @property {number} [scale] The scale of the widget. [float]
 */
class CaptchaOptions {
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
function defaultOptions(key) {
    return new CaptchaOptions(key, undefined, undefined, 'light', 'roboto', 1.0);
}
/**
 * The captcha object.
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
        id = id !== null && id !== void 0 ? id : rnd_str(16);
        const div = document.querySelector(target);
        if (div === null) {
            return error('Target element not found.');
        }
        const node = new_node(div, id, options);
        return render(node);
    }
}
window.document.addEventListener('DOMContentLoaded', () => {
    if (CONFIG.scan_immediately)
        scan_and_render();
});

/**
 * @description The main API object used to access:
 *
 * - `[this.captcha]`       the captcha client
 * - `[this.iosec]`         the iosec client
 * - `[this.CONFIG]`        the API configuration
 */
const CONFIG = {
    /**
     * Whether to throw errors, or return them via respective functions. (Default: false)
     */
    throw_errors: false,
    /**
     * Whether to immediately scan the page for iocaptcha & iosec elements, or wait for the user to call `iocom.scan()`. (Default: true)
     */
    scan_immediately: true,
    /**
     * Custom ORIGIN UI url
     */
    origin: 'https://io-sec.com'
};
try {
    const G = window !== null && window !== void 0 ? window : global;
    G.config = CONFIG;
    G.callbacks = {};
}
catch (_) { }

export { CONFIG, CaptchaOptions, Iocaptcha, Iosec, IosecOptions, Widget, scan_and_render };
