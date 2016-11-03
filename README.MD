# Overview
1. Initialize the API with `appId`, `apiKey`, `merchantId`, `callbackUrl`
2. Add products with this API
3. Get Payment URL like `weixin://wxpay/s/An4baqw` for QR code payment


# Usage
```javascript
var WechatPayment = require('./wechatpayment');

var config = {
	"appId":"wxb1092a6bbd7e4a0d",
	"apiKey":"9GIbwNM80deG5N941lxQGB8dRbFcafh6",
	"appSecret":"9c1f6bc015a7f46dd099c1b867442c9",
	"merchantId":"1462732419",
	"callback":"http://example.com/wechat/callback"
};
var wechatPayment = new WechatPayment(config);

wechatPayment.setOrderNumber("1337")
wechatPayment.setPaymentTitle("My Test WeChat Online Payment");
wechatPayment.setBuyerIp("192.168.99.100");
wechatPayment.addProduct("testproduct1", "Test Product Name", "My Great product", 1, 999)
return wechatPayment.getPaymentRequest()
```
