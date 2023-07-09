import { iocom } from './manager'

export const DEBUG = true

// TODO: add support for multiple origins (eu-prod, us-prod) & fallbacks
export const ORIGIN = DEBUG ? 'http://127.0.0.1:4173' : 'https://eu-prod.iocaptcha.com'
export const UI_URL = ORIGIN + '/index.html'

export enum WidgetType {
  Iosec,
  Iocaptcha
}
export class Widget {
  constructor (
    public type: WidgetType,
    public formfield: HTMLInputElement,
    public id: string,
    public iframe: HTMLIFrameElement
  ) { }

  /**
   * Start the widget.
   * @param action
   */
  public start (action: string): undefined | Error {
    if (this.type === WidgetType.Iosec) {
      this.iframe.contentWindow?.postMessage(
        {
          method: 'start_iosec',
          action
        },
        { targetOrigin: UI_URL }
      )
    } else {
      return error('widget: Attempted to start an iocaptcha widget (which start automatically). Only iosec widgets can be manually started.')
    }
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
  if (iocom.CONFIG.throw_errors) throw error
  return error
}
