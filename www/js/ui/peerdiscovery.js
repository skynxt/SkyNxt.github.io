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
//var peers = ['167.114.113.194', '37.139.5.199', '104.193.41.253', '81.64.77.101', '92.222.22.16', 'nxt.cryonet.de', '37.59.115.207', '91.98.72.85', 'raspnxt.hopto.org', '54.214.250.209', '192.99.35.133', 'nxtx.ru', '192.99.102.1', 'nxt4.y.cz', '54.245.255.250', '82.221.101.23', '85.25.198.120', '89.212.19.49', 'nxt01.now.im', '89.72.57.246', '151.80.162.72:3001', 'girona2nxtgig.ddns.net', 'bug.airdns.org', '82.0.149.148', '167.114.113.250', '162.243.242.8', 'gunka.szn.dk', '37.120.168.131', '99.227.137.145', '84.242.91.139', 'dilnu.szn.dk', '192.187.97.131:12211', '69.163.40.132', 'single-chat.at', 'beor.homeip.net', '178.62.175.175', 'raspi2nxtnode.ddns.net', '45.43.221.5:21518', '167.114.113.249', '167.114.113.246', '108.61.57.76', '119.9.24.152', '80.153.101.190', '109.192.13.13', 'nxt.sx', '91.202.253.240', '212.227.135.232', '46.28.111.249', '80.150.243.95', '80.150.243.96', '80.150.243.97', '80.150.243.98', 'pakisnxt.no-ip.org', '80.150.243.99', '85.25.43.169', '80.150.243.12', '80.150.243.13', 'finnikola.ddns.net', 'node0.forgenxt.com', '104.236.82.139', 'gironanxtgig.ddns.net', '167.114.96.222', 'nxt.scryptmh.eu', '176.97.2.141', 'home.kaerner.net', 'silvanoip.dhcp.biz', '95.215.44.229', '178.15.99.67', '162.243.122.251', 'nxt.ydns.eu', '185.61.148.216', '5.9.123.49:4510', '198.199.95.15', '87.139.122.48', 'nxt1.y.cz', '5.9.8.9', '191.238.101.73', '113.106.85.172', '87.139.122.157', '23.95.37.134', 'miasik.no-ip.org', 'ct.flipflop.mooo.com', 'nxt.hopto.org', '198.105.122.160', '131.72.136.251', '77.58.253.73', '108.61.184.187', '45.63.58.212', '84.253.125.186', '95.85.31.45', '176.94.115.161', '167.114.113.25', '167.114.113.27', 'nxtcoin.no-ip.org', '91.239.69.78', '162.243.145.83', '167.114.113.201', '24.23.120.252', '77.88.208.12', 'cryptkeeper.vps.nxtcrypto.org', '178.33.203.157', '95.24.64.28', '176.31.167.127', 'sluni.szn.dk', '136.243.5.70', '190.10.9.166', '23.102.0.45', '178.18.83.36', 'megaman.thican.net', '88.163.78.131', '91.214.169.126', '185.61.148.119', '54.213.222.141', 'humanoide.thican.net', '167.114.71.191', '52.0.72.67', '104.130.7.74', '192.99.68.108', '173.224.126.254', '85.214.200.59', '119.81.29.172', 'nxt2.nxtty.com', '5.9.56.103', '62.75.143.120', '104.219.184.157', '85.10.201.15', '185.69.54.151', '5.9.105.170', 'nxt.cryptopool.tk', '185.69.54.125', '89.248.160.239', '185.69.54.126', '185.69.54.127', '144.76.3.50', '104.131.254.22', '5.9.155.145', 'lan.wow64.net', '62.195.89.177', '213.46.57.77', '37.59.115.204', '134.119.24.206', '89.248.160.238', '89.248.160.237', '185.69.54.139', '217.23.6.2', '78.46.93.174', 'nxt.alkeron.com', '94.113.207.67', '185.69.55.177', '178.63.60.131', '89.248.160.241', '89.248.160.240', '94.102.50.68', '89.248.160.242', '89.248.160.245', '85.214.199.215', '89.248.160.244', '109.87.255.75', 'jnxt.org', '185.69.54.135', 'nxt.secureae.com', '216.119.150.238', '66.30.204.105', '106.187.102.227', '192.3.158.120', '217.26.24.27', '37.59.14.7', 'palolnxtgig.ddns.net', '107.170.164.129', '109.236.85.42', '185.69.54.142', 'nxt.smartcontract.com'];
var peers = ['104.193.41.253', 'nxt01.now.im', '69.163.40.132', 'nxt.sx', '162.243.122.251', 'humanoide.thican.net', 'jnxt.org' ];

