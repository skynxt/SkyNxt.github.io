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
SkyNxt.balanceAmount = -1;
var send_amt_nxt = -1, nxt_recipient_address = "";

$("#sendNxtSelect").click( function() {
	SkyNxt.sendNxt();
	});
	
SkyNxt.scanBarCode = function()
{
	try {
	cordova.plugins.barcodeScanner.scan(
      function (result) {		
		  if(result.cancelled == false && result.format == "QR_CODE")
		  {			  
			  $("#recipient_address").val(String(result.text));			
		  }
      }, 
      function (error) {
      }
   );
   } catch (e) {
			
		}
}
	function getSendValues()
	{
		var recipient_address = $("#recipient_address").val();
		recipient_address = recipient_address.replace(/\s+/g, '');
		$("#recipient_address").text(recipient_address);
		var address = new NxtAddress();
		if (address.set(recipient_address))
			nxt_recipient_address = address.toString();
		else
			nxt_recipient_address = "";

		send_amt_nxt = parseFloat($("#send_amount").val());
	}
	
	SkyNxt.sendNxtBtnClick = function()
	{
		send_amt_nxt = -1;
		nxt_recipient_address = "";
		$("#send_fee_confirm").show();
		$("#send_nxt_submit").show();
		getSendValues();
		if(send_amt_nxt < SkyNxt.balanceAmount && nxt_recipient_address != "")
		{
			$("#recipient_confirm").text("Recipient: " + nxt_recipient_address);
			$("#amount_confirm").text("Amount: " + send_amt_nxt + " NXT");
			$("#send_fee_confirm").text("Fee:" + "1 NXT");
		}
		else
		{
			$("#recipient_confirm").text("Recipient: " + nxt_recipient_address);
			$("#amount_confirm").text("Amount: " + send_amt_nxt + " NXT");
			if(send_amt_nxt > SkyNxt.balanceAmount)
			{
				$("#amount_confirm").text("Insufficient balance");
			}
			if(nxt_recipient_address == "")
			{
				$("#recipient_confirm").text("Incorrect Recipient Nxt Address");
			}
			
			$("#send_fee_confirm").hide();
			$("#send_nxt_submit").hide();
		}
	}
	
	SkyNxt.confirmSendNxt = function()
	{
		var send_amount_NQT = NRS.convertToNQT(send_amt_nxt);
		var recipient_addr = String(nxt_recipient_address);
		SkyNxt.sendNxtAmt_BuildHex(send_amount_NQT, recipient_addr);
	}
	
	SkyNxt.sendNxt = function()
	{
	var url = SkyNxt.ADDRESS +'/nxt?requestType=getBalance&account=' + SkyNxt.globalAddress;
	loaderIcon('show');
	var globalBalance = {};
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
			
			$(parsedjson).each(function(i,balance){
				var balanceData = {
				"unconfirmedBalanceNQT": String(balance.unconfirmedBalanceNQT),
				"guaranteedBalanceNQT": String(balance.guaranteedBalanceNQT),
				"effectiveBalanceNXT": String(balance.effectiveBalanceNXT),
				"forgedBalanceNQT": String(balance.forgedBalanceNQT),
				"balanceNQT": String(balance.balanceNQT)
				};
				globalBalance = balanceData;
			});
			loaderIcon('hide');
			
			if(globalBalance.unconfirmedBalanceNQT != "undefined")
			{
				SkyNxt.balanceAmount = NRS.convertToNXT(globalBalance.unconfirmedBalanceNQT);
				$("#available_Balance").text(SkyNxt.balanceAmount + " NXT");
			}
			else
			{
				$("#available_Balance").text("0 NXT");
			}
		}).fail(function(xhr, textStatus, error) {
			loaderIcon('hide');
		});
	}
	
	return SkyNxt;
 }(SkyNxt || {}, jQuery));	