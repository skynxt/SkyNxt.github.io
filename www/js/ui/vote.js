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

var voteList = 'undefined';
globalPoll = "";
SkyNxt.index.config(function($stateProvider, $urlRouterProvider) {
})
.config(function($stateProvider, $urlRouterProvider) {
$stateProvider
.state('pollList', {
	url: "/pollList",
	templateUrl: "pollList.html",
	controller: 'pollListCtrl'
})
.state('tabs', {
	url: "/tab",
	abstract: true,
	templateUrl: "tabs.html",
	controller: "tabCtrl"
})
.state('tabs.castVote', {
	url: "/castVote",
	views: {
	'castVote-tab': {
	  templateUrl: "castVote.html",
	  controller: "voteDetailsCtrl"
	}
	}
})
.state('tabs.pollInfo', {
	url: "/pollInfo",
	views: {
	'pollInfo-tab': {
	  templateUrl: "pollInfo.html",
	  controller: 'pollInfoTabCtrl'
	}
	}
});
})
.controller('pollListCtrl', function($scope, $ionicLoading, $http, $state, $timeout, $rootScope) {
	$scope.pollStatus = true;
	$scope.pollStatusTxt = "Active polls";
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
	
	$scope.showVoting = function(group){
		globalPoll = group;
		$state.go('tabs.castVote');
	};

	$scope.populatePollList = function(polls)
	{
		$scope.groups = [];
		for(var i = 0; i < polls.length; i++)
		{
			$scope.groups.push(polls[i]);
		}
	};
	
	$scope.togglePoll = function()
	{
		$scope.pollStatus = !$scope.pollStatus;
		
		if($scope.pollStatus)
		{
			$scope.pollStatusTxt = "Active polls";
			var activePolls = voteList.find({ 'finished': false });
			$scope.populatePollList(activePolls);
		}
		else
		{
			$scope.pollStatusTxt = "Finished polls";
			var finishedPolls = voteList.find({ 'finished': true });
			$scope.populatePollList(finishedPolls);
		}
	}

	$ionicLoading.show({
		duration: 30000,
		noBackdrop: true,
		template: '<ion-spinner icon="android"></ion-spinner>'
	});
	
    
	$http.get(SkyNxt.ADDRESS + "/nxt?requestType=getPolls&includeFinished=true")	
    .success(function(response) {
		SkyNxt.database.removeCollection('votelist');
		voteList = SkyNxt.database.addCollection('votelist');
		$ionicLoading.hide();
		$scope.groups = [];
		for (var i=0; i < response.polls.length; i++) {
			var pollObj = response.polls[i];
			voteList.insert({minRangeValue:pollObj.minRangeValue,votingModel:pollObj.votingModel,description:pollObj.description,finished:pollObj.finished,poll:pollObj.poll,minNumberOfOptions:pollObj.minNumberOfOptions,minBalance:pollObj.minBalance,accountRS:pollObj.accountRS,name:pollObj.name,options:pollObj.options,finishHeight:pollObj.finishHeight,maxNumberOfOptions:pollObj.maxNumberOfOptions,minBalanceModel:pollObj.minBalanceModel,account:pollObj.account,maxRangeValue:pollObj.maxRangeValue,timestamp:pollObj.timestamp});

			if(pollObj.finished == false)
			{
				$scope.groups.push(pollObj);
			}
		}
	})
	.error(function(response) {
	});	

})
.controller('tabCtrl', function($rootScope, $scope, $ionicLoading, $http) {
$scope.POLL = "";
$scope.tabName = "";
$scope.tabIcon = "";
$scope.$on('$ionicView.enter', function(){  
	$scope.refresh();
});

$scope.refresh = function(){
var pollInfo = voteList.find({ 'poll': globalPoll.poll });
$scope.POLL = pollInfo[0];
if(!$scope.POLL.finished){
		$scope.tabName = "Cast Vote";
		$scope.tabIcon = "ion-speakerphone";
	}
	else{
		$scope.tabName = "Results";
		$scope.tabIcon = "ion-pie-graph";
	}

$scope.resultOptions = [];
$scope.rangeOptionsList = [];
$scope.voteCheckBoxList = [];
$scope.voteRadioBoxList = [];
if($scope.POLL.finished == false)
{
	if(parseInt($scope.POLL.maxRangeValue) > 1)
	{
		for(var i = 0; i < $scope.POLL.options.length; i++)
		{
			var item = { text: $scope.POLL.options[i], minRangeValue: $scope.POLL.minRangeValue, maxRangeValue: $scope.POLL.maxRangeValue};
			$scope.rangeOptionsList.push(item);
		}
	}
	else if(parseInt($scope.POLL.maxNumberOfOptions) == 1)
	{
		for(var i = 0; i < $scope.POLL.options.length; i++)
		{
			var item = { text: $scope.POLL.options[i]};
			$scope.voteRadioBoxList.push(item);
		}
	}
	else
	{
		for(var i = 0; i < $scope.POLL.options.length; i++)
		{
			var item = { text: $scope.POLL.options[i] };
			$scope.voteCheckBoxList.push(item);
		}
	}
 }
}
})
.controller('pollInfoTabCtrl', function($scope, $rootScope) {
})
.controller('voteDetailsCtrl', function($scope, $rootScope, $ionicLoading, $http, $ionicPopup) {
var pollInfo = voteList.find({ 'poll': globalPoll.poll });
$scope.selectedPoll = pollInfo[0];
$scope.select = {name : ''};
$scope.showResults = function(){
	return globalPoll.finished;
}
$scope.submitVote = function(){
	var pollInfo = voteList.find({ 'poll': globalPoll.poll });
	pollInfo = pollInfo[0];
	var votes = [];
	var selectedOptions = "";
	var votedOptions = 0;
	if(parseInt(pollInfo.maxRangeValue) > 1)
	{
		for(var i = 0; i < $scope.rangeOptionsList.length; i++)	{
			if($scope.rangeOptionsList[i].value)
			{
				selectedOptions = selectedOptions + "<br>" + $scope.rangeOptionsList[i].text + ": " + "<strong>"  + $scope.rangeOptionsList[i].value + "</strong>" ;
				votes.push($scope.rangeOptionsList[i].value);
				votedOptions++;
			}
			else
			{
				votes.push(-128);
			}
		}
	}
	else if(parseInt(pollInfo.maxNumberOfOptions) == 1)
	{
		if($scope.select.name != '')
		{
			for(var i = 0; i < $scope.voteRadioBoxList.length; i++)	{
				if($scope.voteRadioBoxList[i].text == $scope.select.name)
				{
					selectedOptions = selectedOptions + "<br>" + $scope.voteRadioBoxList[i].text + "<strong>" + ": Vote YES" + "</strong>" ;
					votes.push(1); //??????? is this value correct or just be value 1
					votedOptions++;
				}
				else
				{
					votes.push(-128);
				}
			}
		}
	}
	else
	{
		for(var i = 0; i < $scope.voteCheckBoxList.length; i++)	{
			if($scope.voteCheckBoxList[i].value == true)
			{
				selectedOptions = selectedOptions + "<br>" + $scope.voteCheckBoxList[i].text + "<strong>" + ": Vote YES" + "</strong>";
				votes.push(1); //????????
				votedOptions++;
			}
			else if($scope.voteCheckBoxList[i].value == false)
			{
				selectedOptions = selectedOptions + "<br>" + $scope.voteCheckBoxList[i].text + "<strong>" + ": Vote NO" + "</strong>" ;
				votes.push(0); //????????
				votedOptions++;
			}
			else
			{
				votes.push(-128);
			}
		}
	}
	if(votedOptions < globalPoll.minNumberOfOptions)
	{
		var alertPopup = $ionicPopup.alert({
			title: 'Minimum vote options',
			template: 'You have choosen ' + votedOptions + ' option(s), but you need to choose atleast ' + globalPoll.minNumberOfOptions + ' option(s) to vote'
		});
		alertPopup.then(function(res) {
		});
	}
	else if(votedOptions > globalPoll.maxNumberOfOptions)
	{
		var alertPopup = $ionicPopup.alert({
			title: 'Maximum vote options',
			template: 'You have choosen ' + votedOptions + ' option(s), but you need to choose only ' + globalPoll.maxNumberOfOptions + ' option(s) to vote.' + "<br>" + "You can reset using the refresh button and vote again."
		});
		alertPopup.then(function(res) {
		});
	}
	else
	{
		var confirmPopup = $ionicPopup.confirm({
			title: 'Confirm Vote',
			template: 'Vote with following options?' + selectedOptions
		});	
		confirmPopup.then(function(res) {
			if(res) {
				SkyNxt.castVote_BuildHex(globalPoll.poll, votes);
			} 
		});
	}
};
$scope.$on('$ionicView.enter', function(){
if(globalPoll.finished){
	var pollInfo = voteList.find({ 'poll': globalPoll.poll });
	$scope.selectedPoll = pollInfo[0];

    $ionicLoading.show({
      duration: 30000,
      noBackdrop: true,
      template: '<ion-spinner icon="android"></ion-spinner>'
    });
	
	$http.get(SkyNxt.ADDRESS + "/nxt?requestType=getPollResult&poll=" + $scope.selectedPoll.poll)
    .success(function(pollResult) {	
		$ionicLoading.hide();
		var datapoints = [];
		var totalWeight = 0;
		var totalResult = 0;
		for(var i = 0; i < pollResult.options.length; i++)
		{
			var result = 0;
			var weight = 0;
			if(pollResult.results[i].result != "")
			{
				result = pollResult.results[i].result;
			}
			if(pollResult.results[i].weight != "")
			{
				weight = pollResult.results[i].weight;
			}
			datapoints.push(result);
			totalWeight = totalWeight + weight;
			totalResult	= totalResult + result;
		}
		var totalDatabpointSum = 0;
		if(totalWeight > 0)
		{
			SkyNxt.database.removeCollection('resultoptions');
			var results = SkyNxt.database.addCollection('resultoptions');
			for(var i = 0; i < datapoints.length; i++)
			{
				datapoints[i] = datapoints[i] / totalWeight;
				totalDatabpointSum = totalDatabpointSum + datapoints[i];
			}
			for(var i = 0; i < datapoints.length; i++)
			{
				results.insert({option:pollResult.options[i], percentage:Math.round((datapoints[i]/totalDatabpointSum)*100)});
			}
			$scope.resultOptions = results.chain().simplesort("percentage").data();
		}
		var data = {
		  series: datapoints
		};

		var sum = function(a, b) { return a + b };

		new Chartist.Pie('#pollResultPieChart', data, {
		  labelInterpolationFnc: function(value) {
			return Math.round(value / data.series.reduce(sum) * 100) + '%';
		  }
		});
	});
}
});
})