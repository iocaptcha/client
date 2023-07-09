import { IosecOptions } from './iosec';
import { CaptchaOptions } from './iocaptcha';
export declare const DEBUG = true;
export declare const ORIGIN: string;
export declare const UI_URL: string;
export declare enum WidgetType {
    Iosec = 0,
    Iocaptcha = 1
}
export declare class Widget {
    type: WidgetType;
    ops: IosecOptions | CaptchaOptions;
    formfield: HTMLInputElement;
    id: string;
    iframe: HTMLIFrameElement;
    constructor(type: WidgetType, ops: IosecOptions | CaptchaOptions, formfield: HTMLInputElement, id: string, iframe: HTMLIFrameElement);
    /**
     * Start the widget. Only applicable to iosec widget types.
     */
    start(): undefined | Error;
}
export declare function rnd_str(len: number): string;
export declare function error(msg: string): Error;
