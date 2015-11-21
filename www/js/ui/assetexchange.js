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

SkyNxt.currentAsset = 'undefined';
SkyNxt.MAX_DECIMALS = 8;
SkyNxt.index.config(function($stateProvider, $urlRouterProvider) {
})
.config(function($stateProvider, $urlRouterProvider) {
$stateProvider
.state('portfolio', {
	url: "/portfolio",
	templateUrl: "portfolio.html",
	controller: 'portfolioListCtrl'
})
.state('assetmenu', {
  url: "/event",
  abstract: true,
  templateUrl: "asset-menu.html"
})
.state('assetmenu.buy', {
  url: "/buy",
  views: {
	'menuContent' :{
	  templateUrl: "buy.html",
	  controller: "buyTabCtrl"
	}
  }
})
.state('assetmenu.sell', {
  url: "/sell",
  views: {
	'menuContent' :{
	  templateUrl: "sell.html",
	  controller: "sellTabCtrl"
	}
  }
})
.state('assetmenu.orders', {
  url: "/orders",
  views: {
	'menuContent' :{
	  templateUrl: "orders.html",
	  controller: "ordersTabCtrl"
	}
  }
})
.state('assetmenu.chart', {
  url: "/chart",
  views: {
	'menuContent' :{
	  templateUrl: "chart.html",
	  controller: "chartTabCtrl"
	}
  }
})
.state('assetmenu.history', {
  url: "/history",
  views: {
	'menuContent' :{
	  templateUrl: "history.html",
	  controller: "tradeHistoryTabCtrl"
	}
  }
})
.state('assetmenu.assetinfo', {
  url: "/assetinfo",
  views: {
	'menuContent' :{
	  templateUrl: "assetinfo.html",
	  controller: "assetInfoTabCtrl"
	}
  }
})
})
.controller('portfolioListCtrl', function($scope, $ionicLoading, $http, $state, $ionicPopup, $ionicModal) {
if(SkyNxt.ADDRESS != "" && SkyNxt.ADDRESS != undefined ){	
	var assetsdb = 'undefined';	
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

	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});
	
	$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getAccountAssets&account=' + SkyNxt.globalAddress + "&includeAssetInfo=true")
    .success(function(response) {
		SkyNxt.database.removeCollection('assets');
		assetsdb = SkyNxt.database.addCollection('assets');			
		$ionicLoading.hide();
		$scope.groups = [];
		for (var i=0; i < response.accountAssets.length; i++) {
			var asset = response.accountAssets[i];
			assetsdb.insert({asset : asset.asset, name : asset.name, quantityQNT: asset.quantityQNT, decimals : parseInt(asset.decimals, 10)});
			$scope.groups.push(asset);
		}
	})
	.error(function(response) {
	});

	$scope.assetID = {
		text : ""
	}
	
	$scope.addToPortfolio = function()
	{
		if(SkyNxt.ADDRESS != "" && SkyNxt.ADDRESS != undefined ){
			$ionicLoading.show({
				duration: 30000,
				noBackdrop: true,
				template: '<ion-spinner icon="spiral"></ion-spinner>'
			});
			
			$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getAsset&asset=' + $scope.assetID.text)
			.success(function(response) {
				$ionicLoading.hide();
				if(assetsdb == undefined)//????????????????????????????????????????????????????
				{
					assetsdb = SkyNxt.database.addCollection('assets');
				}
				response.quantityQNT = 0;
				assetsdb.insert(response);
				$scope.groups.unshift(response);
			})
			.error(function(response) {
			});
		}
	}

	$scope.addAssetID = function(){		
		var popUpBody = "<label class='item item-input item-floating-label'><span class='input-label'>Asset ID</span><input type='text' ng-model='assetID.text' placeholder='Enter Asset ID'></label>";
		
		var addAssetPopUp = $ionicPopup.show({
			 template: popUpBody,
			 title: 'Enter Asset ID',			 
			 scope: $scope,
			 buttons: [
			   { text: 'Cancel' },
			   {
				 text: '<b>Add</b>',
				 type: 'button-positive',
				 onTap: function(e) {
				   if (!$scope.assetID.text) {					 
					 e.preventDefault();
				   } else {					 
					 $scope.addToPortfolio();					 
				   }
				 }
			   },
			 ]
		   });
	}
	
	$scope.assetTabs = function(asset){
		SkyNxt.currentAsset = asset;
		$state.go('assetmenu.buy')
	}
}
})
.controller('buyTabCtrl', function($rootScope, $scope, $ionicLoading, $ionicPopup, $http, $filter) {
$scope.$on('$ionicView.enter', function(){ 
if(SkyNxt.currentAsset.decimals <= SkyNxt.MAX_DECIMALS )
{
	$scope.askorders = [];
	$scope.currentAsset = SkyNxt.currentAsset;
	$scope.buyprice = {
			text: ''
	};
	$scope.buyquantity = {
			text: ''
	}

	$scope.keydowneventPrice = function(e){
		SkyNxt.keydownevent(e, $scope.buyprice.text, SkyNxt.MAX_DECIMALS - SkyNxt.currentAsset.decimals);
	}

	$scope.keydowneventQuantity = function(e){
		SkyNxt.keydownevent(e, $scope.buyquantity.text, SkyNxt.currentAsset.decimals);
	}

	$scope.buyOrders = function(){
	$scope.currentAsset = SkyNxt.currentAsset;
	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});

	orderType = "getAskOrders";
	$http.get(SkyNxt.ADDRESS +'/nxt?requestType='+ orderType +'&asset=' + $scope.currentAsset.asset)
    .success(function(response) {
		SkyNxt.database.removeCollection('askOrders');
		askordersdb = SkyNxt.database.addCollection('askOrders');
		$ionicLoading.hide();
		$scope.askorders = [];
		for (var i=0; i < response.askOrders.length; i++) {
			response.askOrders[i]["priceINT"] = parseInt(response.askOrders[i].priceNQT);
			askordersdb.insert(response.askOrders[i]);
		}
		$scope.askorders = askordersdb.chain().simplesort("priceINT").data();
	})
	.error(function(response) {
	});
	}
	
	$scope.setaskOrder = function(askorder)
	{
		$scope.buyprice.text = $filter('formatPrice')(askorder.priceNQT, SkyNxt.currentAsset.decimals);
		$scope.buyquantity.text = $filter('formatQuantity')(askorder.quantityQNT, SkyNxt.currentAsset.decimals);
	}
	
	$scope.buy = function()
	{
		if(!isNaN($scope.buyprice.text) && !isNaN($scope.buyquantity.text))
		{
			inputOptions = "Asset: " + SkyNxt.currentAsset.name + "<br>Asset ID: " + SkyNxt.currentAsset.asset + "<br>Buy Price: " + $scope.buyprice.text + " NXT<br>Buy Quantity: " + $scope.buyquantity.text + "<br>Fee: 1 Nxt";

			var confirmPopup = $ionicPopup.confirm({
				title: 'Confirm Buy order',
				template: inputOptions
			});	
			confirmPopup.then(function(res) {
				if(res) {
					var assetId = new BigInteger(String(SkyNxt.currentAsset.asset));
					var quantityQNT = new BigInteger(NRS.convertToQNT(String($scope.buyquantity.text), SkyNxt.currentAsset.decimals));
					var priceNQT = new BigInteger(NRS.convertToNQT(String($scope.buyprice.text), SkyNxt.currentAsset.decimals));			
					var order = new BigInteger("0");
					SkyNxt.placeAssetOrder_BuildHex("buy", assetId.toString(), quantityQNT.toString(), priceNQT.toString(), order.toString());
				}
			});			
		}
		else
		{
			var alertPopup = $ionicPopup.alert({
				title: 'Alert!',
				template: 'Incorrect input'
			});
			alertPopup.then(function(res) {
			});					
		}
	}
}
	$scope.buyOrders();
});
})
.controller('sellTabCtrl', function($rootScope, $scope, $ionicLoading, $ionicPopup, $http, $filter) {
$scope.$on('$ionicView.enter', function(){ 
if( SkyNxt.currentAsset.decimals <= SkyNxt.MAX_DECIMALS ){
	$scope.bidorders = [];
	$scope.currentAsset = SkyNxt.currentAsset;
	$scope.sellprice = {
			text: ''
	};

	$scope.sellquantity = {
			text: ''
	}

	$scope.keydowneventPrice = function(e){
		SkyNxt.keydownevent(e, $scope.sellprice.text, SkyNxt.MAX_DECIMALS - SkyNxt.currentAsset.decimals);
	}

	$scope.keydowneventQuantity = function(e){
		SkyNxt.keydownevent(e, $scope.sellquantity.text, SkyNxt.currentAsset.decimals);
	}

	$scope.sellOrders = function(){
	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});
	$scope.currentAsset = SkyNxt.currentAsset;
	orderType = "getBidOrders";
	$http.get(SkyNxt.ADDRESS +'/nxt?requestType='+ orderType +'&asset=' + $scope.currentAsset.asset)
    .success(function(response) {
		SkyNxt.database.removeCollection('bidOrders');
		bidordersdb = SkyNxt.database.addCollection('bidOrders');			
		$ionicLoading.hide();
		$scope.bidorders = [];
		for (var i=0; i < response.bidOrders.length; i++) {			
			response.bidOrders[i]["priceINT"] = parseInt(response.bidOrders[i].priceNQT);
			bidordersdb.insert(response.bidOrders[i]);
		}
		$scope.bidorders = bidordersdb.chain().simplesort("priceINT").data();	
	})
	.error(function(response) {
	});
	}
	$scope.setbidOrder = function(bidorder)
	{
		$scope.sellprice.text = $filter('formatPrice')( bidorder.priceNQT, SkyNxt.currentAsset.decimals);
		$scope.sellquantity.text = $filter('formatQuantity')(bidorder.quantityQNT, SkyNxt.currentAsset.decimals);
	}	

	$scope.sell = function()
	{
		if(!isNaN($scope.sellprice.text) && !isNaN($scope.sellquantity.text))
		{
			inputOptions = "Asset: " + SkyNxt.currentAsset.name + "<br>Asset ID: " + SkyNxt.currentAsset.asset + "<br>Sell Price: " + $scope.sellprice.text + " NXT<br>Sell Quantity: " + $scope.sellquantity.text + "<br>Fee: 1 Nxt";

			var confirmPopup = $ionicPopup.confirm({
				title: 'Confirm Sell order',
				template: inputOptions
			});	
			confirmPopup.then(function(res) {
				if(res) {
					var assetId = new BigInteger(String(SkyNxt.currentAsset.asset));
					var quantityQNT = new BigInteger(NRS.convertToQNT(String($scope.sellquantity.text), SkyNxt.currentAsset.decimals));
					var priceNQT = new BigInteger(NRS.convertToNQT(String($scope.sellprice.text), SkyNxt.currentAsset.decimals));			
					var order = new BigInteger("0");
					SkyNxt.placeAssetOrder_BuildHex("sell", assetId.toString(), quantityQNT.toString(), priceNQT.toString(), order.toString());
				}
			});			
		}
		else
		{
			var alertPopup = $ionicPopup.alert({
				title: 'Alert!',
				template: 'Incorrect input'
			});
			alertPopup.then(function(res) {
			});					
		}
	}

	$scope.sellOrders();
}
})
})
.controller('ordersTabCtrl', function($rootScope, $scope, $ionicLoading, $http, $ionicPopup, $filter) {
$scope.$on('$ionicView.enter', function(){ 
	var openbidordersdb;
	var openaskordersdb;
	$scope.openaskorders = [];
	$scope.openbidorders = [];
	$scope.currentAsset = SkyNxt.currentAsset;
	
	var orderType = 'undefined';
	$scope.openOrderTxt = "Open Sell orders";
	$scope.openOrderStatus = "true";
	
	$scope.orderstatus = function(){
		return $scope.openOrderStatus;
	}
	$scope.toggleOpenOrders = function()
	{
		$scope.openOrderStatus = !$scope.openOrderStatus;		
		if($scope.openOrderStatus)
		{
			$scope.openOrderTxt = "Open Sell orders";
			$scope.openAskOrders()
		}
		else
		{
			$scope.openOrderTxt = "Open Buy orders";
			$scope.openBidOrders()
		}
	}
	
	$scope.openAskOrders = function(){
	$scope.currentAsset = SkyNxt.currentAsset;
	orderType = 'getAccountCurrentAskOrders';
	$scope.openaskorders = [];
	SkyNxt.database.removeCollection('openordersask');
	openaskordersdb = SkyNxt.database.addCollection('openordersask');	
	
	$ionicLoading.show({ duration: 30000, noBackdrop: true, template: '<ion-spinner icon="spiral"></ion-spinner>' });

	$http.get(SkyNxt.ADDRESS +'/nxt?requestType='+ orderType +'&account=' + SkyNxt.globalAddress + '&asset=' + $scope.currentAsset.asset)
    .success(function(response) {
		$ionicLoading.hide();
		
		for (var i=0; i < response.askOrders.length; i++) {			
			openaskordersdb.insert(response.askOrders[i]);
		}
		
		$scope.openaskorders = openaskordersdb.chain().simplesort("height").data();	
	})
	.error(function(response) {
	});
	}
	
	$scope.openBidOrders = function(type){
	$scope.currentAsset = SkyNxt.currentAsset;
	orderType = 'getAccountCurrentBidOrders';		
	$scope.openbidorders = [];
	SkyNxt.database.removeCollection('openordersbid');
	openbidordersdb = SkyNxt.database.addCollection('openordersbid');
	
	$ionicLoading.show({ duration: 30000, noBackdrop: true, template: '<ion-spinner icon="spiral"></ion-spinner>' });

	$http.get(SkyNxt.ADDRESS +'/nxt?requestType='+ orderType +'&account=' + SkyNxt.globalAddress + '&asset=' + $scope.currentAsset.asset)
    .success(function(response) {
		$ionicLoading.hide();
		
		for (var i=0; i < response.bidOrders.length; i++) {
			openbidordersdb.insert(response.bidOrders[i]);
		}
		
		$scope.openbidorders = openbidordersdb.chain().simplesort("height").data();
	})
	.error(function(response) {
	});
	}
	$scope.order = ""; 
	$scope.type = "";
	$scope.cancelOrder = function(openOrder, type){
			$scope.type = type;
			if(type == "sell")
			{
				$scope.order = openaskordersdb.findOne({'order' : openOrder.order});
			}
			else
			{
				$scope.order = openbidordersdb.findOne({'order' : openOrder.order});
			}
			if($scope.order != null)
			{
				var confirmorderdetails = "<br>Asset: " + SkyNxt.currentAsset.name + "<br> Price: " + $filter('formatPrice')($scope.order.priceNQT, SkyNxt.currentAsset.decimals) + " NXT<br>Quantity: " + $filter('formatQuantity')($scope.order.quantityQNT, SkyNxt.currentAsset.decimals) + "<br> Order: " + $scope.order.order + "<br>Fee: 1 NXT";
				var confirmPopup = $ionicPopup.confirm({
					title: 'Cancel ' + type + ' Order',
					template: confirmorderdetails//'Do you want to cancel this ' + type + ' Order?' + confirmorderdetails
				});	
				confirmPopup.then(function(res) {
					if(res) {						
						var assetId = new BigInteger(String(SkyNxt.currentAsset.asset));
						var quantityQNT = new BigInteger($scope.order.quantityQNT);
						var priceNQT = new BigInteger($scope.order.priceNQT);
						var orderCancel = new BigInteger($scope.order.order);

						if(type == "sell")
						{
							SkyNxt.placeAssetOrder_BuildHex("sell_cancel", assetId.toString(), quantityQNT.toString(), priceNQT.toString(), orderCancel);
						}
						else
						{
							SkyNxt.placeAssetOrder_BuildHex("buy_cancel", assetId.toString(), quantityQNT.toString(), priceNQT.toString(), orderCancel);							
						}
						$scope.order = ""; 
						$scope.type = "";						
					} 
				});
			}		
	}
	
	$scope.openAskOrders();	
})
})
.controller('chartTabCtrl', function($rootScope, $scope, $ionicLoading, $http, $filter) {
$scope.$on('$ionicView.enter', function(){ 
	$scope.currentAsset = SkyNxt.currentAsset;
	$scope.drawGraph = function(){
	$scope.currentAsset = SkyNxt.currentAsset;
	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});

	orderType = "getBidOrders";
	$http.get(SkyNxt.ADDRESS +'/nxt?requestType=getTrades&asset=' + SkyNxt.currentAsset.asset)
   .success(function(response) {
	    $ionicLoading.hide();
		SkyNxt.database.removeCollection('graphdb');
		graphDataDB = SkyNxt.database.addCollection('graphdb');
		for (var i=0; i < response.trades.length; i++) {			
			graphDataDB.insert(response.trades[i]);
		}		
		var sortedList = graphDataDB.chain().simplesort("timestamp").data();
		graphDataLabel = [];
		var graphDataPrice = [];
		for(var i = 0; i < sortedList.length; i++)
		{
			graphDataLabel.push(parseInt(sortedList[i].timestamp));				
			graphDataPrice.push(parseFloat($filter('formatPrice')(sortedList[i].priceNQT, SkyNxt.currentAsset.decimals)));			
		}
		
		chartData = {
			labels: graphDataLabel,
			series: [graphDataPrice]
		};

	if(graphDataLabel.length > 0)
	{
		var labelPlacement = 20;
		if($(window).width() > $(window).height())
		{
			$("#chart" ).removeClass( "ct-square" ).addClass( "ct-major-tenth" );
			labelPlacement = 10;
		}
		else		
			$("#chart" ).removeClass( "ct-major-tenth" ).addClass( "ct-square" );
		
		var i = -1;
		chartOptions = {
		showArea: true,

		  axisX: {
		  labelInterpolationFnc: function(value) {
				i++;
			  if(i == 0 || (i == graphDataLabel.length-labelPlacement))
			  {				  
				  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];	
				  var str = "";
				  var timestamp;
				  if(i == 0)
				  {
					  timestamp = parseInt(value);
				  }
				  else
				  {
					  timestamp = parseInt(graphDataLabel[i+labelPlacement-1]);					  
				  }
				  var date = new Date(NRS.formatTimestamp(timestamp));
				  str = date.getDate() + "-" + monthNames[date.getMonth()].slice(0,3) + "-" + String(date.getFullYear()).slice(2,4);
				  return str;
			  }
			else
				return "";			
			  },
			
			onlyInteger: true,			
			showGrid: false,
		  }
		};

		var chartDrawn = new Chartist.Line("#assetchart",chartData, chartOptions);		
	}		
	})
	.error(function(response) {
	});
	}
	$scope.drawGraph();
})
})
.controller('tradeHistoryTabCtrl', function($rootScope, $scope, $ionicLoading, $http, $filter) {
$scope.$on('$ionicView.enter', function(){ 
	$scope.currentAsset = SkyNxt.currentAsset;
	$scope.tradeHistory = [];		
	
	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});
	
	$http.get(SkyNxt.ADDRESS +'/nxt?requestType=getTrades&asset=' + SkyNxt.currentAsset.asset)
   .success(function(response) {
	    $ionicLoading.hide();
		SkyNxt.database.removeCollection('tradehistorydb');
		tradeHistoryDB = SkyNxt.database.addCollection('tradehistorydb');
		for (var i=0; i < response.trades.length; i++) {			
			tradeHistoryDB.insert(response.trades[i]);
		}		
		$scope.tradeHistory = tradeHistoryDB.chain().simplesort("timestamp").data();	
	})
	.error(function(response) {
	});
})
})
.controller('assetInfoTabCtrl', function($rootScope, $scope, $ionicLoading, $http, $filter) {
$scope.$on('$ionicView.enter', function(){ 
	$scope.currentAsset = SkyNxt.currentAsset;
	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="spiral"></ion-spinner>'
	});
	
	$http.get(SkyNxt.ADDRESS + '/nxt?requestType=getAsset&asset=' + $scope.currentAsset.asset)
    .success(function(response) {
		$ionicLoading.hide();
		$scope.currentAsset = response;
	})
	.error(function(response) {
	});
})
});