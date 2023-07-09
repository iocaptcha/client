import { iocom } from './manager';
export const DEBUG = true;
// TODO: add support for multiple origins (eu-prod, us-prod) & fallbacks
export const ORIGIN = DEBUG ? 'http://127.0.0.1:4173' : 'https://eu-prod.iocaptcha.com';
export const UI_URL = ORIGIN + '/index.html';
export var WidgetType;
(function (WidgetType) {
    WidgetType[WidgetType["Iosec"] = 0] = "Iosec";
    WidgetType[WidgetType["Iocaptcha"] = 1] = "Iocaptcha";
})(WidgetType || (WidgetType = {}));
export class Widget {
    constructor(type, formfield, id, iframe) {
        this.type = type;
        this.formfield = formfield;
        this.id = id;
        this.iframe = iframe;
    }
    /**
     * Start the widget.
     * @param action
     */
    start(action) {
        var _a;
        if (this.type === WidgetType.Iosec) {
            (_a = this.iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
                method: 'start_iosec',
                action
            }, { targetOrigin: UI_URL });
        }
        else {
            return error('widget: Attempted to start an iocaptcha widget (which start automatically). Only iosec widgets can be manually started.');
        }
    }
}
export function rnd_str(len) {
    return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substring(0, len);
}
export function error(msg) {
    const error = new Error(msg);
    if (iocom.CONFIG.throw_errors)
        throw error;
    return error;
}
