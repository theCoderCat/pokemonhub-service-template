app.factory('Login', ($resource) => {
	return $resource('postLogin/', {}, {
		'postLogin': {method: 'POST'}
	});
});
