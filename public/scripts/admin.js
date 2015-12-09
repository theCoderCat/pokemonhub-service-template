// for admin only
'use strict';

serviceLocation.googleaccount = '/googleaccountrender';
app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('dashboard.admin', {
    url: '/admin',
    templateUrl: serviceLocation.dashboard + '/getView/admin'
  }).state('dashboard.googleaccount', {
    url: '/googleaccount',
    templateUrl: serviceLocation.googleaccount + '/getView/googleaccountmanager',
    resolve: {
      initAccountsList: function initAccountsList(GoogleAccountResource) {
        var offset = {
          pos: 0,
          range: 10
        };
        return GoogleAccountResource.query(offset).$promise;
      },

      overviewInfo: function overviewInfo(GoogleAccountResource) {
        return GoogleAccountResource.getOverview().$promise;
      }
    },
    controller: 'GoogleAccountCtrl'
  });
});
'use strict';

app.factory('GoogleAccountResource', ['$resource', function ($resource) {
	return $resource('/googleaccountrender/getList', {}, {
		query: {
			method: 'GET',
			isArray: false
		},
		save: {
			method: 'POST',
			url: '/googleaccountrender/updateAccount'
		},
		getOverview: {
			method: 'GET',
			url: '/googleaccountrender/overview'
		},
		'delete': {
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
		}
	});
}]);
'use strict';

app.controller('GoogleAccountCtrl', function ($scope, overviewInfo, initAccountsList, GoogleAccountResource, $uibModal, $sce) {
	$scope.overviewInfo = overviewInfo;
	$scope.fetchStatus = initAccountsList.status;
	$scope.accountsList = initAccountsList.data;
	$scope.totalAccount = initAccountsList.total;
	$scope.limit = 10;
	$scope.currentPage = 1;
	$scope.totalPages = Math.ceil($scope.totalAccount / $scope.limit);
	$scope.selectedAccount = {};

	// init params
	$scope.filter = {
		range: $scope.limit
	};

	$scope.showEmailDetail = function (id) {
		console.log('show email: ' + id);
	};

	$scope.getPage = function (page) {
		console.log('get page: ' + page);
		$scope.currentPage = page;
		$scope.filter.pos = (page - 1) * $scope.limit;
		applyFilter();
		getAccountList();
	};

	$scope.filterAccount = function () {
		$scope.currentPage = 1;
		$scope.filter.pos = 0;
		applyFilter();
		getAccountList();
	};

	var applyFilter = function applyFilter() {
		if ($scope.freeLessThan) {
			$scope.filter.lt = convertCapacityUnit($scope.freeLessThan);
		} else {
			$scope.filter.lt = 0;
		}
		if ($scope.freeMoreThan) {
			$scope.filter.gt = convertCapacityUnit($scope.freeMoreThan);
		} else {
			$scope.filter.gt = 0;
		}

		for (var param in $scope.filter) {
			if (param !== 'pos' && !$scope.filter[param]) {
				delete $scope.filter[param];
			}
		}
	};

	var getAccountList = function getAccountList() {
		var GoogleAccounts = GoogleAccountResource.query($scope.filter, function () {
			$scope.accountsList = GoogleAccounts.data;
			$scope.totalAccount = GoogleAccounts.total;
			$scope.totalPages = Math.ceil($scope.totalAccount / $scope.limit);
		});
	};

	var convertCapacityUnit = function convertCapacityUnit(str) {
		var gBRe = /GB$/gi;
		var mBRe = /MB$/gi;
		if (str.match(gBRe)) {
			return str.replace(gBRe, '') * 1024 * 1024 * 1024;
		} else if (str.match(mBRe)) {
			return str.replace(mBRe, '') * 1024 * 1024;
		} else {
			return 0;
		}
	};

	$scope.suspend = function (index) {
		// console.log(index); return;
		var account = $scope.accountsList[index];
		var suspendGoogleAccount = GoogleAccountResource.suspend(account, function () {
			if (suspendGoogleAccount.status === 'success') {
				swal("Success", suspendGoogleAccount.data, suspendGoogleAccount.status);
			} else {
				swal('Error', suspendGoogleAccount.data, 'error');
			}
		});
	};

	$scope['delete'] = function (index) {
		// console.log(index); return;
		var account = $scope.accountsList[index];
		var deleteGoogleAccount = GoogleAccountResource['delete'](account, function () {
			if (deleteGoogleAccount.status === 'success') {
				delete $scope.accountsList[index];
				swal('Success', deleteGoogleAccount.data, 'success');
			} else {
				swal('Error', deleteGoogleAccount.data, 'error');
			}
		});
	};

	$scope.showAccount = function (index) {
		$scope.selectedAccount = $scope.accountsList[index];

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: serviceLocation.googleaccount + '/getView/accountmodal',
			size: 'lg',
			controller: 'accountModalInstanceCtrl',
			resolve: {
				account: function account() {
					return $scope.selectedAccount;
				}
			}
		});
	};

	$scope.openImportAccountModal = function () {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: serviceLocation.googleaccount + '/getView/importAccountModal',
			size: 'lg',
			controller: 'importAccountModalInstanceCtrl'
		});
	};

	$scope.statusIcon = function (status) {
		switch (status) {
			case 'new':
				return $sce.trustAsHtml('<i class="glyphicon glyphicon-asterisk c-yellow f-20"></i>');
				break;
			case 'authenticated':
				return $sce.trustAsHtml('<i class="icon-check c-green f-20"></i>');
				break;
			case 'error':
				return $sce.trustAsHtml('<i class="icon-info c-red f-20"></i>');
				break;
			default:
				return $sce.trustAsHtml('<i class="icon-question c-red f-20"></i>');
		}
	};

	$scope.lockIcon = function (lock) {
		if (lock) {
			return $sce.trustAsHtml('<i class="icon-lock c-red f-20"></i>');
		} else {
			return $sce.trustAsHtml('<i class="icon-lock-open c-green f-20"></i>');
		}
	};

	$scope.converToGB = function (bytes) {
		return bytes / 1024 / 1024 / 1024;
	};
});

