TS / ES6 iocaptcha client.
Where security reigns, yet privacy remains.

![image](https://github.com/iocaptcha/assets/blob/main/logo_blue.png?raw=true)
# iocaptcha client


## Installing
[![image](https://img.shields.io/npm/v/@iocaptcha/client.svg)](https://www.npmjs.com/package/@iocaptcha/client)
[![build CI](https://github.com/iocaptcha/client/actions/workflows/node.js.yml/badge.svg)](https://github.com/iocaptcha/client/actions/workflows/node.js.yml)

```bash
npm install @iocaptcha/client
```

# Usage

## ES6
### Using the captcha-less iosec antibot verification
```js
import { CONFIG, Iosec, IosecOptions } from "@iocaptcha/client";

// should throw errors instead of returning them?
// CONFIG.throw_errors = true;

const iosec = new Iosec();

function tokenCallback(token) {
  console.log("New iosec token: " + token)
  // You can now use the token to verify the user by
  // sending the token to your server, and verifying it
  // through our API.
}

// Create options with the tokenCallback function, to receive new tokens.
// The callback will be called in ~10 seconds, then refresh periodically every ~30 seconds.
// Parameters are as follows: (public_key, action, tokenRefreshCallback, errorCallback)
const options = new IosecOptions("AAAA", "submit-form-1", tokenCallback);

// The widget will be created inside the element with the class "iosec_box".
// The iosec widget is invisible, it will not render anything.
// However, we require access to the DOM to perform browser-based bot detection, therefore
// the requirement to provide a DOM element.
let widget = iosec.create(".iosec_box", "iosec1", options);

if (widget instanceof Error) {
  console.error("Error during widget creation!");
} else {
  console.log("Widget created successfully.")
}

console.log("widget:", widget);

// the new_token function will now be called periodically, with new updated iosec tokens.
```
