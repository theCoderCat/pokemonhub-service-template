app.directive('routeLoadingIndicator', () => {
    return {
      restrict: 'E',
      link: function(scope, element) {
        // Store original display mode of element
        var displayType = $(element).css('display');
        function hideElement() {
          setTimeout(function() {
            $(element).fadeOut('250');
          }, 100);
        }

        function showElement() {
          $(element).css('display', displayType);
        }

        scope.$on('$stateChangeStart', showElement);
        scope.$on('$stateChangeSuccess', hideElement);
        scope.$on('$stateChangeError', hideElement);
        // Initially element is hidden
        hideElement();
      },
      template: '<!-- BEGIN PAGE SPINNER --><div ng-spinner-loader class="page-spinner-loader"><img src="/images/loaders/3.gif" alt="Loading" class="loader"></div><!-- END PAGE SPINNER -->'
    };
  });
