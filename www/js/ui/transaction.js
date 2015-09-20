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

SkyNxt.TRANSACTION_TYPE = 0;
SkyNxt.TYPE_COLORED_COINS = 2; 
SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT = 2;
SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT = 3;
SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION = 4;
SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION = 5;
SkyNxt.TYPE_MESSAGING = 1;
SkyNxt.SUBTYPE_MESSAGING_VOTE_CASTING = 3;
SkyNxt.NO_VOTE_VALUE = -128;	//Byte.MIN_VALUE
SkyNxt.PAYMENT = "Payment";
SkyNxt.BUY_ORDER = "Buy Order";
SkyNxt.SELL_ORDER = "Sell Order";
SkyNxt.BUY_CANCEL = "Cancel Buy Order";
SkyNxt.SELL_CANCEL = "Cancel Sell Order";
SkyNxt.OTHER = "Other";

function getFlags() {
	var flags = 0;
	var position = 1;
	position <<= 1;
	position <<= 1;
	position <<= 1;
	return flags;
}

function pad(length, value) {
	var array = [];
	for (var i = 0; i < length; i++) {
		array[i] = value;
	}
	return array;
}

function padWithZero(length)
{
	var aZero = [0];
	var arrayZero = aZero;
	for (var i = 0; i < length-1; i++) {
		arrayZero = arrayZero.concat(aZero);
	}
	return array;
}

function areByteArraysEqual(bytes1, bytes2) {
	if (bytes1.length !== bytes2.length)
		return false;

	for (var i = 0; i < bytes1.length; ++i) {
		if (bytes1[i] !== bytes2[i])
			return false;
	}
	return true;
}

function verifyBytes(signature, message, publicKey) {
	var signatureBytes = converters.hexStringToByteArray(signature);
	var messageBytes = converters.hexStringToByteArray(message);
	var publicKeyBytes = converters.hexStringToByteArray(publicKey);
	var v = signatureBytes.slice(0, 32);
	var h = signatureBytes.slice(32);
	var y = curve25519.verify(v, h, publicKeyBytes);

	var m = SkyNxt.simpleHash(messageBytes);

	SkyNxt._hash.init();
	SkyNxt._hash.update(m);
	SkyNxt._hash.update(y);
	var h2 = SkyNxt._hash.getBytes();

	return areByteArraysEqual(h, h2);
}

SkyNxt.sendNxtAmt_BuildHex = function(amountNQT, recipientID){
	//amountNQT = 1000000;
	//recipientID = "NXT-EMS6-B4DB-E2ZA-8ZPYV"; // testnet
	var buffer = [];
	var LONG_BYTE_LENGTH = 8;
	var TRANSACTION_SUBTYPE = 0;
	var deadline = 20;
	var ecBlockHeight = 0;
	var ecBlockId = 0;
	var version = 1;

	var hexTrans;
	var secretPhraseBytes = converters.stringToByteArray(SkyNxt.globalPassPhrase);
	var digest = SkyNxt.simpleHash(secretPhraseBytes);
	var publicKey = converters.byteArrayToHexString(curve25519.keygen(digest).p);
	var timestamp = Math.floor(Date.now() / 1000) - 1385294400;
	hexTrans = converters.byteArrayToHexString([SkyNxt.TRANSACTION_TYPE]);
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([version << 4]));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(converters.int32ToBytes(timestamp)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([160]));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([5]));
	hexTrans = hexTrans.concat(publicKey);
	
	var nxtAddr = new NxtAddress();
	nxtAddr.set(recipientID);
	var recipient = (new BigInteger(nxtAddr.account_id())).toByteArray().reverse();	
	recipient = recipient.concat(pad( LONG_BYTE_LENGTH - recipient.length, 0 ));	
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(recipient.slice(0, LONG_BYTE_LENGTH)));

	var amount = (new BigInteger(amountNQT)).toByteArray().reverse();
	amount = amount.concat(pad(LONG_BYTE_LENGTH - amount.length, 0));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(amount.slice(0, LONG_BYTE_LENGTH)));	
	
	var fee = (new BigInteger(SkyNxt.FEE_NQT)).toByteArray().reverse();
	fee = fee.concat(pad(LONG_BYTE_LENGTH - fee.length, 0));	
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(fee.slice(0, LONG_BYTE_LENGTH)));

	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(32,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(64,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(16,0)));

	buffer = converters.hexStringToByteArray(hexTrans);
	//verifyAndSignTransactionBytes(buffer, "sendnxt");
	var signature = SkyNxt.signBytes(buffer, SkyNxt.globalPassPhrase);
	var buffTillSignature = buffer.slice(0, 96);
	var buffAfterSignature = buffer.slice(96+64);
	var signed = buffTillSignature;
	signed = signed.concat(signature);
	signed = signed.concat(buffAfterSignature);
	var tx = converters.byteArrayToHexString(signed);
	
	broadcastTransaction(tx);
}
	
