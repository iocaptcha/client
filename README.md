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
  // using the server-side SDK (https://npmjs.com/package/@iocaptcha/server)
  // or by direct HTTP api calls (https://docs.io.software/api)
}

// Create options with the tokenCallback function, to receive new tokens.
// The callback will be called within ~3 seconds (depending on endpoint difficulty).
const options = {
  public_key: "AAAA",
  action: "submit-form-1",
  callbackTokenRefresh: tokenCallback,
  callbackError: (err) => {
    console.error("Error during token refresh:", err);
  }
}

// Executes the iosec widget and starts the process
let widget = iosec.execute(options);

// OPTIONAL: Verify that no errors happened during execution
if (widget instanceof Error) {
  console.error("Error during widget creation!");
} else {
  console.log("Widget created successfully.")
}


// the tokenCallback function will now be called within a few seconds, depending on the endpoint difficulty.
```

### Implicit rendering
```js
// Sometimes, you might want to render the widget yourself in a pre-specified DOM element.
// This can be done by using the execute_with_implicit_dom function.

<body>
    <p>iosecure will be rendered in the box below, however it will not be visible.</p>
    <div class="iosec"></div>
</body>

iosec.execute_with_implicit_dom(".iosec", options);
```

### Web (UMD) usage
The UMD version does not differ from the ES6 version, except a global "iosec" object is added to the global scope.
The size of the UMD version is approx. ~3kb (minified + gzipped).
```html
<script src="https://cdn.jsdelivr.net/npm/@iocaptcha/client/dist/client.min.js" async></script>
<script>
    // The iosec object is now available in the global scope.
    // You can use it as you would use the ES6 version.
    iosec.execute({
      public_key: "AAAA",
      action: "submit-form-1",
      callbackTokenRefresh: (token) => {
        console.log("New token:", token);
      }
    });
</script>
```
