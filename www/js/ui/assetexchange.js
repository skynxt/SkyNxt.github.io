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
	var assetsdb;
	var addedAssetIdsdb = SkyNxt.database.addCollection('addedAssetIds');
	SkyNxt.currentAsset = {};
	var cancelOrderID = "";
	var cancelType = "";
	var currentAssetID = 0;
	var openbidordersdb;
	var openaskordersdb;
	var chartData;
	var chartOptions;
	var graphDataLabel = [];	
	
	$("#portfolioSelect").click( function() {
	var url = SkyNxt.ADDRESS +'/nxt?requestType=getAccountAssets&account=' + SkyNxt.globalAddress;
	loaderIcon('show');
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
			
			SkyNxt.database.removeCollection('assets');
			assetsdb = SkyNxt.database.addCollection('assets');			

			$(parsedjson).each(function(i,val){
				$.each(val,function(k,v){
				  if(k == "accountAssets")
				  {
					  $(v).each(function(j,asset){
						assetsdb.insert({asset : asset.asset, name : asset.name, quantityQNT: asset.quantityQNT, decimals : parseInt(asset.decimals, 10)});
						var asset = {
							"asset": String(asset.asset),
							"name": String(asset.name),
							"quantityQNT": String(asset.quantityQNT),
							"decimals": parseInt(asset.decimals, 10)
						};
					});
				  }
			});
			});
			loaderIcon('hide');
			SkyNxt.populatePortfolioList();
		}).fail(function(xhr, textStatus, error) {
		});
	 });
	 
	SkyNxt.populatePortfolioList = function()
	{
		$("#portfolioList").empty();
		for(i = addedAssetIdsdb.data.length; i >= 1; i--)
		{
			var asset = addedAssetIdsdb.get(i);
			var dbasset = assetsdb.findOne({'asset' : asset.asset});
			if(dbasset == null)
			{
				var listItem = "<div data-role='collapsible' data-collapsed='true'><h3>" + asset.name + "</h3><p>Asset ID: <a href='#' data-val='" + asset.asset + "'>" + asset.asset + "</a></p><p>Your Balance: 0</p></div>";
				$("#portfolioList").append(listItem);
			}
			else
			{
				addedAssetIdsdb.remove(asset);
			}
		}
		for(i = 1; i < assetsdb.data.length; i++)
		{
			var asset = assetsdb.get(i);
			var listItem = "<div data-role='collapsible' data-collapsed='true'><h3>" + asset.name + "</h3><p>Asset ID: <a href='#' data-val='" + asset.asset + "'>" + asset.asset + "</a></p><p>Your Balance: " + NRS.convertToQNTf(asset.quantityQNT, asset.decimals) +"</p></div>";
			$("#portfolioList").append(listItem);
		}
		$("#portfolioList").collapsibleset('refresh');
	}

	SkyNxt.transactions = function(){
	var url = SkyNxt.ADDRESS +'/nxt?requestType=getAccountTransactions&account=' + SkyNxt.globalAddress;
	loaderIcon('show');
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
			
			$("#transactionCollapsibleList").empty();
			var transactions = [];
			$(parsedjson).each(function(i,val){
				$.each(val,function(k,v){
				  if(k == "transactions")
				  {
					 $(v).each(function(j,transaction){
					  
						var trans = {
								"senderPublicKey": String(transaction.senderPublicKey),
								"signature": String(transaction.signature),
								"feeNQT": String(transaction.feeNQT),
								"transactionIndex": String(transaction.transactionIndex),
								"type": String(transaction.type),
								"confirmations": String(transaction.confirmations),
								"fullHash": String(transaction.fullHash),
								"version": String(transaction.version),
								"ecBlockId": String(transaction.ecBlockId),
								"signatureHash": String(transaction.signatureHash),
								"senderRS": String(transaction.senderRS),
								"subtype": String(transaction.subtype),
								"amountNQT": String(transaction.amountNQT),
								"sender": String(transaction.sender),
								"recipientRS": String(transaction.recipientRS),
								"recipient": String(transaction.recipient),
								"ecBlockHeight": String(transaction.ecBlockHeight),
								"block": String(transaction.block),
								"blockTimestamp": String(transaction.blockTimestamp),
								"deadline": String(transaction.deadline),
								"transaction": String(transaction.transaction),
								"timestamp": String(transaction.timestamp),
								"height": String(transaction.height)
						};
					  
						transactions.push(trans);
						var date = new Date(NRS.formatTimestamp(parseInt(trans.timestamp)));					

						var nxtAddress;
						var address = new NxtAddress();
						if (address.set(trans.sender))
							nxtAddress = address.toString();

						var addressRecipient = new NxtAddress();
						addressRecipient.set(trans.recipient);							

						var transType = SkyNxt.getType(trans.type, trans.subtype)
						
						if(transType == SkyNxt.PAYMENT)
						{
							if(nxtAddress == SkyNxt.globalAddress)
								transType = "Sent -" + NRS.convertToNXT(trans.amountNQT) + " NXT";
							else
								transType = "Received +" + NRS.convertToNXT(trans.amountNQT) + " NXT";
						}
						
						var listItem = "<div data-role='collapsible' data-collapsed='true'><h3>" + transType + "</h3><p>Amount: " + NRS.convertToNXT(trans.amountNQT) + " NXT</p><p>Date: " + NRS.formatTimestamp(parseInt(trans.timestamp)) + "</p><p>From: " + address.toString() + "</p><p>To:  " + addressRecipient.toString() + "</p><p>Confirmations: " + trans.confirmations + "</p><p>Fee: " + NRS.convertToNXT(trans.feeNQT) + " NXT</p></div>";
						
						$("#transactionCollapsibleList").append(listItem);

					});
				  }
			});
			loaderIcon('hide');
			$("#transactionCollapsibleList").collapsibleset('refresh');
			});			
		}).fail(function(xhr, textStatus, error) {
		});
	 }
	
	$("#transactionSelect").click( function() {
		SkyNxt.transactions();
	 });
	 
	$("#openOrdersSwitch").click(function(e)
	{
		cancelType = $("#openOrdersLabel").val();
		if( cancelType == "Sell")
		{
			SkyNxt.loadOpenOrders('ask')
		}
		else
		{
			SkyNxt.loadOpenOrders('bid')
		}
	});

	$("#portfolioList").on("click", "a", function(e, data) {
		$("#askOrdersTable > tbody").html("");
		$("#bidOrdersTable > tbody").html("");
		$( "#nxtAETab" ).tabs({ active: 0 });
		
		e.preventDefault();
		$.mobile.changePage('#panel', {
            transition: "fade"
        });
		$("#buy_asset_price").val("0.0");
		$("#buy_asset_quantity").val("0.0");
		$("#sell_asset_price").val("0.0");
		$("#sell_asset_quantity").val("0.0");
		
		SkyNxt.currentAsset = "";
		currentAssetID = String($(this).data("val"));
		
		 var asset = assetsdb.findOne({'asset' : currentAssetID});
		 
		 if(asset == null)
		 {
			 asset = addedAssetIdsdb.findOne({'asset' : currentAssetID});
		 }
		 $("#assetHeading").text(asset.name);
		 SkyNxt.currentAsset = asset;
		loadOrders('bid');
		loadOrders('ask');
		SkyNxt.loadOpenOrders('bid');
	});

	$("#askOrdersTable").on('click','tr',function(e){
		e.preventDefault();
		$("#buy_asset_price").val($(this).find('th').text());
		$("#buy_asset_quantity").val($(this).find('td').text());
	});

	$("#bidOrdersTable").on('click','tr',function(e){
		e.preventDefault();
		$("#sell_asset_price").val($(this).find('th').text());
		$("#sell_asset_quantity").val($(this).find('td').text());
	});
	
	function loadOrders(type){
		var orderType;
		var tableType;
		var orders = [];
		if(type == 'bid')	
		{
			orderType = 'getAskOrders';
			tableType = 'askOrdersTable';
		}
		else
		{
			orderType = 'getBidOrders';
			tableType = 'bidOrdersTable';
		}
		
		var url = SkyNxt.ADDRESS +'/nxt?requestType='+ orderType +'&asset=' + currentAssetID;
		loaderIcon('show');
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
			$("#" + tableType + " > tbody").html(""); //clear the table row contents			
			$(parsedjson).each(function(i,val){
				$.each(val,function(k,v){
				  if(k == "askOrders" || k == "bidOrders")
				  {
					  $(v).each(function(j,order){
					  orders.push(order);
					});
				  }
			});
			});
			
			orders.sort(function(a, b) {
				if (type == "ask") {
					//lowest price at the top
					return new BigInteger(a.priceNQT).compareTo(new BigInteger(b.priceNQT));
				} else {
					//highest price at the top
					return new BigInteger(b.priceNQT).compareTo(new BigInteger(a.priceNQT));
				}
			});
			
			for (i = orders.length-1; i >= 0; i--) {
				var tableItem = '<tr><th>' + NRS.calculateOrderPricePerWholeQNT(orders[i].priceNQT, SkyNxt.currentAsset.decimals) + '</th><td>' + NRS.convertToQNTf(orders[i].quantityQNT, SkyNxt.currentAsset.decimals) + '</td></tr>';
				$("#" + tableType).append(tableItem);
			}
			loaderIcon('hide');
			$("#" + tableType).table("refresh");
		}).fail(function(xhr, textStatus, error) {
		});
	}

	SkyNxt.loadOpenOrders = function(type){
		var orderType;
		var tableType;
		var orders = [];

		if(type == 'bid')
		{
			orderType = 'getAccountCurrentBidOrders';
			tableType = 'openbidOrdersTable';
			$("#openbidOrdersTable").empty();
			$("#openaskOrdersTable").empty();
			SkyNxt.database.removeCollection('openordersbid');
			openbidordersdb = SkyNxt.database.addCollection('openordersbid');
		}
		else
		{
			orderType = 'getAccountCurrentAskOrders';
			tableType = 'openaskOrdersTable';
			$("#openbidOrdersTable").empty();
			$("#openaskOrdersTable").empty();
			SkyNxt.database.removeCollection('openordersask');
			openaskordersdb = SkyNxt.database.addCollection('openordersask');
		}

		var url = SkyNxt.ADDRESS +'/nxt?requestType='+ orderType +'&account=' + SkyNxt.globalAddress + '&asset=' + currentAssetID;
		loaderIcon('show');
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
			var tableHeader = "<div class='ui-block-a'><strong>Price</strong></div><div class='ui-block-b'><strong>Quantity</strong></div><div class='ui-block-c'></div><div class='ui-block-a'>&nbsp</div><div class='ui-block-b'>&nbsp</div><div class='ui-block-c'>&nbsp</div>";
			$("#" + tableType).append(tableHeader);
			$(parsedjson).each(function(i,val){
				$.each(val,function(k,v){
				  if(k == "askOrders" || k == "bidOrders")
				  {
					  $.each(v,function(j,order){
						var price = NRS.calculateOrderPricePerWholeQNT(order.priceNQT, SkyNxt.currentAsset.decimals);
						var quantity = NRS.convertToQNTf(order.quantityQNT, SkyNxt.currentAsset.decimals);
						if(k == 'bidOrders')
							openbidordersdb.insert({data_price : price, data_quantity : quantity, data_orderdetail : order.order, data_val : order.order});
						else
							openaskordersdb.insert({data_price : price, data_quantity : quantity, data_orderdetail : order.order, data_val : order.order});
						var tableItem = "<div class='ui-block-a' data-val='" + order.order + "'><p>" + price + "</p></div><div class='ui-block-b' data-val='" + order.order + "'><p>" + quantity + "</p></div><div class='ui-block-c' id='" + order.order + "'  data-val='" + order.order + "'><a href='#popupOrderID' data-position-to='window' data-rel='popup' class='ui-btn ui-btn-inline ui-corner-all' data-transition='pop'>cancel</a></div>";
						$("#" + tableType).append(tableItem);
					});
				  }
			});
			});

			loaderIcon('hide');
		}).fail(function(xhr, textStatus, error) {
		});
	}

	$('#openbidOrdersTable, #openaskOrdersTable').on('click', "a",  function(e) {
		e.preventDefault();
		var attribs = e.target.parentElement.attributes;
		var id = "";
		for (i = 0; i < attribs.length; i++) {
			if(attribs[i].name == 'data-val')
			{
				id = attribs[i].nodeValue;
				break;
			}
		}
		var tblData;
		if ($("#openOrdersLabel").val().indexOf("Buy") >= 0)
		{
			tblData = openbidordersdb.findOne({'data_val' : id});
			$("#cancellation_heading").text("Buy Order Cancellation");
		}
		else
		{
			tblData = openaskordersdb.findOne({'data_val' : id});
			$("#cancellation_heading").text("Sell Order Cancellation");
		}
		
		$("#orderID_confirm_cancel").text("Order ID: " + tblData.data_orderdetail);
		$("#price_confirm_cancel").text("Price: " + tblData.data_price);
		$("#qty_confirm_cancel").text("Quantity: " + tblData.data_quantity);		
		$("#fee_cancel").text("Fee: 1 " + "NXT");
		$("#popupOrderID").popup("open");
	});

	function loadHistoryGraph()
	{
		loaderIcon('show');
		SkyNxt.database.removeCollection('graphdb');
		graphDataDB = SkyNxt.database.addCollection('graphdb');

		var url = SkyNxt.ADDRESS +'/nxt?requestType=getTrades&asset=' + currentAssetID;
		
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
			$(parsedjson).each(function(i,val){
				$.each(val,function(k,v){
				  if(k == "trades")
				  {
					  $(v).each(function(j,order){					  
					  graphDataDB.insert({ts : order.timestamp, price_data : parseFloat(NRS.calculateOrderPricePerWholeQNT(order.priceNQT, SkyNxt.currentAsset.decimals))});
					});
				  }
			});
			});

		loaderIcon('hide');	
		var sortedList = graphDataDB.chain().simplesort("ts").data();	
		graphDataLabel = [];
		var graphDataPrice = [];
		for(var i = 0; i < sortedList.length; i++)
		{
			graphDataLabel.push(parseInt(sortedList[i].ts));				
			graphDataPrice.push(parseFloat(sortedList[i].price_data));			
		}
		
		chartData = {
			labels: graphDataLabel,
			series: [graphDataPrice]
		};

		SkyNxt.drawGraph();
		}).fail(function(xhr, textStatus, error) {
		});
	}

	SkyNxt.historyClick = function(){
		loadHistoryGraph();
	 }
	
	SkyNxt.drawGraph = function(){
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

		var chartDrawn = new Chartist.Line("#chart",chartData, chartOptions);		
	}
	}
	
	$(window).resize(function() {
			SkyNxt.drawGraph();
	 });

	function isControlKey(charCode) {
		if (charCode >= 32)
			return false;
		if (charCode == 10)
			return false;
		if (charCode == 13)
			return false;

		return true;
	}
	
	function getSelectedText() {
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

	$("#buy_asset_quantity, #buy_asset_price, #sell_asset_quantity, #sell_asset_price").keydown(function(e) {
		var charCode = !e.charCode ? e.which : e.charCode;

		if (isControlKey(charCode) || e.ctrlKey || e.metaKey) {
			return;
		}

		var isQuantityField = /_quantity/i.test($(this).attr("id"));

		var maxFractionLength = (isQuantityField ? SkyNxt.currentAsset.decimals : 8 - SkyNxt.currentAsset.decimals);

		if (maxFractionLength) {
			//allow 1 single period character
			if (charCode == 110 || charCode == 190) {
				if ($(this).val().indexOf(".") != -1) {
					e.preventDefault();
					return false;
				} else {
					return;
				}
			}
		} else {
			//do not allow period
			if (charCode == 110 || charCode == 190 || charCode == 188) {
				e.preventDefault();
				return false;
			}
		}

		var input = $(this).val() + String.fromCharCode(charCode);

		var afterComma = input.match(/\.(\d*)$/);

		//only allow as many as there are decimals allowed..
		if (afterComma && afterComma[1].length > maxFractionLength) {
			var selectedText = getSelectedText();
			
			if (selectedText != $(this).val()) {
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
	 });

	$("#send_amount").keydown(function(e) {
		var charCode = !e.charCode ? e.which : e.charCode;

		if (isControlKey(charCode) || e.ctrlKey || e.metaKey) {
			return;
		}

		var maxFractionLength = 8;

		if (maxFractionLength) {
			//allow 1 single period character
			if (charCode == 110 || charCode == 190) {
				if ($(this).val().indexOf(".") != -1) {
					e.preventDefault();
					return false;
				} else {
					return;
				}
			}
		}

		var input = $(this).val() + String.fromCharCode(charCode);

		var afterComma = input.match(/\.(\d*)$/);

		//only allow as many as there are decimals allowed..
		if (afterComma && afterComma[1].length > maxFractionLength) {
			var selectedText = getSelectedText();
			
			if (selectedText != $(this).val()) {
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
	 });
	 
	SkyNxt.addAsset = function(){
		var assetID = String($("#assetID").val());
		assetID = assetID.replace(/\s+/g, '');
		$("#assetID").val("");
		var url = SkyNxt.ADDRESS +'/nxt?requestType=getAsset&asset=' + String(assetID);		
		loaderIcon('show');
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

			$(parsedjson).each(function(i,val){
				if(val.asset != null)
				{
					addedAssetIdsdb.insert({quantityQNT: val.quantityQNT, accountRS: val.accountRS, decimals: parseInt(val.decimals, 10), name: val.name, description: val.description, numberOfTrades: parseInt(val.numberOfTrades, 10), asset: val.asset, account: val.account});
				}
			});
			loaderIcon('hide');
			SkyNxt.populatePortfolioList();
		}).fail(function(xhr, textStatus, error) {
		});
		}
	
	SkyNxt.confirm = function(orderType){
		var NXT = " NXT";
		var price = String($("#" + orderType + "_asset_price").val());
		var qty = String($("#" + orderType + "_asset_quantity").val());
		var total = (price * qty) + 1;
		$("#assetID_confirm_" + orderType).text("Asset ID: " + currentAssetID);
		$("#price_confirm_" + orderType).text("Price: " + price + NXT);
		$("#qty_confirm_" + orderType).text("Quantity: " + qty + NXT);
		var quantityQNT = new BigInteger(NRS.convertToQNT(String($("#" + orderType + "_asset_quantity").val()), SkyNxt.currentAsset.decimals));		
		var priceNQT = new BigInteger(NRS.calculatePricePerWholeQNT(NRS.convertToNQT(String($("#" + orderType + "_asset_price").val())), SkyNxt.currentAsset.decimals));
		var totalNXT = NRS.convertToNXT(NRS.calculateOrderTotalNQT(quantityQNT, priceNQT, SkyNxt.currentAsset.decimals), false, true);
		
		$("#total_confirm_" + orderType).text("Total: " + totalNXT + NXT);
		$("#fee_confirm_" + orderType).text("Fee: 1" + NXT);
	}
	
	SkyNxt.submitOrder = function(orderType){
		var assetId = new BigInteger(String(currentAssetID));
		var orderType = orderType.toLowerCase();
		try {
			var quantityQNT = new BigInteger(NRS.convertToQNT(String($("#" + orderType + "_asset_quantity").val()), SkyNxt.currentAsset.decimals));
			var priceNQT = new BigInteger(NRS.convertToNQT(String($("#" + orderType + "_asset_price").val()), SkyNxt.currentAsset.decimals));			
			var order = new BigInteger("0");
			SkyNxt.placeAssetOrder_BuildHex(orderType, assetId.toString(), quantityQNT.toString(), priceNQT.toString(), order.toString());
		} catch (e) {
			
		}
	}
	
	SkyNxt.cancelOrder = function()
	{
		var cancel = "";
		if(cancelType == "Sell")
		{
			cancel = "sell_cancel";
		}
		else
		{
			cancel = "buy_cancel";
		}
		$("#popupOrderID").popup("close");
		placeAssetOrder_BuildHex(cancel, 0, 0, 0, cancelOrderID);
	}
	
	$("#detailed_asset_btn").on("click", function() {
		SkyNxt.showAssetDetailsFull();		
	});
	
	SkyNxt.showAssetDetailsFull = function()
	{
		var url = SkyNxt.ADDRESS +'/nxt?requestType=getAsset&asset=' + SkyNxt.currentAsset.asset;
		loaderIcon('show');
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
				$(parsedjson).each(function(i,asset){
					var asset = {
						"asset": String(asset.asset),
						"name": String(asset.name),
						"description": String(asset.description),
						"groupName": String(asset.groupName),
						"account": String(asset.account),
						"accountRS": String(asset.accountRS),
						"quantityQNT": String(asset.quantityQNT),
						"decimals": parseInt(asset.decimals, 10)
					};
					SkyNxt.currentAsset = asset;
				});
				loaderIcon('hide');
				$("#assetID_full").text("AssetID: " + SkyNxt.currentAsset.asset);
				$("#name_full").text("Name: " + SkyNxt.currentAsset.name);
				$("#description_full").text("Description: " + SkyNxt.currentAsset.description);
				$("#account_full").text("Account: " + SkyNxt.currentAsset.account);
				$("#accountRS_full").text("AccountRS: " + SkyNxt.currentAsset.accountRS);
				$("#quantityQNT_full").text("Quantity: " + NRS.convertToQNTf(SkyNxt.currentAsset.quantityQNT, SkyNxt.currentAsset.decimals));
				$("#decimals_full").text("Decimals: " + SkyNxt.currentAsset.decimals);		
				$("#assetDetailsFull").popup("open");				
			}).fail(function(xhr, textStatus, error) {
			});
	}
	 return SkyNxt;
 }(SkyNxt || {}, jQuery));