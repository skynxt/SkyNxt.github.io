// The MIT License (MIT)

// Copyright (c) 2015-2016 SkyNxt.

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

SkyNxt.index = angular.module('skynxt', ['ionic', 'ionic.contrib.frostedGlass'])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ftp|whatsapp|sms):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
])
.filter('formatTimestamp', function formatTimestamp($filter){
  return function(ts){
    return NRS.formatTimestamp(parseInt(ts));
  }
})
.filter('formatAmount', function formatAmount($filter){
  return function(priceNQT){    
	return NRS.convertToNXT(priceNQT);
  }
})
.filter('formatPrice', function formatPrice($filter){
  return function(priceNQT, decimal){    
	return NRS.calculateOrderPricePerWholeQNT(priceNQT, decimal);
  }
})
.filter('formatQuantity', function formatQuantity($filter){
  return function(quantityQNT, decimal){ 
	return NRS.convertToQNTf(quantityQNT, decimal);
  }
})
.filter('formatBalance', function formatBalance($filter){
  return function(asset){
    return NRS.convertToQNTf(asset.quantityQNT, asset.decimals);
  }
})
.filter('split', function() {
	//{{test | split:'.':1}} call format
	return function(input, charVal, i) {
		var splitArr = input.split(charVal);
		return splitArr[i];
	}
})
.run(function ($ionicPlatform){
$ionicPlatform.registerBackButtonAction(function () {
    if($state.current.name=="login"){
		navigator.app.exitApp();
  } else {
    //handle back action!
  }
}, 100);
});

SkyNxt.isControlKey = function(charCode) {
	if (charCode >= 32)
		return false;
	if (charCode == 10)
		return false;
	if (charCode == 13)
		return false;

	return true;
}

SkyNxt.getSelectedText = function () {
	var t = "";
	if (window.getSelection) {
		t = window.getSelection().toString();
	} else if (document.getSelection) {
		t = document.getSelection().toString();
	} else if (document.selection) {
		t = document.selection.createRange().text;
	}
	return t;
}

SkyNxt.keydownevent = function(e, txt, maxFractionLength) {
	var charCode = !e.charCode ? e.which : e.charCode;

	if (SkyNxt.isControlKey(charCode) || e.ctrlKey || e.metaKey) {
		return;
	}

	//var maxFractionLength = 8;

	if (maxFractionLength) {
		//allow 1 single period character
		if (charCode == 110 || charCode == 190) {
			if (txt.indexOf(".") != -1) {
				e.preventDefault();
				return false;
			} else {
				return;
			}
		}
	}

	var input = txt + String.fromCharCode(charCode);

	var afterComma = input.match(/\.(\d*)$/);

	//only allow as many as there are decimals allowed..
	if (afterComma && afterComma[1].length > maxFractionLength) {
		var selectedText = SkyNxt.getSelectedText();
		
		if (selectedText != txt) {
			e.preventDefault();
			return false;
		}
	}

	//numeric characters, left/right key, backspace, delete
	if (charCode == 8 || charCode == 37 || charCode == 39 || charCode == 46 || (charCode >= 48 && charCode <= 57 && !isNaN(String.fromCharCode(charCode))) || (charCode >= 96 && charCode <= 105)) {
		return;
	} else {
		//comma
		e.preventDefault();
		return false;
	}
}
