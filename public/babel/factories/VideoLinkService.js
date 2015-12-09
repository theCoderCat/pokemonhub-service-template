app.factory('VideoLinkService', ['$resource', ($resource) => {
	return $resource('', {}, {
		getLinkEmbed: {
			method: 'POST',
			url: '/webrender/openlink'
		},
	});
}]);
