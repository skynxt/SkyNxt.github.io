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
    .state('settings', {
      url: '/settings',
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })
})
.controller('SettingsCtrl', function($scope, $state, $ionicLoading, $http, $ionicPopup) { 
$scope.httpsConnDone = false;
$scope.select = {name : 'auto'};
$scope.ip = {text : ''};
$scope.port = {text : ''};
$scope.peerInput = false;

$scope.peerSettings = function(){
	if($scope.select.name == "node")
	{
		$scope.peerInput = true;
	}
	else
	{
		SkyNxt.discover()
		$scope.peerInput = false;
	}
}

$scope.testNode = function()
{
	$ionicLoading.show({duration: 30000, noBackdrop: true, template: '<ion-spinner icon="android"></ion-spinner>'});
	$scope.httpsConnDone = false;
	$scope.testIPAddress();
	$ionicLoading.hide();
}

$scope.testIPAddress = function()
{	
		var ip = String($scope.ip.text).replace(/\s+/g, '');
		var port = String($scope.port.text).replace(/\s+/g, '');
		var addr = ip + ":" + port;
		
		if($scope.httpsConnDone)
			addr = SkyNxt.HTTPS_NODE + addr;
		else
			addr = SkyNxt.HTTP_NODE + addr;

	$http.get(addr +'/nxt?requestType=getBlockchainStatus')	
    .success(function(response) {
		if(response.numberOfBlocks > 0)
		{
			var IP = "";
			if($scope.httpsConnDone)
			{
				IP = SkyNxt.HTTPS_NODE + ","+ String($scope.ip.text);
				SkyNxt.ADDRESS = SkyNxt.HTTPS_NODE;
			}
			if(!$scope.httpsConnDone)
			{
				IP = SkyNxt.HTTP_NODE + "," + String($scope.ip.text);
				SkyNxt.ADDRESS = SkyNxt.HTTP_NODE;
			}
			
			PORT = String($scope.port.text);
			var nodeDetails = IP + "," + PORT;
			SkyNxt.ADDRESS = SkyNxt.ADDRESS + String($scope.ip.text) + ":" + PORT;
			var userdbs = SkyNxt.usersettings.getCollection(SkyNxt.USER_SETTING_COLLECTION);
			if(userdbs != undefined)
			{
				var trustedPeerdata = userdbs.findOne({'key' : SkyNxt.TRUSTED_PEERS});
				trustedPeerdata.value = nodeDetails;
			}
			$ionicPopup.alert({
				title: 'Test result',
				template: 'Node connection success!'
			});
		}
		else
		{
			$ionicPopup.alert({
				title: 'Error',
				template: 'Error returned by Node. Please check the your Node configuration.'
			});
		}
	})
	.error(function(response) {
		if (!$scope.httpsConnDone)
		{
			$scope.httpsConnDone = true;
			$scope.testIPAddress();//failed with http, try https
		}
		else
		{
			$ionicPopup.alert({
				title: 'Test result',
				template: 'Node Unreachable. Please check the your Node configuration.'
			});
		}
	});	
}
});