import { iocom } from "./manager";
export const DEBUG = true;
// TODO: add support for multiple origins (eu-prod, us-prod) & fallbacks
export const ORIGIN = DEBUG ? 'http://127.0.0.1:4173' : 'https://eu-prod.iocaptcha.com';
export const UI_URL = ORIGIN + '/index.html';
export function rnd_str(len) {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, len);
}
export function error(msg) {
    let error = new Error(msg);
    if (iocom.CONFIG.throw_errors)
        throw error;
    return error;
}
