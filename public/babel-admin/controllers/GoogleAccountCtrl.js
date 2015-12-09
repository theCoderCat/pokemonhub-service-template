app.controller('GoogleAccountCtrl', ($scope, overviewInfo, initAccountsList, GoogleAccountResource, $uibModal, $sce) => {
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
		range: $scope.limit,
	};


	$scope.showEmailDetail = (id) => {
		console.log('show email: ' + id);
	};

	$scope.getPage = (page) => {
		console.log('get page: ' + page);
		$scope.currentPage = page;
		$scope.filter.pos = (page - 1) * $scope.limit;
		applyFilter();
		getAccountList();
	};

	$scope.filterAccount = () => {
		$scope.currentPage = 1;
		$scope.filter.pos = 0;
		applyFilter();
		getAccountList();
	};

	var applyFilter = () => {
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

	var getAccountList = () => {
		var GoogleAccounts = GoogleAccountResource.query($scope.filter, () => {
			$scope.accountsList = GoogleAccounts.data;
			$scope.totalAccount = GoogleAccounts.total;
			$scope.totalPages = Math.ceil($scope.totalAccount / $scope.limit);
		});
	};

	var convertCapacityUnit = (str) => {
		let gBRe = /GB$/gi;
		let mBRe = /MB$/gi;
		if (str.match(gBRe)) {
			return str.replace(gBRe, '') * 1024 * 1024 * 1024;
		}
		else if (str.match(mBRe)) {
			return str.replace(mBRe, '') * 1024 * 1024;
		}
		else {
			return 0;
		}
	};

	$scope.suspend = (index) => {
		// console.log(index); return;
		var account = $scope.accountsList[index];
		var suspendGoogleAccount = GoogleAccountResource.suspend(account, () => {
			if (suspendGoogleAccount.status === 'success') {
				swal("Success", suspendGoogleAccount.data , suspendGoogleAccount.status);
			} else {
				swal('Error', suspendGoogleAccount.data , 'error');
			}
		});
	};

	$scope.delete = (index) => {
		// console.log(index); return;
		var account = $scope.accountsList[index];
		var deleteGoogleAccount = GoogleAccountResource.delete(account, () => {
			if (deleteGoogleAccount.status === 'success') {
				delete $scope.accountsList[index];
				swal('Success', deleteGoogleAccount.data , 'success');
			} else {
				swal('Error', deleteGoogleAccount.data , 'error');
			}
		});
	};

	$scope.showAccount = (index) => {
		$scope.selectedAccount = $scope.accountsList[index];

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: serviceLocation.googleaccount + '/getView/accountmodal',
			size: 'lg',
			controller: 'accountModalInstanceCtrl',
			resolve: {
				account: function () {
					return $scope.selectedAccount;
				}
			}
		});
	};

	$scope.openImportAccountModal = () => {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: serviceLocation.googleaccount + '/getView/importAccountModal',
			size: 'lg',
			controller: 'importAccountModalInstanceCtrl',
		});
	};


	$scope.statusIcon = (status) => {
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

	$scope.lockIcon = (lock) => {
		if (lock) {
			return $sce.trustAsHtml('<i class="icon-lock c-red f-20"></i>');
		} else {
			return $sce.trustAsHtml('<i class="icon-lock-open c-green f-20"></i>');
		}
	};

	$scope.converToGB = (bytes) => {
		return bytes/1024/1024/1024;
	};
});

app.controller('accountModalInstanceCtrl', ($scope, $uibModalInstance, GoogleAccountResource, account) => {
	// make a copy of account;
	var origin = angular.copy(account);
	$scope.account = account;
	if (typeof account.tokens === 'string'){
		account.tokens = JSON.parse(account.tokens);
	}
	$scope.save = () => {
		// account.tokens = JSON.stringify(account.tokens);
		var updateResult = GoogleAccountResource.save(account, () => {
			if (updateResult.status === 'success') {
				$uibModalInstance.close();
				swal("Success", updateResult.data, "success");
			}
		});
	};

	$scope.discard = () => {
		// reset account back to origin value
		angular.copy(origin, $scope.account);
		$uibModalInstance.dismiss('discard');
	};
});

app.controller('importAccountModalInstanceCtrl', ($http, $scope, $uibModalInstance, GoogleAccountResource) => {
	var file = $scope.file,
	state,
	url = '/googleaccountrender/importAccounts';
	$scope.options = {
		url: url
	};

	$scope.loadingFiles = false;
	$scope.queue = [];

	$scope.removeFile = (file) => {
		if (file.url) {
			file.$state = function () {
				return state;
			};
			file.$destroy = function () {
				state = 'pending';
				return $http({
					url: file.deleteUrl,
					method: file.deleteType
				}).then(
					function () {
						state = 'resolved';
						$scope.clear(file);
					},
					function () {
						state = 'rejected';
					}
				);
			};
		} else if (!file.$cancel && !file._index) {
			file.$cancel = function () {
				$scope.clear(file);
			};
		}
	};

	$scope.$on('fileuploaddone', (event, files) => {
		var status = files.result.status;
		var data = files.result.data;
		swal("Import Finish", 'Applied: ' + data.applied + '\nFail: ' + data.fail, status);
		console.log(files.result);
	});

	$scope.dismiss = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
