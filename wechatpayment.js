var Jsonxml = require('./jsonxml');
var Request = require('request');
var crypto = require('crypto');
var Qr = require('qrcode-js');


class WechatPayment{
	constructor(config){
		this.paymentApi = "https://api.mch.weixin.qq.com/pay/unifiedorder";
		this.apiKey = '';
		this.request = {
			appid:'',
			body:'',
			out_trade_no:'',
			mch_id:'',
			nonce_str:md5(""+new Date().getTime()),
			notify_url:'',
			spbill_create_ip:'',
			total_fee:0,
			trade_type:'NATIVE',
			product_id:0,
			detail:{goods_detail:[]}
		}
		if (config && config.appId) this.setAppId(config.appId);
		if (config && config.apiKey) this.setApiKey(config.apiKey);
		if (config && config.merchantId) this.setMerchantId(config.merchantId);
		if (config && config.callback) this.setCallback(config.callback);
	}
	setAppId(appId){
		this.request.appid = appId;
	}
	setApiKey(apiKey){
		this.apiKey = apiKey;
	}
	setMerchantId(merchantId){
		this.request.mch_id = merchantId;
	}
	setOrderNumber(orderNumber){
		this.request.out_trade_no = orderNumber;
	}
	setPaymentTitle(title){
		this.request.body = title;
	}
	setCallback(callbackUrl){
		this.request.notify_url = callbackUrl;
	}
	setBuyerIp(ip){
		this.request.spbill_create_ip = ip;
	}
	addProduct(productId, productName, productDescription, quantity, price){
		price *= 100;
		var product = {
			goods_id:productId,
			goods_name:productName,
			quantity:quantity,
			price:price,
			body:productDescription
		};
		this.request.detail.goods_detail.push(product)
		this.request.total_fee += Number(price);
		this.request.product_id = productId.substr(0,32);
	}
	onCallback(response){
		return Jsonxml.parse(response)
	}
	getPaymentUrl(){
		var paymentApi = this.paymentApi;
		var request = this.request;
		request = Jsonxml.sortAlphatically(request);
		var signature = sign(request, this.apiKey);
		request.push({tag:'sign','value':signature});
		var xml = Jsonxml.toXml(request);
		return new Promise(function(resolve, reject){
			Request.post(paymentApi, {body:xml}, function(err, res, xml){
				Jsonxml.parse(xml).then(function(result){
					if (result.code_url){
						var paymentUrl = {
							url: result.code_url,
							base64Image: getQrImage(result.code_url)
						}
						return resolve(paymentUrl)
					}
					reject(result)
				});
			})
		});
	}
}

function getQrImage(url){
	return Qr.toDataURL(url, 4);
}

function md5(str){
	return crypto.createHash('md5').update(str, 'utf-8').digest('hex').toUpperCase();
}

function sign(rows, apiKey){
	var mergedRows = [];
	for(var i in rows){
		var row = rows[i];
		if (typeof row.value === 'object' && row.value !== null){
			row.value = JSON.stringify(row.value);
		}
		mergedRows.push(row.tag+"="+row.value);
	}
	var mergedString = mergedRows.join('&');
	mergedString += '&key='+apiKey;
	var signature =  md5(mergedString);
	return signature;
}

module.exports = WechatPayment;
