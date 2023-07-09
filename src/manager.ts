import * as captcha from './iocaptcha'
import * as iosec from './iosec'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    iocom: object
    callbacks: Record<string, undefined | ((data: any) => null)>
  }
}

/**
 * @description The main API object used to access:
 *
 * - `[this.captcha]`       the captcha api
 * - `[this.iosec]`         the iosec api
 * - `[this.CONFIG]`        the API configuration
 */
export const iocom = {
  captcha,
  iosec,
  CONFIG: {
    /**
     * Whether to throw errors, or return them via respective functions. (Default: false)
     */
    throw_errors: false,
    /**
     * Whether to immediately scan the page for iocaptcha & iosec elements, or wait for the user to call `iocom.scan()`. (Default: true)
     */
    scan_immediately: true
  }
}

try {
  const G = window ?? global
  G.iocom = iocom
} catch (_) {
  Object.defineProperty(window, 'iocom', iocom)
}
