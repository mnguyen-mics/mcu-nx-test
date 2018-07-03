define(['./module'], function (module) {

  'use strict';

  module.controller('core/attributionmodels/CreateController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$uibModalInstance',
    function($scope, $log, Restangular, Session, _, $stateParams, $location, $uibModalInstance) {
      $scope.availableAttributionModels = Restangular.all("attribution_models").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/campaigns/attribution_models/create`);
     
    }
  ]);
});
