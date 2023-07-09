import { error, ORIGIN, rnd_str, UI_URL, Widget, WidgetType } from './util'
import { iocom } from './manager'

/**
 * Options data regarding a captcha widget.
 * @class
 * @constructor
 * @public
 * @property {string} [pubkey] The public key of the endpoint the widget is associated with.
 * @property {string} [action] The action to use for the widget. [login, register, ...] - https://iocaptcha.com/explorer/
 * @property {string} [callback-token-refresh] The callback to call when a new token is generated. The Pass UUID is passed into the callback every few seconds.
 * @property {string} [callback-error] The callback to call when an error occurs. The recommended course of action in this case is to refresh the page.
 */
export class IosecOptions {
  constructor (
    public pubkey: string,
    public action: string,
    public callbackTokenRefresh: undefined | ((data: any) => null),
    public callbackError: undefined | ((data: any) => null)
  ) {
    /**
     * The pubkey to use for the widget. [public key, https://iocaptcha.com/dashboard/endpoints]
     * @type {string}
     */
    this.pubkey = pubkey

    /**
     * The action to use for the widget. [login, register, ...]
     * @type {string}
     */
    this.action = action
  }
}

const EVENT_TYPES = ['new_pass_uuid']
export class Iosec {
  private events: Record<string, Array<(data: any) => null>> = {}

  /**
   * Connect an event to this widget.
   * Possible events:
   * - `new_pass_uuid` - called when a new pass_uuid is set internally
   * @param event
   * @param callback
   */
  public connect (event: string, callback: (data: any) => null): Error | undefined {
    if (!EVENT_TYPES.includes(event)) { return error(`Invalid event type: ${event}, possible events: ${EVENT_TYPES.join(', ')}`) }

    if (this.events[event] === undefined) this.events[event] = []

    this.events[event].push(callback)
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
  create (target: string, id: string, options: IosecOptions): Widget | Error {
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

export function render (element: HTMLElement): Widget | Error {
  const pubkey = element.getAttribute('data-pubkey')
  if (pubkey == null) return error("io-sec: missing data-pubkey attribute, can't continue")

  const callback: string = element.getAttribute('data-callback-token-refresh') ?? ''
  const cb: undefined | ((data: any) => null) = window.callbacks[callback]

  const callback_error: string = element.getAttribute('data-callback-error') ?? ''
  const cb_error: undefined | ((data: any) => null) = window.callbacks[callback_error]

  const widgetid = element.getAttribute('data-widgetid') ?? rnd_str(5)
  const action = element.getAttribute('data-action') ?? 'unspecified'

  const formfield = window.document.createElement('input')
  formfield.hidden = true

  element.appendChild(formfield)

  const iframe = window.document.createElement('iframe')
  iframe.src = UI_URL

  iframe.hidden = true
  element.appendChild(iframe)

  const widget = new Widget(WidgetType.Iosec, formfield, widgetid, iframe)

  iframe.onload = () => {
    iframe.contentWindow?.postMessage(
      {
        method: 'set_pubkey_iosec',
        pubkey
      },
      { targetOrigin: UI_URL }
    )

    iframe.contentWindow?.postMessage(
      {
        method: 'set_widgetid_iosec',
        widgetid
      },
      { targetOrigin: UI_URL }
    )

    iframe.contentWindow?.postMessage(
      {
        method: 'set_action_iosec',
        action
      },
      { targetOrigin: UI_URL }
    )

    window.addEventListener('message', (e) => {
      // verify origin url
      if (e.origin.toString() !== ORIGIN.toString()) {
        return
      }

      const { id, method, uuid } = e.data

      if (id !== widgetid) {
        return
      }

      if (method === 'set_pass_uuid') {
        if (cb !== undefined) {
          setTimeout(() => {
            cb(uuid)
          })
        }
      } else if (method === 'set_error') {
        // todo this is never called from the hook yet, since errors are handled gracefully
        // todo keep handling them gracefully, but send errors back anyway
        if (cb_error != null) {
          setTimeout(() => {
            if (cb_error != null) cb_error(error)
          })
        }
      } else if (method === 'api_hello') {
        e.source?.postMessage(
          {
            method: 'hello_ui'
          },
          { targetOrigin: '*' }
        )
      }
    })
  }

  return widget
}

export function new_node (element: HTMLElement, widgetid: string, ops: IosecOptions) {
  const div = document.createElement('div')
  div.className = 'io-sec'

  div.setAttribute('data-widgetid', widgetid)
  div.setAttribute('data-pubkey', ops.pubkey)
  div.setAttribute('data-action', ops.action)
  if (ops.callbackTokenRefresh != null) {
    const id = rnd_str(16)
    window.callbacks[id] = ops.callbackTokenRefresh
    div.setAttribute('data-callback-token-refresh', id)
  }
  if (ops.callbackError != null) {
    const id = rnd_str(16)
    window.callbacks[id] = ops.callbackError
    div.setAttribute('data-callback-error', id)
  }

  element.appendChild(div)
  render(div)

  return div
}
