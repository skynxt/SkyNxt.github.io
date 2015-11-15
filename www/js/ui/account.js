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
    .state('account', {
      url: '/account',
      templateUrl: 'templates/account.html',
      controller: 'AccountCtrl'
    });
})
.controller('AccountCtrl', function($scope, $state) {
	$scope.globalAddress = SkyNxt.globalAddress;
	  $scope.items = [
    { id: "sendNxt", option: '		Send', detail: 'Send amount to Nxt Address', icon: 'ion-card' },
	{ id: "portfolio", option: '		Trade', detail: 'View porfolio. Buy\\Sell in Nxt Asset Exchange', icon: 'ion-arrow-graph-up-right' },
	{ id: "pollList", option: '		Vote', detail: 'View poll list and Vote', icon: 'ion-speakerphone' },
	{ id: "messages", option: '		Message', detail: 'Read, Compose, Send messages', icon: 'ion-chatboxes' },
	{ id: "transactions", option: '		Transactions', detail: 'View transactions of your account' , icon: 'ion-arrow-swap'}
  ];
})