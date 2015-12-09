'use strict';
var app = angular.module('uniplayer', [
	'ui.router',
	'ui.bootstrap',
	'ngResource',
	'ngAnimate',
	'ngCookies',
	'ngSanitize',
	'xeditable',
	'blueimp.fileupload'
]);

var serviceLocation = {
	dashboard: '/dashboardrender',
	login: '/loginrender',
	register: '/registerrender',
	player: '/playerrender'
};

app.config(($stateProvider, $urlRouterProvider) => {
	$urlRouterProvider.otherwise('/');

	$stateProvider
	.state('homepage', {
		url: '/',
		abstract: true,
		templateUrl: 'view/homepage'
	})
	.state('homepage.index', {
		url: '',
		templateUrl: 'view/homepage/index',
		controller: 'HomepageCtrl'
	})
	.state('homepage.localupload', {
		url: 'localupload',
		templateUrl: 'view/homepage/localupload',
		controller: 'UploadCtrl'
	})
	.state('login', {
		url: '/login',
		templateUrl: serviceLocation.login + '/getView/login',
		controller: 'LoginCtrl'
	})
	.state('register', {
		url: '/register',
		templateUrl: 'register',
		controller: 'RegistrationCtrl'
	})
	.state('dashboard', {
		url: '/dashboard',
		abstract: true,
		templateUrl: serviceLocation.dashboard + '/getView/',
		// controller: 'DashboardCtrl'
	})
	.state('dashboard.index', {
		url: '',
		templateUrl: serviceLocation.dashboard + '/getView/index',
		controller: 'DashboardCtrl'
	})
	.state('dashboard.profile', {
		url: '/profile',
		templateUrl: serviceLocation.dashboard + '/getView/profile',
	})
	.state('dashboard.settings', {
		url: '/settings',
		templateUrl: serviceLocation.dashboard + '/getView/profile',
	})
	.state('dashboard.managecontent', {
		url: '/manage-content',
		templateUrl: serviceLocation.dashboard + '/getView/profile',
	});
});