SkyNxt.placeAssetOrder_BuildHex = function(type, asset, quantity, price, order){
    assetID = asset.toString();
	quantityQNT = quantity.toString();
	priceNQT = price.toString();
	orderID = order.toString();
	var buffer = []; var hexTrans;
	var LONG_BYTE_LENGTH = 8; 

	var amountNQT = 0; var ecBlockHeight = 0; var ecBlockId = 0; var version = 1;
	
	var secretPhraseBytes = converters.stringToByteArray(SkyNxt.globalPassPhrase);	
	var digest = SkyNxt.simpleHash(secretPhraseBytes);
	var publicKey = converters.byteArrayToHexString(curve25519.keygen(digest).p);	
	var timestamp = Math.floor(Date.now() / 1000) - 1385294400;
	hexTrans = converters.byteArrayToHexString([SkyNxt.TYPE_COLORED_COINS]);	
	var bitVersion = version << 4;	
	if(type == "buy")
		 hexTrans = hexTrans.concat(converters.byteArrayToHexString([bitVersion | SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT]));
	else if(type == "sell")
		 hexTrans = hexTrans.concat(converters.byteArrayToHexString([bitVersion | SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT]));
	else if(type == "buy_cancel")
		 hexTrans = hexTrans.concat(converters.byteArrayToHexString([bitVersion | SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION]));
	else if(type == "sell_cancel")
		 hexTrans = hexTrans.concat(converters.byteArrayToHexString([bitVersion | SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION]));
	 
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(converters.int32ToBytes(timestamp)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([160]));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([5]));
	hexTrans = hexTrans.concat(publicKey);
	var nxtAddr = new NxtAddress();
	nxtAddr.set("1739068987193023818"); //creator ID, Genesis account id
	var creatorID = (new BigInteger(nxtAddr.account_id())).toByteArray().reverse();
	creatorID = creatorID.concat(pad( LONG_BYTE_LENGTH - creatorID.length, 0 ));	
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(creatorID.slice(0, LONG_BYTE_LENGTH)));
	var amount = (new BigInteger(String(amountNQT))).toByteArray().reverse();	
	amount = amount.concat(pad(LONG_BYTE_LENGTH - amount.length, 0));	
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(amount.slice(0, LONG_BYTE_LENGTH)));
	var fee = (new BigInteger(SkyNxt.FEE_NQT)).toByteArray().reverse();
	fee = fee.concat(pad(LONG_BYTE_LENGTH - fee.length, 0));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(fee.slice(0, LONG_BYTE_LENGTH)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(32,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(64,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(16,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([version]));
	if(type == "buy" || type == "sell")
	{
		var asset = (new BigInteger(assetID)).toByteArray().reverse();
		asset = asset.concat(pad(LONG_BYTE_LENGTH - asset.length, 0));
		hexTrans = hexTrans.concat(converters.byteArrayToHexString(asset.slice(0, LONG_BYTE_LENGTH)));

		var quantity = (new BigInteger(quantityQNT)).toByteArray().reverse();
		quantity = quantity.concat(pad(LONG_BYTE_LENGTH - quantity.length, 0));
		hexTrans = hexTrans.concat(converters.byteArrayToHexString(quantity.slice(0, LONG_BYTE_LENGTH)));

		var price = (new BigInteger(priceNQT)).toByteArray().reverse();
		price = price.concat(pad(LONG_BYTE_LENGTH - price.length, 0));
		hexTrans = hexTrans.concat(converters.byteArrayToHexString(price.slice(0, LONG_BYTE_LENGTH)));
	}
	else
	{   //cancellation of bid\ask orders with orderID as input
		var order = (new BigInteger(orderID)).toByteArray().reverse();
		order = order.concat(pad(LONG_BYTE_LENGTH - order.length, 0));
		hexTrans = hexTrans.concat(converters.byteArrayToHexString(order.slice(0, LONG_BYTE_LENGTH)));	
	}
	
	buffer = converters.hexStringToByteArray(hexTrans);
	//verifyAndSignTransactionBytes(buffer, "asset");
	var signature = SkyNxt.signBytes(buffer, SkyNxt.globalPassPhrase);
	var buffTillSignature = buffer.slice(0, 96);
	var buffAfterSignature = buffer.slice(96+64);
	var signed = buffTillSignature; signed = signed.concat(signature); signed = signed.concat(buffAfterSignature);
	var tx = converters.byteArrayToHexString(signed);
	broadcastTransaction(tx);
}

SkyNxt.castVote_BuildHex = function(pollid, vote){
    pollID = pollid.toString();
	var buffer = []; var hexTrans;
	var LONG_BYTE_LENGTH = 8; 

	var amountNQT = 0; var ecBlockHeight = 0; var ecBlockId = 0; var version = 1;
	
	var secretPhraseBytes = converters.stringToByteArray(SkyNxt.globalPassPhrase);	
	var digest = SkyNxt.simpleHash(secretPhraseBytes);
	var publicKey = converters.byteArrayToHexString(curve25519.keygen(digest).p);	
	var timestamp = Math.floor(Date.now() / 1000) - 1385294400;
	hexTrans = converters.byteArrayToHexString([SkyNxt.TYPE_MESSAGING]);	
	var bitVersion = version << 4;
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([bitVersion | SkyNxt.SUBTYPE_MESSAGING_VOTE_CASTING]));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(converters.int32ToBytes(timestamp)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([160]));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([5]));
	hexTrans = hexTrans.concat(publicKey);
	var nxtAddr = new NxtAddress();
	nxtAddr.set("1739068987193023818"); //creator ID, Genesis account id
	var creatorID = (new BigInteger(nxtAddr.account_id())).toByteArray().reverse();
	creatorID = creatorID.concat(pad( LONG_BYTE_LENGTH - creatorID.length, 0 ));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(creatorID.slice(0, LONG_BYTE_LENGTH)));
	var amount = (new BigInteger(String(amountNQT))).toByteArray().reverse();
	amount = amount.concat(pad(LONG_BYTE_LENGTH - amount.length, 0));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(amount.slice(0, LONG_BYTE_LENGTH)));
	var fee = (new BigInteger(SkyNxt.FEE_NQT)).toByteArray().reverse();
	fee = fee.concat(pad(LONG_BYTE_LENGTH - fee.length, 0));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(fee.slice(0, LONG_BYTE_LENGTH)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(32,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(64,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(pad(16,0)));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString([version]));
	
	var poll = (new BigInteger(pollID)).toByteArray().reverse();
	poll = poll.concat(pad(LONG_BYTE_LENGTH - poll.length, 0));
	hexTrans = hexTrans.concat(converters.byteArrayToHexString(poll.slice(0, LONG_BYTE_LENGTH)));

	hexTrans = hexTrans.concat(converters.byteArrayToHexString([vote.length]));

	for(var i = 0; i < vote.length; i++)
	{
		hexTrans = hexTrans.concat(converters.byteArrayToHexString([vote[i]]));
	}
	
	buffer = converters.hexStringToByteArray(hexTrans);
	verifyAndSignTransactionBytes(buffer, "vote");
	var signature = SkyNxt.signBytes(buffer, SkyNxt.globalPassPhrase);
	var buffTillSignature = buffer.slice(0, 96);
	var buffAfterSignature = buffer.slice(96+64);
	var signed = buffTillSignature; signed = signed.concat(signature); signed = signed.concat(buffAfterSignature);
	var tx = converters.byteArrayToHexString(signed);
	prompt("", tx);
	broadcastTransaction(tx);
}

