var Xml2js = require('xml2js');

module.exports = {
	toXml:function(json){
		var xmlRows = [];
		for(var key in json){
			xmlRows.push(getXmlRow(key, json[key]));
		}
		return '<xml>\n'+xmlRows.join("\n")+'\n</xml>'
	},
	cdataWrap:function(json){
		for(var key in json){
			var value = json[key];
			if (typeof value === 'object' && value !== null){
					json[key] = '<![CDATA['+JSON.stringify(value)+']]>';
			}
		}
		return json;
	},
	parse:function(xml){
		return new Promise(function(resolve){
			Xml2js.parseString(xml, function(err, result){
				var json = {};
				for(var key in result.xml){
					json[key] = result.xml[key][0];
				}
				resolve(json);
			});
		})
	}
}

function getXmlRow(key, value){
	return '<'+key+'>'+value+'</'+key+'>';
}
