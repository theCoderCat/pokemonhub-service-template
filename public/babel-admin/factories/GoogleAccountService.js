app.factory('GoogleAccountResource', ['$resource', ($resource) => {
	return $resource('/googleaccountrender/getList', {}, {
		query: {
			method: 'GET',
			isArray: false,
		},
		save: {
			method: 'POST',
			url: '/googleaccountrender/updateAccount'
		},
		getOverview: {
			method: 'GET',
			url: '/googleaccountrender/overview'
		},
		delete: {
			method: 'POST',
			url: '/googleaccountrender/deleteAccount'
		},
		suspend: {
			method: 'POST',
			url: '/googleaccountrender/suspendAccount'
		},
		importAccounts: {
			method: 'POST',
			url: '/googleaccountrender/importAccounts'
		},
	});
}]);