app.controller('accountModalInstanceCtrl', function ($scope, $uibModalInstance, GoogleAccountResource, account) {
	// make a copy of account;
	var origin = angular.copy(account);
	$scope.account = account;
	if (typeof account.tokens === 'string') {
		account.tokens = JSON.parse(account.tokens);
	}
	$scope.save = function () {
		// account.tokens = JSON.stringify(account.tokens);
		var updateResult = GoogleAccountResource.save(account, function () {
			if (updateResult.status === 'success') {
				$uibModalInstance.close();
				swal("Success", updateResult.data, "success");
			}
		});
	};

	$scope.discard = function () {
		// reset account back to origin value
		angular.copy(origin, $scope.account);
		$uibModalInstance.dismiss('discard');
	};
});

app.controller('importAccountModalInstanceCtrl', function ($http, $scope, $uibModalInstance, GoogleAccountResource) {
	var file = $scope.file,
	    state,
	    url = '/googleaccountrender/importAccounts';
	$scope.options = {
		url: url
	};

	$scope.loadingFiles = false;
	$scope.queue = [];

	$scope.removeFile = function (file) {
		if (file.url) {
			file.$state = function () {
				return state;
			};
			file.$destroy = function () {
				state = 'pending';
				return $http({
					url: file.deleteUrl,
					method: file.deleteType
				}).then(function () {
					state = 'resolved';
					$scope.clear(file);
				}, function () {
					state = 'rejected';
				});
			};
		} else if (!file.$cancel && !file._index) {
			file.$cancel = function () {
				$scope.clear(file);
			};
		}
	};

	$scope.$on('fileuploaddone', function (event, files) {
		var status = files.result.status;
		var data = files.result.data;
		swal("Import Finish", 'Applied: ' + data.applied + '\nFail: ' + data.fail, status);
		console.log(files.result);
	});

	$scope.dismiss = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
//# sourceMappingURL=admin.js.map
