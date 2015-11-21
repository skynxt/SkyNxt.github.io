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
SkyNxt.index.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('sendNxt', {
      url: '/sendNxt',
      templateUrl: 'templates/sendNxt.html',
      controller: 'SendNxtCtrl'
    });
})
.controller('SendNxtCtrl', function($scope, $state, $http, $ionicPopup, $rootScope, $timeout) {
	$scope.globalAddress = SkyNxt.globalAddress;
	$scope.balance = "";
	$scope.amtNxt = {
			text: ''
	};
	$scope.recipient_address = {
			text: ''
	}
	$scope.balance_spinner = true;
	
$scope.keydownevent = function(e){
	SkyNxt.keydownevent(e, $scope.amtNxt.text, 8);
}
	
$scope.accountBalance = function(){
if(SkyNxt.ADDRESS != "" && SkyNxt.ADDRESS != undefined ){
	$scope.balance = "";
	$scope.balance_spinner = true;
	$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getBalance&account=' + SkyNxt.globalAddress)	
	.success(function(response) {			
		$scope.balance_spinner = false;
		$scope.balance = NRS.convertToNXT(response.unconfirmedBalanceNQT);			
	})
	.error(function(response) {
		$scope.balance_spinner = false;
	});
}
}

$scope.checkRecipient = function() {
	$scope.recipient_address.text = $.trim($scope.recipient_address.text);
	if (/^(NXT\-)?[A-Z0-9]+\-[A-Z0-9]+\-[A-Z0-9]+\-[A-Z0-9]+/i.test($scope.recipient_address.text)) {
		var address = new NxtAddress();
		if (address.set($scope.recipient_address.text)) {
			return true;
		}
	} else {
			return false;
	}
}

$rootScope.sendNxtCallBack = function(msg)
{
	if(msg == "Success")
	{
		$scope.amtNxt.text = "";
		$scope.recipient_address.text = "";
	}

	var resultPopup = $ionicPopup.show({
	title: 'Send Nxt',
	subTitle: 'Result: Payment ' + msg,
	scope: $scope,
	buttons: [
	{ text: 'Close' }
	]
	});
	resultPopup.then(function(res) {
		resultPopup.close();
	});
	$timeout(function() {
		resultPopup.close(); //close the popup after 3 seconds
	}, 3000);
}

$scope.sendNxtBtnClick = function()
{
	inputOptions = "Recipient: " + $scope.recipient_address.text + "<br>Amount: " + $scope.amtNxt.text + " Nxt<br>Fee: 1 Nxt";
	var inputAmt = parseFloat($scope.amtNxt.text);
	var availableBal = parseFloat($scope.balance);

	if(!$scope.checkRecipient())
	{
		var alertPopup = $ionicPopup.alert({
			title: 'Alert!',
			template: 'Incorrect Recipient NXT Address'
		});
		alertPopup.then(function(res) {
		});
		return;
	}
	
	if(!isNaN($scope.amtNxt.text) && inputAmt < availableBal)
	{
		var confirmPopup = $ionicPopup.confirm({
			title: 'Confirm Send NXT',
			template: inputOptions
		});	
		confirmPopup.then(function(res) {
			if(res) {
				var send_amount_NQT = NRS.convertToNQT($scope.amtNxt.text);
				var recipient_addr = String($scope.recipient_address.text);
				SkyNxt.sendNxtAmt_BuildHex(send_amount_NQT, recipient_addr, $rootScope.sendNxtCallBack);
			}
		});
	}
	else
	{
		if(isNaN($scope.amtNxt.text))
		{
			var alertPopup = $ionicPopup.alert({
				title: 'Alert!',
				template: 'Incorrect Nxt Amount'
			});
			alertPopup.then(function(res) {
			});					
		}
		if(!isNaN($scope.amtNxt.text) && inputAmt > availableBal)
		{
			var alertPopup = $ionicPopup.alert({
				title: 'Alert!',
				template: 'Insufficient balance'
			});
			alertPopup.then(function(res) {
			});				
		}
	}
}

$scope.scanBarCode = function()
{
	try {
	cordova.plugins.barcodeScanner.scan(
	  function (result) {		
		  if(result.cancelled == false && result.format == "QR_CODE")
		  {			  
			  $scope.recipient_address.text = String(result.text);
		  }
	  }, 
	  function (error) {
	  }
   );
   } catch (e) {
			
		}
}
	
$scope.accountBalance();
});
