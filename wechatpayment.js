var Jsonxml = require('./jsonxml');
var Request = require('request');
var crypto = require('crypto');
var Jsonxml = require('./jsonxml');

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
		var product = {
			goods_id:productId,
			goods_name:productName,
			quantity:quantity,
			price:price,
			body:productDescription
		};
		this.request.detail.goods_detail.push(product)
		this.request.total_fee += Number(price);
	}
	getPaymentUrl(){
		var paymentApi = this.paymentApi;
		var request = this.request;
		var wrappedRequest = Jsonxml.cdataWrap(request);
		var signature = sign(wrappedRequest, this.apiKey);
		request.sign = signature;
		var xml = Jsonxml.toXml(request);
		return new Promise(function(resolve, reject){
			Request.post(paymentApi,{body:xml}, function(err, res, xml){
				Jsonxml.parse(xml).then(function(result){
					if (result.code_url) return resolve(code_url)
					reject(result)
				});
			})
		});
	}
}

function md5(str){
	return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

function sign(request, apiKey){
	var rows = [];
	for(var i in request){
		if (request[i]!==''){
			rows.push({tag:i,value:request[i]})
		}
	}
	rows = rows.sort(function(a,b){
		if (a.tag < b.tag) return -1;
		if (a.tag > b.tag) return 1;
		return 0;
	})
	var mergedRows = [];
	for(var i in rows){
		var row = rows[i];
		mergedRows.push(row.tag+"="+row.value);
	}
	var mergedString = mergedRows.join('&');
	mergedString += '&key='+apiKey;
	return md5(mergedString);
}

module.exports = WechatPayment;
