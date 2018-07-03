define(['./module'], function (module) {

  'use strict';

  module.controller('core/bidOptimizer/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", "core/common/ErrorService", "core/bidOptimizer/PropertyContainer", "$q",
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, errorService, PropertyContainer, $q) {

      var bidOptimizerId = $stateParams.id;
      var type = $stateParams.type;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/campaigns/bid_optimizer/${bidOptimizerId}/edit`);
      
    }
  ]);
});