var peerTraverse = 0;
var HTTP = "http://";
var HTTPS = "https://";
SkyNxt.PORT = "7876";
var ITR2_PEER_TRAVERSE = 150; //for mobile devices do not try to reach more than this number of peers in second iteration of peer discovery
var SLEEP_TIME = 5000; //5000 = 5 seconds
var peersfrmDB = [];
var apipeersfrmDB = [];
SkyNxt.database = new loki('SkyNxt.json');
var peersdbs;
var apipeersdb;
var api_disabled_peersdb;
var peerbalancedb;
SkyNxt.trustedpeersdb;
SkyNxt.PEER_IP = [];

SkyNxt.discover = function()
{
	loaderIconText('Peer discovery started..');
	SkyNxt.database.removeCollection('peers');
	peersdbs = SkyNxt.database.addCollection('peers');

	SkyNxt.database.removeCollection('apipeers');
	apipeersdb = SkyNxt.database.addCollection('apipeers');
	
	SkyNxt.database.removeCollection('apidisabledpeers');
	api_disabled_peersdb = SkyNxt.database.addCollection('apidisabledpeers');
	
	SkyNxt.database.removeCollection('peerbalance');
	peerbalancedb = SkyNxt.database.addCollection('peerbalance');
	
	SkyNxt.database.removeCollection('trustedpeers');
	SkyNxt.trustedpeersdb = SkyNxt.database.addCollection('trustedpeers');
	
	for(var i = 0; i < peers.length; i++)
	{
		discoverPeers(HTTP + peers[i]);
	}

	setTimeout(executeItr_1, SLEEP_TIME);
}

function executeItr_1()
{
	if(peerTraverse < peers.length-1)
	{
		loaderIconText('Searching peers: ' + peerTraverse + "/" + peers.length);
		setTimeout(executeItr_1, SLEEP_TIME)
		return;
	}
	peerTraverse = 0;
	for(i = 1; i <= peersdbs.data.length; i++)
	{
		data = peersdbs.get(i);
		var ip = HTTP + data.nwpeer;
		peersfrmDB.push(ip);
		discoverPeers(ip);
		
		if(i >= ITR2_PEER_TRAVERSE)
		{
			break;
		}
	}
	setTimeout(executeItr_2, SLEEP_TIME);
}

function executeItr_2()
{
	var total = peersfrmDB.length;
   if((peerTraverse + ((total*5)/100)) < (total - 1))
   {
		loaderIconText('Searching peers: ' + peerTraverse + "/" + peersfrmDB.length);
		setTimeout(executeItr_2, SLEEP_TIME)
		return;
   }
   peerTraverse = 0;
	for(i = 1; i <= apipeersdb.data.length; i++)
	{
		data = apipeersdb.get(i);
		var ip = data.peer;
		apipeersfrmDB.push(ip);
		trustedPeers(ip);
	}

	setTimeout(executeItr_3, SLEEP_TIME);
}

function executeItr_3()
{
	var total = apipeersfrmDB.length;
   if((peerTraverse + ((total*5)/100)) < (total - 1))
   {
		loaderIconText('Searching peers: ' + peerTraverse + "/" + apipeersfrmDB.length);
		setTimeout(executeItr_3, SLEEP_TIME)
		return;
   }
   populateTrustedPeers();
}

