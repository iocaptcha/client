import { error, ORIGIN, rnd_str, UI_URL, Widget, WidgetType } from './util'
import { iocom } from './manager'

export function render (element: HTMLElement): Widget | Error {
  const pubkey = element.getAttribute('data-pubkey')
  if (pubkey == null) return error("io-captcha: missing data-pubkey attribute, can't continue")

  const callback = element.getAttribute('data-callback-solve') ?? ''
  const cb: undefined | ((data: any) => null) = window.callbacks[callback]

  const callback_error = element.getAttribute('data-callback-error') ?? ''
  const cb_error: undefined | ((data: any) => null) = window.callbacks[callback_error]

  const widgetid = element.getAttribute('data-widgetid') ?? rnd_str(5)
  const theme = element.getAttribute('data-theme') ?? 'light'
  const scale = parseFloat(element.getAttribute('data-scale') ?? '1.0')
  const font = element.getAttribute('data-font') ?? 'roboto'

  const formfield = window.document.createElement('input')
  formfield.hidden = true

  element.appendChild(formfield)

  const iframe = window.document.createElement('iframe')
  iframe.src = UI_URL

  iframe.style.overflow = 'visible'
  iframe.style.border = 'none'
  iframe.style.position = 'absolute'

  element.appendChild(iframe)

  if (iframe.contentWindow == null) return error('io-captcha: iframe.contentWindow is null')

  const widget = new Widget(WidgetType.Iocaptcha, formfield, widgetid, iframe)

  iframe.onload = () => {
    iframe.contentWindow?.postMessage(
      {
        method: 'set_pubkey',
        pubkey
      },
      { targetOrigin: UI_URL }
    )

    iframe.contentWindow?.postMessage(
      {
        method: 'set_widgetid',
        widgetid
      },
      { targetOrigin: UI_URL }
    )

    iframe.contentWindow?.postMessage(
      {
        method: 'set_theme',
        theme
      },
      { targetOrigin: UI_URL }
    )

    iframe.contentWindow?.postMessage(
      {
        method: 'set_scale',
        scale
      },
      { targetOrigin: UI_URL }
    )

    iframe.contentWindow?.postMessage(
      {
        method: 'set_font',
        font
      },
      { targetOrigin: UI_URL }
    )

    window.addEventListener('message', (e) => {
      // verify origin url
      if (e.origin.toString() !== ORIGIN.toString()) {
        return
      }

      const data: {
        uuid: string
        error: string
        method: string
        id: string
        height: string
        width: string
      } = e.data

      if (data.id !== widgetid) {
        return
      }

      if (data.method === 'set_pass_uuid') {
        set_form_field(widget, data.uuid)
        if (callback != null) {
          setTimeout(() => {
            if (cb != null) cb(data.uuid)
          })
        }
      } else if (data.method === 'set_error') {
        if (cb_error != null) {
          setTimeout(() => {
            if (cb_error != null) cb_error(data.error)
          })
        }
      } else if (data.method === 'api_hello') {
        e.source?.postMessage(
          {
            method: 'hello_ui'
          },
          { targetOrigin: '*' }
        )
      } else if (data.method === 'size_change') {
        resizeIframe(iframe, data.height, data.width)
      } else if (data.method === 'dflex_size_change_complete') {
        element.style.paddingBottom = data.height.toString()
      }
    })
  }

  return widget
}

function set_form_field (widget: Widget, uuid: string) {
  widget.formfield.setAttribute('iocaptcha-pass-uuid', uuid)
}

function resizeIframe (iframe: HTMLIFrameElement, h: string, w: string) {
  iframe.height = h
  iframe.width = w
}

/**
 * @returns {undefined}
 * @description Performs a scan of the DOM and renders everything again.
 * NOTE that this is already done once on startup, and is
 * not expected or intended to be used again.
 * <br>
 * The method is only provided for extremely rare edge cases.
 */
export function scan_and_render () {
  const divs = window.document.getElementsByClassName('io-captcha') as HTMLCollectionOf<HTMLElement>
  for (let i = 0; i < divs.length; i++) {
    const div = divs[i]
    render(div)
  }
}

/**
 *
 * @param element {HTMLElement}
 * @param widgetid {string}
 * @param ops {CaptchaOptions}
 */
export function new_node (element: HTMLElement, widgetid: string, ops: CaptchaOptions) {
  const div = document.createElement('div')
  div.className = 'io-captcha'

  div.setAttribute('data-widgetid', widgetid)
  div.setAttribute('data-pubkey', ops.pubkey)
  if (ops.callbackSolve !== null) {
    const id = rnd_str(16)
    window.callbacks[id] = ops.callbackSolve
    div.setAttribute('data-callback-solve', id)
  }
  if (ops.callbackError !== null) {
    const id = rnd_str(16)
    window.callbacks[id] = ops.callbackError
    div.setAttribute('data-callback-error', id)
  }
  div.setAttribute('data-theme', ops.theme)
  div.setAttribute('data-font', ops.font)
  div.setAttribute('data-scale', ops.scale.toString())

  element.appendChild(div)
  render(div)

  return div
}

/**
 * Options data regarding a captcha widget.
 * @class
 * @constructor
 * @public
 * @property {string} [pubkey] The public key of the endpoint the widget is associated with.
 * @property {string} [callback-solve] The callback to call when the widget is solved. The Pass UUID is passed into the callback.
 * @property {string} [callback-expire] The callback to call when the current Pass UUID expires. This means the user needs to solve the captcha again.
 * @property {string} [callback-error] The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
 * @property {string} [theme] The theme of the widget. [light, dark, ...] - https://iocaptcha.com/explorer/
 * @property {string} [text-style] The text style of the widget. [roboto, mono, ...] - https://iocaptcha.com/explorer/
 * @property {number} [scale] The scale of the widget. [float]
 */
export class CaptchaOptions {
  constructor (
    public pubkey: string,
    public callbackSolve: undefined | ((data: any) => null),
    public callbackError: undefined | ((data: any) => null),
    public theme: string,
    public font: string,
    public scale: number
  ) {
    /**
     * The pubkey to use for the widget. [public captcha key, https://iocaptcha.com/dashboard/endpoints]
     * @type {string}
     */
    this.pubkey = pubkey

    /**
     * The theme to use for the widget. [light, dark, ...]
     * @type {string}
     */
    this.theme = theme

    /**
     * The text font to use for the widget. [mono, serif, etc.]
     * @type {string}
     * @default "roboto"
     */
    this.font = font

    /**
     * The scale to use for the widget. [1.0, 2.0, ...]
     * @type {float}
     */
    this.scale = scale
  }
}

/**
 * @returns {CaptchaOptions} The default options for a captcha widget with a custom pubkey.
 * @class
 */
export function defaultOptions (key: string): CaptchaOptions {
  return new CaptchaOptions(key, undefined, undefined, 'light', 'roboto', 1.0)
}

/**
 * The captcha object.
 */
export class Iocaptcha {
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
  create (target: string, id: string, options: CaptchaOptions | string): Widget | Error {
    options = options instanceof CaptchaOptions ? options : defaultOptions(options)
    id = id ?? rnd_str(16)

    const div = document.querySelector(target) as HTMLElement

    if (div === null) {
      const err = new Error('Target element not found.')
      if (iocom.CONFIG.throw_errors) {
        throw err
      } else {
        return err
      }
    }

    const node = new_node(div, id, options)
    return render(node)
  }
}

window.document.addEventListener('DOMContentLoaded', () => {
  if (iocom.CONFIG.scan_immediately) scan_and_render()
})
