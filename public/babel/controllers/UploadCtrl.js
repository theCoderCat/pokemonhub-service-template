app.controller('UploadCtrl', ($scope, $http) => {
	$(function () {
		$('#fileupload').fileupload({
			dataType: 'json',
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			done: function (e, data) {
				console.log(data);
			}
		});
	});
});
