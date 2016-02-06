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

SkyNxt.globalPassPhrase = "";
SkyNxt.globalAddress = "";

SkyNxt.index.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: '/log-in',
      templateUrl: 'templates/log-in.html',
      controller: 'LogInCtrl'
    })
   $urlRouterProvider.otherwise('/log-in');
})
.controller('LogInCtrl', function($scope, $state, $ionicModal) {
$scope.passphrase = {
        text: ''
};
$scope.globalAddress = "";
$scope.showPassphrase = "ion-eye";
$scope.passPhrase = "text";

$scope.switchPassphraseView = function()
{
	if($scope.passPhrase === "text")
	{
		$scope.showPassphrase = "ion-eye-disabled";
		$scope.passPhrase = "password";
	}
	else
	{
		$scope.showPassphrase = "ion-eye";
		$scope.passPhrase = "text";
	}
}

$scope.passPhraseEntered = function()
{
if($scope.passphrase.text == "")
{
	$scope.qrcode = "";
	$scope.globalAddress = "";
}
else
{
	SkyNxt.globalPassPhrase = $scope.passphrase.text;
	var secretPhraseBytes = converters.stringToByteArray($scope.passphrase.text);
	var digest = SkyNxt.simpleHash(secretPhraseBytes);
	var publicKey = converters.byteArrayToHexString(curve25519.keygen(digest).p);

	var hex = converters.hexStringToByteArray(publicKey);
	SkyNxt._hash.init();
	SkyNxt._hash.update(hex);
	var account = SkyNxt._hash.getBytes();
	account = converters.byteArrayToHexString(account);
	var slice = (converters.hexStringToByteArray(account)).slice(0, 8);
	var accountId = SkyNxt.byteArrayToBigInteger(slice).toString();

	var address = new NxtAddress();
	if (address.set(accountId))
	{
		$scope.globalAddress = SkyNxt.globalAddress = address.toString();
	}
}
};

$scope.logIn = function() {
	$scope.passphrase.text = "";
	$state.go('account');
};

$scope.logOut = function() {
	delete $scope.passphrase.text;
	delete SkyNxt.globalPassPhrase;
	delete SkyNxt.globalAddress;
	//save to file
	if(navigator.app)
		navigator.app.exitApp();
};

$ionicModal.fromTemplateUrl('templates/qr.html', {
	scope: $scope
}).then(function(qr) {
	$scope.qr = qr;
});

$scope.showQR = function(){
if(SkyNxt.globalAddress != "")
{
	$scope.passphrase.text = "";
	var qrCode = qrcode(3, 'M');
    var text = SkyNxt.globalAddress.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
	qrCode.addData(text);
	qrCode.make();
	$scope.qrcode = qrCode.createImgTag(5);	
	$scope.qr.show();
}
};
})
