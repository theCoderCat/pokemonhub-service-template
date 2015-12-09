// for admin only
serviceLocation.googleaccount = '/googleaccountrender';
app.config(($stateProvider, $urlRouterProvider) => {
  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('dashboard.admin', {
    url: '/admin',
    templateUrl: serviceLocation.dashboard + '/getView/admin'
  })
  .state('dashboard.googleaccount', {
    url: '/googleaccount',
    templateUrl: serviceLocation.googleaccount + '/getView/googleaccountmanager',
    resolve: {
      initAccountsList: (GoogleAccountResource) => {
        var offset = {
          pos: 0,
          range: 10
        };
        return GoogleAccountResource.query(offset).$promise;
      },

      overviewInfo: (GoogleAccountResource) => {
        return GoogleAccountResource.getOverview().$promise;
      }
    },
    controller: 'GoogleAccountCtrl',
  });
});
