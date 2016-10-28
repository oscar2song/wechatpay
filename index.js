var express = require('express');
var app = express();

function demoRequest(){
	var WechatPayment = require('./wechatpayment');

	var config = require('./config.json');
	var wechatPayment = new WechatPayment(config);

	wechatPayment.setOrderNumber("1337")
	wechatPayment.setPaymentTitle("SwiftCam WeChat Online Payment");
	wechatPayment.setBuyerIp("192.168.99.100");
	wechatPayment.addProduct("hellokitty", "Hello Kitty Mobile Stabilizer", "Shoot perfectly smooth video with lovely Hello Kitty", 1, 800)
	return wechatPayment.getPaymentUrl()
}



app.get('/', function (req, res) {
	demoRequest().then(function(url){
		res.send(url)
	}, function(err){
		res.send(err)
	})
});

app.listen(13002)
