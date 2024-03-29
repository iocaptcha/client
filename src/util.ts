import { CONFIG } from './manager'
import { type IosecOptions } from './iosec'
import type { CaptchaOptions } from './iocaptcha'

// TODO: add support for multiple origins (eu-prod, us-prod) & fallbacks
export function UI_URL (): string {
  return CONFIG.origin + '/index.html'
}

export enum WidgetType {
  Iosec,
  Iocaptcha
}
export class Widget {
  constructor (
    public type: WidgetType,
    public formfield: HTMLInputElement,
    public id: string,
    public iframe: HTMLIFrameElement,
    public parent: HTMLElement
  ) { }

  public end () {
    // unload iframe
    console.log('ending') // todo remove
    this.iframe.remove()
  }
}

export function rnd_str (len: number): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, len)
}

export function error (msg: string): Error {
  const error = new Error(msg)
  if (CONFIG.throw_errors) throw error
  return error
}

export function send (iframe: HTMLIFrameElement, data: object): void {
  iframe.contentWindow?.postMessage(data, { targetOrigin: '*' })
}
