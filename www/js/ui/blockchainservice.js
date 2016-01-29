// The MIT License (MIT)

// Copyright (c) 2016 SkyNxt.

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
    .state('blockchainservice', {
      url: '/blockchainservice',
      templateUrl: 'templates/blockchainservice.html',
      controller: 'blockchainserviceCtrl'
    })
    .state('proofofexistence', {
      url: '/proofofexistence',
      templateUrl: 'templates/proofofexistence.html',
      controller: 'proofCtrl'
    })
})
.directive("ngFileSelect",function() {
  return {
    link: function($scope,el){
      el.bind("change", function(e){
        $scope.file = (e.srcElement || e.target).files[0];
        $scope.getFile($scope.file, $scope);
      });
    }
  }
})
.controller('blockchainserviceCtrl', function($scope) {
})
.controller('proofCtrl', function($scope, $http, $ionicPopup, $ionicLoading, $rootScope) {
$scope.prove = true;
$scope.submitType = "Submit Proof";
$scope.statusTxt = "Please select file(s) to submit proof";
$scope.items = [];
$scope.hashItems = [];
$scope.merkelRootProof = "";
$scope.hashItemsProof = [];
$scope.data = { showDelete:true };

$scope.$on("fileProgress", function(e, progress) {
	$scope.progress = progress.loaded / progress.total;
});

$scope.onItemDelete = function(item) {
	delete $scope.hashItems[item.hexProof];
	$scope.items.splice($scope.items.indexOf(item), 1);
};

$scope.getFile = function (file, $scope) {
	var reader = new FileReader();

	reader.onloadend = function(e){
		var hexHash = converters.byteArrayToHexString(converters.wordArrayToByteArray(CryptoJS.SHA256(e.target.result)));
		if(!$scope.prove)
		{
			var found = false;
			for(var i = 0; i < $scope.hashItemsProof.length && !found; i++)
			{
				if($scope.hashItemsProof[i] === hexHash)
				{
					found = true;
					break;
				}
			}
			if(!found)
			{
				$ionicLoading.show({ template: 'File does not match data in proof receipt!', noBackdrop: true, duration: 6000 });
				return;
			}
		}
		if(!$scope.hashItems[hexHash])
		{
			$scope.hashItems[hexHash] = file.name;
			console.log($scope.hashItems);
			var hashFileData = {fileName : file.name, hexProof : hexHash};
			$scope.items.push(hashFileData);
			$scope.$apply();
		}
	}
	reader.readAsBinaryString(file);
};

$rootScope.merkleRootCommitCallBack = function(msg)
{
	if(msg.errorCode)
	{
		var resultPopup = $ionicPopup.show({
		title: 'Error',
		subTitle: msg.errorDescription,
		scope: $scope,
		buttons: [
		{ text: 'Close' }
		]
		});
		resultPopup.then(function(res) {
			resultPopup.close();
		});
	}
	else
	{
		$scope.receipt = {text : ""};
		$scope.receipt.text = JSON.stringify({ transaction : msg.transaction,  hashItems: Object.keys($scope.hashItems) });
		var templateReceipt = "<textarea class='text' ng-model='receipt.text'/>";
		var resultPopup = $ionicPopup.show({
		template: templateReceipt,
		title: 'Proof receipt',
		subTitle: 'Please COPY following receipt, save it in a safe place to verify proof anytime',
		scope: $scope,
		buttons: [
		{ 	text: 'Copied & saved, Close',
			onTap : function(e){
				$scope.items = [];
				$scope.hashItems = [];
			}
		}
		]
		});
		resultPopup.then(function(res) {
			resultPopup.close();
		});
	}
}

$scope.submit = function()
{
	if($scope.prove)
	{
		var transactions = Object.keys($scope.hashItems);
		if(transactions.length > 0)
		{
			var merkleRoot = getMerkleRoot(transactions);
			var messageBytes = converters.stringToByteArray(merkleRoot)
			var messageFee = Math.ceil(messageBytes.length/32);
			messageFee = SkyNxt.FEE_NQT * messageFee;
			SkyNxt.message_BuildHex(messageBytes, converters.stringToByteArray(""), SkyNxt.MESSAGE, SkyNxt.globalAddress, messageFee.toString(), $rootScope.merkleRootCommitCallBack);
		}
	}
	else
	{
		if($scope.items.length == 0)
		{
			$ionicLoading.show({ template: 'Select files to verify!', noBackdrop: true, duration: 4000 });
			return;
		}
		var merkleRoot = getMerkleRoot($scope.hashItemsProof);
		if(merkleRoot === $scope.merkelRootProof)
		{
			$ionicLoading.show({ template: 'Verification success on Blockchain against the receipt!', noBackdrop: true, duration: 4000 });
		}
		else
		{
			$ionicLoading.show({ template: 'Verification failed!', noBackdrop: true, duration: 4000 });
		}
	}
}

$scope.verifyProof = function()
{
	$scope.verify = {text: ""};
	var resultPopup = $ionicPopup.show({
	title: 'Verification of proof',
	subTitle: 'Please input your receipt here against which you want to verify file(s)',
	template: "<textarea class='text' ng-model='verify.text'/>",
	scope: $scope,
	buttons: [
		{ 	text: 'OK',
			onTap: function(e) {
				if($scope.verify.text)
				{
					var parsedJson = "";
					try{
						parsedJson = $.parseJSON($scope.verify.text);
					}
					catch(ex)
					{
					}
					if (parsedJson.transaction) {
						$ionicLoading.show({duration: 30000, noBackdrop: true, template: '<ion-spinner icon="spiral"></ion-spinner>'});
						$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getTransaction&transaction=' + $scope.verify.text.transaction)
						.success(function(response) {
							$ionicLoading.hide();
							if(response.errorCode)
							{
								$scope.toggleProofVerify();
							}
							else
							{
								if(response.attachment && response.attachment.message)
								{
									$scope.merkelRootProof = response.attachment.message;
									$scope.hashItemsProof = parsedJson.hashItems;
								}
								else
								{
									$ionicLoading.show({ template: 'Incorrect receipt!', noBackdrop: true, duration: 4000 });
									$scope.toggleProofVerify();
								}
							}
						})
						.error(function(response) {
							$ionicLoading.hide();
							$ionicLoading.show({ template: 'Alert - Network connection failed!', noBackdrop: true, duration: 4000 });
							$scope.toggleProofVerify();
						});
					}
					else
					{
						resultPopup.close();
						$ionicLoading.show({ template: 'Incorrect receipt!', noBackdrop: true, duration: 4000 });
						$scope.toggleProofVerify();
					}
				}
				else
				{
					$scope.toggleProofVerify();
				}
			}
		}
	]
	});
}

$scope.toggleProofVerify = function()
{
	$scope.prove = !$scope.prove;
	if($scope.prove)
	{
		$scope.statusTxt = "Select file(s) to submit proof";
		$scope.submitType = "Submit Proof";
	}
	else
	{
		$scope.verifyProof();
		$scope.statusTxt = "Select file(s) to verify proof";
		$scope.submitType = "Verify Proof";
	}
	$scope.merkelRootProof = "";
	$scope.items = [];
	$scope.hashItems = [];
	$scope.hashItemsProof = [];
}
});