function discoverPeers(ip)
{
	var url = "";
	if(api_disabled_peersdb.findOne({'apidispeer': ip}) != null || apipeersdb.findOne({'peer': ip}) != null)
	{
		peerTraverse++;
		return;
	}

	 if(ip.indexOf(":") != -1)
		url = ip + ':' + SkyNxt.PORT +'/nxt?requestType=getPeers';
	else
		url = ip + '/nxt?requestType=getPeers';

	var apiPeers = [];
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
			var error = false;
			$(parsedjson).each(function(i,val){
				$.each(val,function(k,v){
				  if(k == "peers")
				  {
					  $(v).each(function(j,peer){
						var httppeer = HTTP + peer;
						if(peersdbs.findOne({'nwpeer': peer}) == null && apipeersdb.findOne({'peer': httppeer}) == null && api_disabled_peersdb.findOne({'apidispeer': httppeer}) == null)
						{
							peersdbs.insert({nwpeer: peer });
						}
					});
				  }
				  if(k == "errorDescription")
				  {
					  error = true;
				  }
			});
			});
			if(apipeersdb.findOne({'peer': ip}) == null && !error)
			{
				apipeersdb.insert({peer: ip});
			}
			peerTraverse++;
		}).fail(function(xhr, textStatus, error) {			
			if(api_disabled_peersdb.findOne({'apidispeer': ip}) == null)
			{
				api_disabled_peersdb.insert({apidispeer: ip});
			}
			peerTraverse++;
		});
}

function trustedPeers(ip)
{
	var url = '/nxt?requestType=getBalance&account=NXT-K5KL-23DJ-3XLK-22222';
	 if(ip.indexOf(":") != -1)
		url = ip + ':' + SkyNxt.PORT + url; //trustedPeers should be called only after paraphrase is entered
	else	
		url = ip + url; //trustedPeers should be called only after paraphrase is entered
	var trustedPeers = [];
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
			var balanceVal = 0;
			if(balance.guaranteedBalanceNQT == 'undefined' || balance.guaranteedBalanceNQT == undefined)
				balanceVal = 0;
			else
				balanceVal = balance.guaranteedBalanceNQT;
			
			peerbalancedb.insert({peer: ip, guaranteedBalanceNQT : balanceVal});
			peerTraverse++;
			});			
			}).fail(function(xhr, textStatus, error) {
			peerTraverse++;
		});
}

function populateTrustedPeers()
{	
	var balanceList = peerbalancedb.chain().simplesort("guaranteedBalanceNQT").data();
	counter = {}

	balanceList.forEach(function(obj) {
		var key = JSON.stringify(obj.guaranteedBalanceNQT)
		counter[key] = (counter[key] || 0) + 1
	})

	var guranteedBalance = 0;
	var guranteedBalanceCount = 0;
	var init = true;
	for (var m in counter){
		if(init)
		{
			guranteedBalance = m;
			guranteedBalanceCount = counter[m];
			init = false;
		}
		if(counter[m] > guranteedBalanceCount)
		{
			guranteedBalance = m;
			guranteedBalanceCount = counter[m];	
		}
	}
	
	var trustedPeerList = "";
	SkyNxt.PEER_IP = [];
	for(var i = 0; i < balanceList.length; i++)
	{
		if(JSON.stringify(balanceList[i].guaranteedBalanceNQT) == guranteedBalance)
		{			
			var peerIP = balanceList[i].peer;
			SkyNxt.trustedpeersdb.insert({ip_peer : peerIP});
			trustedPeerList = peerIP + "," + trustedPeerList;
			SkyNxt.PEER_IP.push(peerIP);
		}
	}
	
	var userdbs = SkyNxt.usersettings.getCollection(SkyNxt.USER_SETTING_COLLECTION);
	
	if(userdbs == null || userdbs == 'undefined')
	{
		userdbs = SkyNxt.usersettings.addCollection(SkyNxt.USER_SETTING_COLLECTION);		
		userdbs.insert({key:SkyNxt.TRUSTED_PEERS, value:trustedPeerList});
	}
	else
	{
		var trustedPeerdata = userdbs.findOne({'key' : SkyNxt.TRUSTED_PEERS});
		trustedPeerdata.value = trustedPeerList
		userdbs.update(trustedPeerdata);
	}
	
	try{
		SkyNxt.createWrite(SkyNxt.FILE_ENTRY);
   } catch (e) {
	}
	SkyNxt.getPeer();
	console.log(SkyNxt.ADDRESS)
	loaderIcon('hide');
}
	return SkyNxt;
 }(SkyNxt || {}, jQuery));