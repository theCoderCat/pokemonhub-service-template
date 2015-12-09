app.directive('iCheck', function($timeout, $parse) {
	return {
		link: function($scope, element, $attrs) {
			return $timeout(function() {
				var ngModelGetter, value;
				ngModelGetter = $parse($attrs['ngModel']);
				value = $parse($attrs['ngValue'])($scope);
				return $(element).iCheck({
					checkboxClass: 'icheckbox_minimal',
					radioClass: 'iradio_minimal-blue',
					checkboxClass: 'icheckbox_minimal-blue',
					increaseArea: '20%'
				}).on('ifChanged', function(event) {
					if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
						$scope.$apply(function() {
							return ngModelGetter.assign($scope, event.target.checked);
						});
					}
					if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
						return $scope.$apply(function() {
							return ngModelGetter.assign($scope, value);
						});
					}
				});
			});
		}
	};
});
