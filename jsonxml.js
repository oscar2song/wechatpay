var Xml2js = require('xml2js');

module.exports = {
	toXml:function(rows){
		var xmlRows = [];
		for(var i in rows){
			var row = rows[i];
			xmlRows.push(getXmlRow(row.tag, row.value));
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
	sortAlphatically:function(request){
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
		return rows;
	},
	parse:function(xml){
		return new Promise(function(resolve){
			Xml2js.parseString(xml, function(err, result){
				var json = {};
				for(var key in result.xml){
					json[key] = result.xml[key][0].trim();
				}
				resolve(json);
			});
		})
	}
}

function getXmlRow(key, value){
	return '<'+key+'>'+value+'</'+key+'>';
}
