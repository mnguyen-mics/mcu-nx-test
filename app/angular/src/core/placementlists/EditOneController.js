define(['./module'], function (module) {

  'use strict';

  module.controller('core/placementlists/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService",
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService) {
      var placementListId = $stateParams.placementlist_id;
      var type = $stateParams.type;

      

      $scope.isCreationMode = !placementListId;

      if ($scope.isCreationMode) {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/library/placementlist/create');
      } else {
        $location.path(Session.getV2WorkspacePrefixUrl() + `/library/placementlist/${placementListId}/edit`);
      }

    
    }
  ]);
});