function verifyAndSignTransactionBytes(byteArray, type) {
	var transaction = {};
	transaction.type = byteArray[0];
	transaction.version = (byteArray[1] & 0xF0) >> 4;
	transaction.subtype = byteArray[1] & 0x0F;
	transaction.timestamp = String(converters.byteArrayToSignedInt32(byteArray, 2));
	transaction.deadline = String(converters.byteArrayToSignedShort(byteArray, 6));
	transaction.publicKey = converters.byteArrayToHexString(byteArray.slice(8, 40));
	transaction.recipient = String(converters.byteArrayToBigInteger(byteArray, 40));
	transaction.amountNQT = String(converters.byteArrayToBigInteger(byteArray, 48));
	transaction.feeNQT = String(converters.byteArrayToBigInteger(byteArray, 56));
	var refHash = byteArray.slice(64, 96);
	transaction.referencedTransactionFullHash = converters.byteArrayToHexString(refHash);
	if (transaction.referencedTransactionFullHash == "0000000000000000000000000000000000000000000000000000000000000000") {
		transaction.referencedTransactionFullHash = "";
	}
	transaction.flags = 0;
	if (transaction.version > 0) {
		transaction.flags = converters.byteArrayToSignedInt32(byteArray, 160);
		transaction.ecBlockHeight = String(converters.byteArrayToSignedInt32(byteArray, 164));
		transaction.ecBlockId = String(converters.byteArrayToBigInteger(byteArray, 168));
	}
	if(type == "asset")
	{
		transaction.ver = (byteArray[176] & 0xF0) >> 4;
		transaction.assetId = String(converters.byteArrayToBigInteger(byteArray, 177));
		transaction.quantityQNT = String(converters.byteArrayToBigInteger(byteArray, 185));
		transaction.priceNQT = String(converters.byteArrayToBigInteger(byteArray, 193));
	}
	if(type == "vote")
	{
		transaction.ver = (byteArray[176] & 0xF0) >> 4;
		transaction.pollid = String(converters.byteArrayToBigInteger(byteArray, 177));
		transaction.length = String(byteArray[185]);
		transaction.vote = [];
		var index = 0;
		for(var i = 186; i < transaction.length; i++)
		{
			transaction.vote[index++] = String(byteArray[i]);
		}
	}
}

