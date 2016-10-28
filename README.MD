# Overview
1. Initialize the API with `appId`, `apiKey`, `merchantId`, `callbackUrl`
2. Add products with this API
3. `getPaymentUrl()` to get an Wechat Payment URL like `weixin://wxpay/s/An4baqw`


# Usage
```javascript
var WechatPayment = require('./wechatpayment');

var config = require('./config.json');
var wechatPayment = new WechatPayment(config);

wechatPayment.setOrderNumber("1337")
wechatPayment.setPaymentTitle("My Test WeChat Online Payment");
wechatPayment.setBuyerIp("192.168.99.100");
wechatPayment.addProduct("testproduct1", "Test Product Name", "My Great product", 1, 999)
return wechatPayment.getPaymentUrl()
```
