import { Iosec, IosecOptions } from './iosec'
import { Widget } from './util'
import { Iocaptcha, CaptchaOptions, scan_and_render } from './iocaptcha'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    config: object
    callbacks: Record<string, undefined | ((data: any) => null)>
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
   * Whether to immediately scan the page for iocaptcha & iosec elements, or wait for the user to call `iocom.scan()`. (Default: true)
   */
  scan_immediately: true,
  /**
   * Custom ORIGIN UI url
   */
  origin: 'https://io-sec.com'
}

export { Iosec, IosecOptions, Iocaptcha, CaptchaOptions, Widget, scan_and_render }

try {
  const G = window ?? global
  G.config = CONFIG
  G.callbacks = {}
} catch (_) { }
