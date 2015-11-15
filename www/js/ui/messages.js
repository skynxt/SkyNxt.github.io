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

var showsenderRS;
var sendersDB;
var accountmessagesDB;
SkyNxt.index.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('messages', {
      url: '/messages',
      templateUrl: 'templates/messages.html',
      controller: 'messagesCtrl'
    })
	 .state('chat', {
      url: '/chat',
      templateUrl: 'templates/chat.html',
      controller: 'chatCtrl'
    })
	 .state('compose', {
      url: '/compose',
      templateUrl: 'templates/compose.html',
      controller: 'composeCtrl'
    })
})
.controller('messagesCtrl', function($scope, $state, $http, $ionicLoading, $rootScope) {
	$rootScope.messageRecipient = "";
	$scope.$on('$ionicView.enter', function(){
		$rootScope.messageRecipient = "";
	});

	$scope.senders = [];
	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});
	
	$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getAccountTransactions&type=' + SkyNxt.TYPE_MESSAGING + '&subtype=' + SkyNxt.SUBTYPE_MESSAGING_ARBITRARY_MESSAGE + '&account=' + SkyNxt.globalAddress + '&timestamp=0')
    .success(function(response) {
		SkyNxt.database.removeCollection('senderdb');
		sendersDB = SkyNxt.database.addCollection('senderdb');
		SkyNxt.database.removeCollection('accountmessagesdb');
		accountmessagesDB = SkyNxt.database.addCollection('accountmessagesdb');
		$ionicLoading.hide();
		for (var i=0; i < response.transactions.length; i++) {
			var trans = response.transactions[i];
			accountmessagesDB.insert(trans);
			if(sendersDB.findOne({'senderRS': trans.senderRS}) == null && trans.senderRS != SkyNxt.globalAddress)
			{
				sendersDB.insert({senderRS : trans.senderRS});
				$scope.senders.push({senderRS : trans.senderRS})
			}
		}
	})
	.error(function(response) {
	});	
	
	$scope.showCompose = function()
	{
		$state.go('compose');
	}
	
	$scope.showMessages = function(senderRS){
		showsenderRS = senderRS;
		$state.go('chat');
	}
})
.controller('composeCtrl', function($scope, $state, $rootScope, $ionicPopup, $ionicLoading, $http) {
$scope.recipient_address = {text : ""};
$scope.message = {text : ""};
$scope.plainText = true;
$scope.messageSendType = "Plain Message";

$scope.toggleMessageType = function()
{
	$scope.plainText = !$scope.plainText;
	
	if($scope.plainText)
	{
		$scope.messageSendType = "Plain Message";
	}
	else
	{
		$scope.messageSendType = "Encrypted Message";
	}
}

$scope.$on('$ionicView.enter', function(){
	if($rootScope.messageRecipient)
	{
		$scope.recipient_address.text = $rootScope.messageRecipient;
	}
});

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

$rootScope.sendMessageCallBack = function(msg)
{
	if(msg == "Success")
	{
		$scope.message.text = "";
	}
	var resultPopup = $ionicPopup.show({
	title: 'Send Message',
	subTitle: 'Result: ' + msg,
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

$scope.sendMessage = function()
{
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
	if($scope.message.text == "")
	{
		var alertPopup = $ionicPopup.alert({
			title: 'Alert!',
			template: 'Blank message'
		});
		alertPopup.then(function(res) {
		});
		return;		
	}
	//calculate FEE based on message length?????????????tbd
	if($scope.plainText)
	{
		var messageBytes = converters.stringToByteArray($scope.message.text)
		SkyNxt.message_BuildHex(messageBytes, converters.stringToByteArray(""), SkyNxt.MESSAGE, $scope.recipient_address.text, $rootScope.sendMessageCallBack);
	}
	else
	{
		$ionicLoading.show({ duration: 30000, noBackdrop: true, template: '<ion-spinner icon="spiral"></ion-spinner>'});

		$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getAccountPublicKey&account=' + $scope.recipient_address.text)
		.success(function(response) {
			$ionicLoading.hide();
			if(response.publicKey != 'undefined'){
				var data = $rootScope.encryptNote($scope.message.text, converters.hexStringToByteArray(response.publicKey));
				SkyNxt.message_BuildHex(data.str, data.nonce, SkyNxt.ENCRYPTED_MESSAGE, $scope.recipient_address.text);
			}
			else
			{
				var alertPopup = $ionicPopup.alert({
					title: 'Alert!',
					template: 'Message recipient PublicKey not available'
				});
			}
		})
	}
}
})
.controller('chatCtrl', function($scope, $ionicFrostedDelegate, $ionicScrollDelegate, $rootScope, $state, $http, $ionicLoading) {
$scope.$on('$ionicView.enter', function(){
	$rootScope.messageRecipient = showsenderRS;
});
$scope.simpleHash = function(b1, b2) {
	var sha256 = CryptoJS.algo.SHA256.create();
	sha256.update(converters.byteArrayToWordArray(b1));
	if (b2) {
		sha256.update(converters.byteArrayToWordArray(b2));
	}
	var hash = sha256.finalize();
	return converters.wordArrayToByteArrayImpl(hash, false);
}

$scope.getPublicKey = function(secretPhrase) {
	var secretPhraseBytes = converters.stringToByteArray(secretPhrase);
	var digest = $scope.simpleHash(secretPhraseBytes);
	return converters.byteArrayToHexString(curve25519.keygen(digest).p);
};

$scope.getPrivateKey = function(secretPhrase) {
	var bytes = $scope.simpleHash(converters.stringToByteArray(secretPhrase));
	return converters.shortArrayToHexString(curve25519_clamp(converters.byteArrayToShortArray(bytes)));
};

$scope.getSharedKey = function(key1, key2) {
	return converters.shortArrayToByteArray(curve25519_(converters.byteArrayToShortArray(key1), converters.byteArrayToShortArray(key2), null));
}

$rootScope.encryptNote = function(message, publicKey) {
	var privateKey = converters.hexStringToByteArray($scope.getPrivateKey(SkyNxt.globalPassPhrase));
	var sharedKey = $scope.getSharedKey(privateKey, publicKey);
	var ct = new Uint8Array(converters.stringToByteArray(message));
	var compressedPlaintext = pako.gzip(ct);
	var text = converters.byteArrayToWordArray(compressedPlaintext);
	var nonce = new Uint8Array(32);
	if (window.crypto) {
		window.crypto.getRandomValues(nonce);
	} else {
		window.msCrypto.getRandomValues(nonce);
	}

	for (var i = 0; i < 32; i++) {
		sharedKey[i] ^= nonce[i];
	}

	var key = CryptoJS.SHA256(converters.byteArrayToWordArray(sharedKey));
	var tmp = new Uint8Array(16);

	if (window.crypto) {
		window.crypto.getRandomValues(tmp);
	} else {
		window.msCrypto.getRandomValues(tmp);
	}
	var iv = converters.byteArrayToWordArray(tmp);

	var encrypted = CryptoJS.AES.encrypt(text, key, {
		iv: iv
	});

	var ivOut = converters.wordArrayToByteArray(encrypted.iv);
	var ciphertextOut = converters.wordArrayToByteArray(encrypted.ciphertext);
	var data = { str : ivOut.concat(ciphertextOut),
				 nonce: nonce};
	return data;
}

$scope.decryptData = function(data, nonce, publicKey) {
	var privateKey = converters.hexStringToByteArray($scope.getPrivateKey(SkyNxt.globalPassPhrase));	
	var sharedKey = $scope.getSharedKey(privateKey, publicKey);
	if (data.length < 16 || data.length % 16 != 0) {
		throw {
			name: "invalid ciphertext"
		};
	}

	var iv = converters.byteArrayToWordArray(data.slice(0, 16));
	var ciphertext = converters.byteArrayToWordArray(data.slice(16));

	for (var i = 0; i < 32; i++) {
		sharedKey[i] ^= nonce[i];
	}

	var key = CryptoJS.SHA256(converters.byteArrayToWordArray(sharedKey));

	var encrypted = CryptoJS.lib.CipherParams.create({
		ciphertext: ciphertext,
		iv: iv,
		key: key
	});

	var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
		iv: iv
	});

	var compressedPlaintext = converters.wordArrayToByteArray(decrypted);
	var binData = new Uint8Array(compressedPlaintext);
	return converters.byteArrayToString(pako.inflate(binData));
}
	
$scope.$on('$ionicView.enter', function(){
	$scope.messages = [];
	var messageOptions = [];
	var otherpublicKey = ""

	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});

	$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getAccountPublicKey&account=' + showsenderRS)
    .success(function(response) {
		$ionicLoading.hide();
		otherpublicKey = response.publicKey;
	accountmessagesDB.removeDynamicView("sendersdv");
	var dv = accountmessagesDB.addDynamicView('sendersdv');
	dv.applyWhere(function conversation(obj){
	  return obj.senderRS.indexOf(showsenderRS) != -1 || obj.recipientRS.indexOf(showsenderRS) != -1;
	});
	var timeLine = dv.applySimpleSort("timestamp").data();
	var message = "";
	for(var i = 0; i < timeLine.length; i++)
	{
		var trans = timeLine[i];
		if(trans.attachment != undefined)
		{
			if(trans.attachment.encryptedMessage != undefined)
			{
				try
				{
					var data = converters.hexStringToByteArray(trans.attachment.encryptedMessage.data);
					var nonce = converters.hexStringToByteArray(trans.attachment.encryptedMessage.nonce);
					var publicKey = "";
					if(trans.senderRS.indexOf(SkyNxt.globalAddress) != -1)
						publicKey = otherpublicKey;
					else
						publicKey = trans.senderPublicKey;
					
					if(trans.attachment.encryptedMessage.isCompressed)
					{
						var decryptedMsg = "";
						try
						{
							decryptedMsg = $scope.decryptData(data, nonce, converters.hexStringToByteArray(publicKey));
						}
						catch(e)
						{
							decryptedMsg = "error";
						}
						message = message + "<p>" + decryptedMsg + "</p>";
					}
				}
				catch(e)
				{
					console.log(e)
				}
			}
			if(trans.attachment.message != undefined)
			{
				message = message + "<p>" + trans.attachment.message + "</p>";
			}
/*			if( trans.attachment["version.PrunableEncryptedMessage"] != undefined)
			{
				//?????????????find is the structure????????????
				message = "<p></p>";
			}*/
		}
		
		if( i > 0 && (timeLine[i].senderRS == timeLine[i-1].senderRS || timeLine[i].recipientRS == timeLine[i-1].recipientRS))
		{
			var prevMessage = messageOptions[messageOptions.length-1];
			prevMessage["content"] = prevMessage["content"] + "<br>" + message;
			message = "";
		}
		else
		{
			messageOptions.push({content : message});
			message = "";
		}
	}
	messageOptions.push({content : ''});
	$scope.messages = messageOptions.slice(0, messageOptions.length);		
	})
	.error(function(response) {
	});
})
})