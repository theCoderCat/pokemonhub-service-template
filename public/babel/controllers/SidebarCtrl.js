app.controller('SidebarCtrl', ($scope, $state) => {
	$scope.active = '';
	$scope.isActive = function (stateName) {
		return $state.is(stateName);
	};
});
