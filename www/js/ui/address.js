// The MIT License (MIT)

// Copyright (c) 2015 SkyNxt.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var SkyNxt = (function(SkyNxt, $, undefined) {

SkyNxt.FEE_NQT = "100000000";
var httpsConnDone = false;

SkyNxt.globalPassPhrase = "";
SkyNxt.globalAddress = "";
	
SkyNxt._hash = {
	init: SHA256_init,
	update: SHA256_write,
	getBytes: SHA256_finalize
};

SkyNxt.simpleHash = function(message) {
	SkyNxt._hash.init();
	SkyNxt._hash.update(message);
	return SkyNxt._hash.getBytes();
}

SkyNxt.byteArrayToBigInteger = function(byteArray, startIndex) {
	var value = new BigInteger("0", 10);
	var temp1, temp2;
	for (var i = byteArray.length - 1; i >= 0; i--) {
		temp1 = value.multiply(new BigInteger("256", 10));
		temp2 = temp1.add(new BigInteger(byteArray[i].toString(10), 10));
		value = temp2;
	}
	return value;
}

SkyNxt.signBytes = function(message, secretPhrase) {
	var messageBytes = message;
	var secretPhraseBytes = converters.stringToByteArray(secretPhrase);

	var digest = SkyNxt.simpleHash(secretPhraseBytes);
	var s = curve25519.keygen(digest).s;

	var m = SkyNxt.simpleHash(messageBytes);

	SkyNxt._hash.init();
	SkyNxt._hash.update(m);
	SkyNxt._hash.update(s);
	var x = SkyNxt._hash.getBytes();

	var y = curve25519.keygen(x).p;

	SkyNxt._hash.init();
	SkyNxt._hash.update(m);
	SkyNxt._hash.update(y);
	var h = SkyNxt._hash.getBytes();

	var v = curve25519.sign(h, x, s);

	return (v.concat(h));
}

SkyNxt.createQRCode = function() {
	//initialize qr code
	var qrCode = qrcode(3, 'M');
    var text = SkyNxt.globalAddress.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
	qrCode.addData(text);
	qrCode.make(); 
	document.getElementById('qr').innerHTML = qrCode.createImgTag(5);	
}


$("#passPhrase").on('input', function() {
$("#nxtAddressQR").show();

SkyNxt.globalPassPhrase = $("#passPhrase").val();

try
{
	var secretPhraseBytes = converters.stringToByteArray(SkyNxt.globalPassPhrase);
	var digest = SkyNxt.simpleHash(secretPhraseBytes);
	var publicKey = converters.byteArrayToHexString(curve25519.keygen(digest).p);
	
	var hex = converters.hexStringToByteArray(publicKey);
	SkyNxt._hash.init();
	SkyNxt._hash.update(hex);
	var account = SkyNxt._hash.getBytes();
	account = converters.byteArrayToHexString(account);
	var slice = (converters.hexStringToByteArray(account)).slice(0, 8);
	var accountId = SkyNxt.byteArrayToBigInteger(slice).toString();

	var nxtRSAddress;
	var address = new NxtAddress();
	if (address.set(accountId))
		nxtRSAddress = address.toString();
	
	SkyNxt.globalAddress = nxtRSAddress;
	$("#accountNxtAddress").text(SkyNxt.globalAddress);
	$("#nxtAddress").text(SkyNxt.globalAddress);
}
catch(e)
{
	document.getElementById("nxtAddress").innerHTML = e;
}
});

$( "#peerNodeSelector input" ).on( "change", function( event ) {
	var val = $("input[name='radio-choice-2']:checked").val();
	if(String(val) == "choice-1")
	{
		$("#ipGrid").hide();
		$("#nodeIPBtn").hide();		
		SkyNxt.discover();
	}
	else
	{
		$("#ipGrid").show();
		$("#nodeIPBtn").show();
	}
});

SkyNxt.testIPAddress = function()
{
	loaderIcon('show');
	httpsConnDone = false;
	testIPAddressAjaxCall();
	loaderIcon('hide');
}

function testIPAddressAjaxCall()
{	
		var ip = String($("#nodeIP").val()).replace(/\s+/g, '');
		var port = String($("#port").val()).replace(/\s+/g, '');
		var addr = ip + ":" + port;
		
		if(httpsConnDone)
			addr = SkyNxt.HTTPS_NODE + addr;
		else
			addr = SkyNxt.HTTP_NODE + addr;
			
		var url = addr +'/nxt?requestType=getBlockchainStatus';
		
			$.ajax({
			url: url,
			crossDomain: true,
			type: "POST",
			async: true
		}).done(function(json) {
				if (json.errorCode && !json.errorDescription) {
					json.errorDescription = (json.errorMessage ? json.errorMessage : $.t("server_error_unknown"));
				}
				var retValue = JSON.stringify(json).toLowerCase();
				
				if(retValue.indexOf("error") != 0)
				{
					var IP = "";
					if(httpsConnDone)
					{
						IP = SkyNxt.HTTPS_NODE + ","+ String($("#nodeIP").val());
						SkyNxt.ADDRESS = SkyNxt.HTTPS_NODE;
					}
					if(!httpsConnDone)
					{
						IP = SkyNxt.HTTP_NODE + "," + String($("#nodeIP").val());
						SkyNxt.ADDRESS = SkyNxt.HTTP_NODE;
					}
					
					PORT = String($("#port").val());
					var nodeDetails = IP + "," + PORT;
					SkyNxt.ADDRESS = SkyNxt.ADDRESS + String($("#nodeIP").val()) + ":" + PORT;
					var userdbs = SkyNxt.usersettings.getCollection(SkyNxt.USER_SETTING_COLLECTION);
					if(userdbs != undefined)
					{
						var trustedPeerdata = userdbs.findOne({'key' : SkyNxt.TRUSTED_PEERS});
						trustedPeerdata.value = nodeDetails;
					}
					$("#nodeInformation").text("Node connection success!");
					$("#nodeIPInfoPopup").popup("open");
				}
				else
				{
					$("#nodeInformation").text("Error returned by Node. Please check the your Node configuration");
					$("#nodeIPInfoPopup").popup("open");
				}
		}).fail(function(xhr, textStatus, error) {
				if (!httpsConnDone)
				{
					httpsConnDone = true;
					testIPAddressAjaxCall();//failed with http, try https
				}
				else
				{
					$("#nodeInformation").text("Node Unreachable. Please check the your Node configuration");
					$("#nodeIPInfoPopup").popup("open");
				}
		});
}
	return SkyNxt;
 }(SkyNxt || {}, jQuery));