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
})
.config(function($stateProvider, $urlRouterProvider) {
$stateProvider
.state('transactions', {
	url: "/transactions",
	templateUrl: "transactions.html",
	controller: 'transactionsListCtrl'
})
})
.controller('transactionsListCtrl', function($scope, $ionicLoading, $http, $state, $timeout, $filter) {
$scope.showTransactions = function(){
if(SkyNxt.ADDRESS != "" && SkyNxt.ADDRESS != undefined ){
	var transactionsdb = 'undefined';	
	$scope.groups = [];
	$scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
		  $scope.shownGroup = null;
		} else {
		  $scope.shownGroup = group;
		}
	};
	
	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};  	
		
	$scope.transactionSearch = {text : ''};
	
	$scope.clearTransactionSearch = function()
	{
		$scope.transactionSearch.text = "";
		$scope.filterTransactions();
	}
	
	$scope.filterTransactions = function(e){
		var regexVal = {'$regex': new RegExp($scope.transactionSearch.text,"i")}
		$scope.groups = transactionsdb.find({'$or':[{type: regexVal}, {dateTime: regexVal}, {from: regexVal}]});
	}
	
	$scope.getType = function(type, subtype) {
		if(type == SkyNxt.TRANSACTION_TYPE)
				return { transtype : SkyNxt.PAYMENT, icon : "ion-card" };
		if(type == SkyNxt.TYPE_COLORED_COINS && subtype == SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT)
				return { transtype : SkyNxt.SELL_ORDER, icon : 'ion-arrow-graph-down-right assertive' };
		if(type == SkyNxt.TYPE_COLORED_COINS && subtype == SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT)
				return { transtype : SkyNxt.BUY_ORDER, icon : 'ion-arrow-graph-up-right balanced' };
		if(type == SkyNxt.TYPE_COLORED_COINS && (subtype == SkyNxt.SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION || subtype == SkyNxt.SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION))
				return { transtype : SkyNxt.SELL_CANCEL, icon : 'ion-android-cancel assertive' };
		if(type == SkyNxt.TYPE_MESSAGING && subtype == SkyNxt.SUBTYPE_MESSAGING_VOTE_CASTING)
				return { transtype : SkyNxt.VOTE, icon : 'ion-speakerphone' };
		if(type == SkyNxt.TYPE_MESSAGING && subtype == SkyNxt.SUBTYPE_MESSAGING_ARBITRARY_MESSAGE)
				return { transtype : SkyNxt.MESSAGE, icon : 'ion-chatboxes' };
		return { transtype : SkyNxt.OTHER, icon : 'ion-arrow-swap' };
	}

	$scope.isFromShown = function(group){
		var retVal = $scope.isGroupShown(group);
		return ((group.type.indexOf("+") != -1) ? true : false) && retVal;
	}

	$scope.isToShown = function(group){
		var retVal = $scope.isGroupShown(group);
		return ((group.type.indexOf("-") != -1) ? true : false) && retVal
	}
	
	$scope.isAssetShown = function(group)
	{
		return group.asset && $scope.isGroupShown(group);
	}

	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});
	
	$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getBlockchainTransactions&account=' + SkyNxt.globalAddress)
    .success(function(response) {
		SkyNxt.database.removeCollection('transactions');
		transactionsdb = SkyNxt.database.addCollection('transactions');			
		$ionicLoading.hide();
		$scope.groups = [];
		for (var i=0; i < response.transactions.length; i++) {
			var trans = response.transactions[i];
			
			var fromAdd = "";
			var toAddr = "";
			var transType = $scope.getType(trans.type, trans.subtype)
			
			if(transType.transtype == SkyNxt.PAYMENT || transType.transtype == SkyNxt.MESSAGE)
			{
				var nxtAddress;
				var address = new NxtAddress();
				if (address.set(trans.sender))
					nxtAddress = address.toString();

				var addressRecipient = new NxtAddress();
				addressRecipient.set(trans.recipient);
				if(nxtAddress == SkyNxt.globalAddress)
				{
					if(transType.transtype == SkyNxt.PAYMENT)
						transType.transtype = "-" + NRS.convertToNXT(trans.amountNQT) + " NXT";
					transType.icon += " assertive";
					fromAdd = address.toString();
					toAddr = addressRecipient.toString();
				}
				else
				{
					if(transType.transtype == SkyNxt.PAYMENT)
						transType.transtype = "+" + NRS.convertToNXT(trans.amountNQT) + " NXT";
					transType.icon += " balanced";
					fromAdd = address.toString();
					toAddr = addressRecipient.toString();
				}
			}
			
			var confirmationsBlocks = '1440+';
			var confirmationsDispColor = "balanced";
			if(trans.confirmations < 1440)
			{
				confirmationsBlocks = trans.confirmations;
				confirmationsDispColor = "assertive";
			}
			
			transactionsdb.insert({type : transType.transtype, icon : transType.icon, amount : trans.amountNQT, time: trans.timestamp, from : fromAdd, to : toAddr, asset: trans.attachment.asset, confirmations : confirmationsBlocks, confirmDispColor : confirmationsDispColor, fee : trans.feeNQT, dateTime : $filter('formatTimestamp')(trans.timestamp)})
			;
			$scope.groups = transactionsdb.chain().simplesort("time").data();
		}
	})
	.error(function(response) {
	});
}
}
$scope.showTransactions();
});