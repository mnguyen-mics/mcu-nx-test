define(['./module'], function (module) {

  'use strict';

  module.controller('core/bidOptimizer/CreateController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$uibModalInstance',
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, $uibModalInstance) {
      $scope.availableBidOptimizers = Restangular.all("bid_optimizers").getList({
        organisation_id: Session.getCurrentWorkspace().organisation_id
      }).$object;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/campaigns/bid_optimizer/create`);
      
    }
  ]);
});
