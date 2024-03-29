import { Iosec, IosecOptions } from './iosec'
import { Widget, WidgetType } from './util'
import { Iocaptcha, CaptchaOptions, scan_and_render } from './iocaptcha'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    ioclient_callbacks: Record<string, undefined | ((data: any) => null)>
    iosec: Iosec
  }
}

/**
 * @description The main API object used to access:
 *
 * - `[this.captcha]`       the captcha client
 * - `[this.iosec]`         the iosec client
 * - `[this.CONFIG]`        the API configuration
 */
export const CONFIG = {
  /**
   * Whether to throw errors, or return them via respective functions. (Default: false)
   */
  throw_errors: false,
  /**
   * Whether to immediately scan the page for iocaptcha & iosec elements. (Default: true)
   */
  scan_immediately: true,
  /**
   * Custom ORIGIN UI url
   */
  origin: 'https://hook.io.software'
}

export { Iosec, IosecOptions, Iocaptcha, CaptchaOptions, Widget, WidgetType, scan_and_render }

try {
  const G = window
  G.ioclient_callbacks = {}
  G.iosec = new Iosec()
} catch (_) { }
