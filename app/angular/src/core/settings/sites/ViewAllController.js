define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/sites/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'lodash', '$filter', 'core/common/WarningService',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, _, $filter, WarningService) {
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.itemsPerPage = 20;
      $scope.currentPageCreative = 0;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/sites');
     
    }
  ]);
});
