define(['./module'], function (module) {
  'use strict';

  module.controller('core/bidOptimizer/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal', '$state', '$stateParams', "core/bidOptimizer/PropertyContainer", "$q",
    function ($scope, Restangular, Session, $location, $uibModal, $state, $stateParams, PropertyContainer, $q) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/campaigns/bid_optimizer');
      
    }
  ]);
});


