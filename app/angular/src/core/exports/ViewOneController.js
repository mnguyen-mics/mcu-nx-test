define(['./module'], function (module) {

  'use strict';

  module.controller('core/exports/ViewOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", 'core/datamart/queries/QueryContainer',
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, QueryContainer) {
      var exportId = $stateParams.exportId;
      var organisationId = $stateParams.organisation_id;

      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/datastudio/exports/'+exportId);
      
    }
  ]);
});

