app.controller('RegistrationCtrl', ($scope, $resource, $http, $location, $rootScope) => {
	
	$scope.formData = {};

	var redirectToLogin = function() {
		$location.path('/login');
	};

	$scope.submitRegistration = function () {
		console.log('submitting');
		$http({
			method: 'POST',
			url: 'postRegister',
			data: $scope.formData,
			header: { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(data => {
			if (data.status === 'success') {
				$location.path('/login');
				swal({
					title: 'Success',
					text: data.data,
				});
			} else {
				swal({
					title: 'Error',
					type: 'error',
					text: data.data,
					confirmButtonText: 'OK',
					closeOnConfirm: true
				});
			}
		});
	};
});
