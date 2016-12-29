var WechatPayment = require('../wechatpayment');
var paymentModel = new WechatPayment(require('../config.json'));

var signature = paymentModel.getSignature({
	appId:'wxb9978f67bd7e8a9d',
	timeStamp:'1478165360',
	nonceStr:'a607bb251062b105b33667243491eecc',
	package:'prepay_id=wx20161103172415a78fff198b0901087592',
	signType:'MD5'
});
console.log(signature)
