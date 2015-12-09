app.controller('HomepageCtrl', ($scope, $rootScope, VideoLinkService) => {
	$scope.videoLink = 'https://xmovies8.org/watch?v=Jurassic_World_2015#video=ngAtdxOsIHwQ8EBINkvUEjYuQb4Ng9f4WFTsb3ZxhLY';
	$scope.embedIframe = '';

	$scope.submitLink = () => {
		if ($scope.videoLink) {
			var VideoLink = VideoLinkService.getLinkEmbed({url: $scope.videoLink}, () => {
				$scope.embedIframe = VideoLink.data;
			});
		}
	};
});
