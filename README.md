TS / ES6 iocaptcha client.
Where security reigns, yet privacy remains.

![image](https://github.com/iocaptcha/assets/blob/main/logo_blue.png?raw=true)
# iocaptcha client


## Installing
[![image](https://img.shields.io/npm/v/@iocaptcha/client.svg)](https://www.npmjs.com/package/@iocaptcha/client)
[![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/iocaptcha/client/node.js.yml)](https://github.com/iocaptcha/client/actions)

```bash
npm install @iocaptcha/client
```

# Usage

## ES6
### Using the captcha-less iosec antibot verification
```js
import { CONFIG, Iosec, IosecOptions } from "@iocaptcha/client";

// errors will be thrown instead of returned
CONFIG.throw_errors = true;

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
iosec.create(".iosec_box", "iosec1", options);

// the new_token function will now be called periodically, with new updated iosec tokens.
```
