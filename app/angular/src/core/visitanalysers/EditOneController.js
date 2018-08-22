define(['./module'], function (module) {

  'use strict';

  module.controller('core/visitanalysers/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", "core/common/ErrorService", "core/bidOptimizer/PropertyContainer", "$q",
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, errorService, PropertyContainer, $q) {
      var activityAnalyserId = $stateParams.id;
      if (activityAnalyserId) {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/visit_analyzers/' + activityAnalyserId + '/edit');
      } else {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/visit_analyzers/create');
      }
    
    }
  ]);
});

