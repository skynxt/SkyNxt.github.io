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

	return SkyNxt;
 }(SkyNxt || {}, jQuery));