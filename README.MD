# Overview
1. Initialize the API with `appId`, `apiKey`, `merchantId`, `callbackUrl`
2. Add products with this API
3. Get Payment URL like `weixin://wxpay/s/An4baqw` and a base64 image representation for QR code payment


# Usage
```javascript
var WechatPayment = require('wechatpayment');

var config = {
	"appId":"wxb1092a6bbd7e4a0d",
	"apiKey":"9GIbwNM80deG5N941lxQGB8dRbFcafh6",
	"appSecret":"9c1f6bc015a7f46dd099c1b867442c9",
	"merchantId":"1462732419",
	"callback":"http://example.com/wechat/callback"
};
var wechatPayment = new WechatPayment(config);

wechatPayment.setOrderNumber("1337")
wechatPayment.setPaymentTitle("My Test WeChat Online Payment"); // will be shown on clients WeChat APP
wechatPayment.setBuyerIp("192.168.99.100");
wechatPayment.addProduct("testproduct1", "Test Product Name", "My Great product", 1, 999) 
wechatPayment.getPaymentRequest().then(function(data){
  console.log(data)
},function(err){
  console.log(err)
})
```

# Methods
## setOrderNumber(orderNumberString)
Set the order number you created in your shopping cart system for your reference

## setBuyerIp(ipString)
Set the IP from your client get from your shopping cart system for your reference

## setPaymentTitle(titleString)
Set the title displayed on client WeChat APP

## addProduct(sku, name, description, quantity, price)
Arguments
- Product SKU / model .. or whatever..
- Product Name
- Product Description
- Quantity
- Price in (Currency in Chinese Yuen / RMB)

## getPaymentRequest() (Promise)
Finally, invoke to get URL / base64 QR Image to you


# Sample Success Return
```
{ return_code: 'SUCCESS',
  return_msg: 'OK',
  appid: 'wx12345',
  mch_id: '12345',
  nonce_str: 'example12345',
  sign: '1234567',
  result_code: 'SUCCESS',
  prepay_id: 'wx201712345example',
  trade_type: 'NATIVE',
  code_url: 'weixin://wxpay/bizpayurl?pr=example',
  base64Image: 'data:image/gif;base64,.....' }
```
Now, you can use base64Image within `<img src="data:image/gif;base64....."/>`
Alternatively you can redirect you client on `code_url` (by `window.open(URL)`) to invoke WeChat App from clients' mobile phone
