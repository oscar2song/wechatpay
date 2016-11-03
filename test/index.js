var WechatPayment = require('../wechatpayment');
var paymentModel = new WechatPayment(require('../config.json'));

paymentModel.getJsApiTicket().then(function(jsApiTicket){
	console.log(jsApiTicket);
})
