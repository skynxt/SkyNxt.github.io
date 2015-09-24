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

function hidePage()
{
	$("div#account").hide();
	angular.element(document.getElementById('voteDiv')).scope().hideAccount();
}
	
angular.module('vote', ['ionic'])
.controller('voteCtrl', function($scope, $state) {
$scope.voteshow = true;
console.log($scope.voteshow)
 $scope.hideAccount = function() {
	  $scope.voteshow = false;
	  angular.element('#voteDiv').scope().$apply();
	  $state.go('pollList')
   }
   $scope.showAccount = function()
   {
		$scope.voteshow = true;
		angular.element("div#account").show();
   }
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
.state('tabs.pollInfo', {
	url: "/pollInfo",
	views: {
	'pollInfo-tab': {
	  templateUrl: "pollInfo.html",
	  controller: 'pollInfoTabCtrl'
	}
	}
})
.state('tabs.castVote', {
	url: "/castVote",
	views: {
	'castVote-tab': {
	  templateUrl: "castVote.html",
	  controller: "voteDetailsCtrl"
	}
	}
});
//$urlRouterProvider.otherwise("pollList");
})
.controller('pollListCtrl', function($scope, $ionicLoading, $http, $state, $timeout, $rootScope) {
	$scope.pollStatus = true;
	$scope.pollStatusTxt = "Showing active polls";
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
		$state.go('tabs.pollInfo');
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
			$scope.pollStatusTxt = "Showing active polls";
			var activePolls = voteList.find({ 'finished': false });
			$scope.populatePollList(activePolls);
		}
		else
		{
			$scope.pollStatusTxt = "Showing finished polls";
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
	});
})
.controller('tabCtrl', function($rootScope, $scope, $ionicLoading, $http) {
$scope.$on('$ionicView.enter', function(){  
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
console.log($scope.POLL.finished)
if($scope.POLL.finished == false)
{
	$scope.tabTitle = "Cast Vote";
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
 else
 {
	$scope.tabTitle = "Results";
 }
});
})
.controller('pollInfoTabCtrl', function($scope, $rootScope) {
})
.controller('voteDetailsCtrl', function($scope, $rootScope, $ionicLoading, $http, $ionicPopup) {
$scope.select = {name : ''};
$scope.showResults = function(){
	return globalPoll.finished;
}
$scope.submitVote = function(){
	var pollInfo = voteList.find({ 'poll': globalPoll.poll });
	pollInfo = pollInfo[0];
	var votes = [];
	var selectedOptions = "";
	var minOptions = 0;
	if(parseInt(pollInfo.maxRangeValue) > 1)
	{
		for(var i = 0; i < $scope.rangeOptionsList.length; i++)	{
			if($scope.rangeOptionsList[i].value)
			{
				selectedOptions = selectedOptions + "<br>" + $scope.rangeOptionsList[i].text + ": " + $scope.rangeOptionsList[i].value;
				votes.push($scope.rangeOptionsList[i].value);
				minOptions++;
			}
			else
			{
				selectedOptions = selectedOptions + "<br>" + $scope.rangeOptionsList[i].text + ": No vote";
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
					selectedOptions = selectedOptions + "<br>" + $scope.voteRadioBoxList[i].text + ": Vote YES";
					votes.push(1); //??????? is this value correct or just be value 1
					minOptions++;
				}
				else
				{
					selectedOptions = selectedOptions + "<br>" + $scope.voteRadioBoxList[i].text + ": No vote";
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
				selectedOptions = selectedOptions + "<br>" + $scope.voteCheckBoxList[i].text + ": Vote YES";
				votes.push(1); //????????
				minOptions++;
			}
			else if($scope.voteCheckBoxList[i].value == false)
			{
				selectedOptions = selectedOptions + "<br>" + $scope.voteCheckBoxList[i].text + ": Vote NO";
				votes.push(0); //????????
				minOptions++;
			}
			else
			{
				selectedOptions = selectedOptions + "<br>" + $scope.voteCheckBoxList[i].text + ": No vote";
				votes.push(-128);
			}
		}
	}
	if(minOptions < globalPoll.minNumberOfOptions)
	{
		var alertPopup = $ionicPopup.alert({
			title: 'Minimum vote options',
			template: 'You have choosen ' + minOptions + ' option(s), but you need to choose atleast ' + globalPoll.minNumberOfOptions + ' option(s) to vote'
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
				console.log('You are sure');
			} 
		});
	}
	console.log(votes)
};
$scope.$on('$ionicView.enter', function(){
if(globalPoll.finished){
	var pollInfo = voteList.find({ 'poll': globalPoll.poll });
	$scope.POLL = pollInfo[0];

    $ionicLoading.show({
      duration: 30000,
      noBackdrop: true,
      template: '<ion-spinner icon="android"></ion-spinner>'
    });
	
	$http.get(SkyNxt.ADDRESS + "/nxt?requestType=getPollResult&poll=" + $scope.POLL.poll)
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
.filter('formatTimestamp', function formatTimestamp($filter){
  return function(text){
    return NRS.formatTimestamp(parseInt(text));
  }
});
