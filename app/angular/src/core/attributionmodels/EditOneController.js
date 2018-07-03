define(['./module'], function (module) {

  'use strict';

  module.controller('core/attributionmodels/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", "core/common/ErrorService", "core/attributionmodels/PropertyContainer", "$q",
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, errorService, PropertyContainer, $q) {

      var attributionModelId = $stateParams.id;
      var type = $stateParams.type;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/campaigns/attribution_models/${attributionModelId}/edit`);
     
    }
  ]);
});