function broadcastTransaction(tx)
{
	var url = SkyNxt.ADDRESS +'/nxt?requestType=broadcastTransaction&transactionBytes=' + tx;
	$.ajax({
			url: url,
			crossDomain: true,
			type: "POST",
			async: true
		}).done(function(json) {
			if (json.errorCode && !json.errorDescription) {
				json.errorDescription = (json.errorMessage ? json.errorMessage : $.t("server_error_unknown"));
			}
			var parsedjson = $.parseJSON(json);
		}).fail(function(xhr, textStatus, error) {
			
		});
}

SkyNxt.getType = function(type, subtype) {
if(type == SkyNxt.TRANSACTION_TYPE)
		return SkyNxt.PAYMENT;
if(type == SkyNxt.TYPE_COLORED_COINS && subtype == SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT)
		return SkyNxt.SELL_ORDER;
if(type == SkyNxt.TYPE_COLORED_COINS && subtype == SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT)
		return SkyNxt.BUY_ORDER;
if(type == SkyNxt.TYPE_COLORED_COINS && subtype == SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION)
		return SkyNxt.SELL_CANCEL;
if(type == SkyNxt.TYPE_COLORED_COINS && subtype == SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION)
		return SkyNxt.BUY_CANCEL;
return SkyNxt.OTHER;
}
	return SkyNxt;
 }(SkyNxt || {}, jQuery));