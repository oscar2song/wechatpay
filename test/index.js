var WechatPayment = require('./wechatpayment');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.text({type:"*/*"}));

function demoRequest(){

	var config = require('../config.json');
	var wechatPayment = new WechatPayment(config);

	wechatPayment.setOrderNumber("1339")
	wechatPayment.setPaymentTitle("SwiftCam WeChat Online Payment");
	wechatPayment.setBuyerIp("192.168.99.100");
	wechatPayment.addProduct("hellokitty", "Hello Kitty Mobile Stabilizer", "Shoot perfectly smooth video with lovely Hello Kitty", 1, 800)
	return wechatPayment.getPaymentUrl()
}

app.get('/', function (req, res) {
	demoRequest().then(function(payment){
		var base64 = payment.base64Image;
		res.send('<img src="'+base64+'" />');
	}, function(err){
		res.send(err)
	})
});

app.post('/', function(req, res){
	var config = require('../config.json');
	var wechatPayment = new WechatPayment(config);
	wechatPayment.onCallback(req.body).then(function(result){
		res.send(result);
	})
})

app.listen(13002)
