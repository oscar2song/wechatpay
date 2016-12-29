var Jsonxml = require('./jsonxml');
var Request = require('request');
var crypto = require('crypto');
var Qr = require('qrcode-js');
var Memory = {};


class WechatPayment{
	constructor(config){
		this.paymentApi = "https://api.mch.weixin.qq.com/pay/unifiedorder";
		this.apiKey = '';
		this.appSecret = '';
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
		if (config && config.appSecret) this.setAppSecret(config.appSecret);
		if (config && config.merchantId) this.setMerchantId(config.merchantId);
		if (config && config.callback) this.setCallback(config.callback);
	}
	setAppId(appId){
		this.request.appid = appId;
	}
	setApiKey(apiKey){
		this.apiKey = apiKey;
	}
	setAppSecret(appSecret){
		this.appSecret = appSecret;
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
	setType(type){
		this.request.trade_type = type;
	}
	setCallback(callbackUrl){
		this.request.notify_url = callbackUrl;
	}
	setBuyerIp(ip){
		ip = ip.replace('::1','127.0.0.1');
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
		return Jsonxml.parse(response).then(function(responseObject){
			if (!validate(responseObject, this.apiKey)){
				return Promise.reject('Invalid callback')
			}
			return responseObject;
		}.bind(this))
	}
	getSignature(request){
		request = Jsonxml.sortAlphatically(request);
		var signature = sign(request, this.apiKey);
		return signature;
	}
	getPaymentRequest(){
		var paymentApi = this.paymentApi;
		var request = clone(this.request);
		request = Jsonxml.sortAlphatically(request);
		var signature = sign(request, this.apiKey);
		request.push({tag:'sign','value':signature});
		var xml = Jsonxml.toXml(request);
		return new Promise(function(resolve, reject){
			Request.post(paymentApi, {body:xml}, function(err, res, xml){
				Jsonxml.parse(xml).then(function(result){
					if (result.code_url){
						result.base64Image = getQrImage(result.code_url);
						return resolve(result)
					}
					reject(result)
				});
			})
		});
	}
	getAccessToken(){
		if (!Memory || !Memory.accessTokenInfo || isTokenExpired(Memory.accessTokenInfo)){
			return new Promise(function(resolve){
				var requestTime = new Date().getTime();
				Request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+this.request.appid+'&secret='+this.appSecret, function(err, res, body){
					body = JSON.parse(body);
					body.requestTime = requestTime;
					Memory.accessTokenInfo = body;
					resolve(body.access_token);
				});
			}.bind(this));
		}
		return Promise.resolve(Memory.accessTokenInfo.access_token);
	}
	getJsApiTicket(){
		if (!Memory || !Memory.jsApiTicket || isTokenExpired(Memory.jsApiTicket)){
			return this.getAccessToken().then(function(accessToken){
				return new Promise(function(resolve){
					var requestTime = new Date().getTime();
					Request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+accessToken+'&type=jsapi',function(err, res, body){
						body = JSON.parse(body);
						body.requestTime = requestTime;
						Memory.jsApiTicket = body;
						resolve(body.ticket)
					})
				})
			})
		}
		return Promise.resolve(Memory.jsApiTicket.ticket);
	}
}

function isTokenExpired(accessTokenInfo){
	var currentTime = new Date().getTime();
	if (currentTime > accessTokenInfo.requestTime + Number(accessTokenInfo.expires_in)*1000) return true;
	return false;
}

function clone(obj){
	return JSON.parse(JSON.stringify(obj));
}

function validate(response, apiKey){
	var fromSignature = response.sign;
	response.sign = '';
	var rows = Jsonxml.sortAlphatically(response);
	var signature = sign(rows, apiKey);
	if (signature == fromSignature){
		return true;
	}
	return false;
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
