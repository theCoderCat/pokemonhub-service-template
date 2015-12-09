app.controller('LoginCtrl', ($scope, $http, $location, $rootScope) => {
	
	$scope.userInfo = {};

	$scope.submitLogin = function() {
		console.log('Logging in');
		// the old way
		$http({
			method: 'POST',
			url: 'postLogin',
			data: $scope.userInfo,
			header: { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.then((res) => {
			// result returned
			if (res.data.status === 'success') {
				$location.path('/');
				window.location.reload();
				swal({
					title: 'Logged in',
					text: res.data.data,
				});
			} else {
				swal({
					title: 'Login Failed',
					text: res.data.data,
					type: 'error'
				});
			}
		}, (res) => {
			// nextwork error
			swal({
				title: 'Login Failed',
				text: 'Oops! Some thing went wrong!',
				type: 'error'
			});
		});
	};


});
