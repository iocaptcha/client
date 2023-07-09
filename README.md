
![image](https://github.com/iocaptcha/assets/blob/main/logo_blue.png?raw=true)
# iocaptcha client


## Installing
```bash
npm install @iocaptcha/client
```

# Usage

## ES6
```js
import { Iocaptcha, Iosec } from '@iocaptcha/client';

// create classes
const iocaptcha = new Iocaptcha();
const iosec = new Iosec();

// create a new iocaptcha widget
// the widget is automatically rendered & started
const widget = iocaptcha.create(".captcha_box", "{public_key}");


// create a new callback for iosec
function new_token(token) {
  console.log("received new iosec token: " + token);
}
// create a new iosec widget
const widget = iosec.create(".captchaless_box", "{public_key}", new_token);
// iosec widgets have to be started manually
widget.start();

// the new_token function will now be called periodically, with new updated iosec tokens.
```

## Typescript
```ts
// todo
```