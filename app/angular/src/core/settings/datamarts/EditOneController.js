define(['./module', 'jquery'], function(module, $) {
  'use strict';

  module.controller('core/settings/datamarts/EditOneController', [
    '$scope', '$rootScope', '$log', '$location', '$state', '$stateParams', '$uibModal', '$filter', '$q', 'Restangular', 'core/common/auth/Session', 'lodash',
    'core/common/ErrorService', 'core/common/WarningService',
    function($scope, $rootScope, $log, $location, $state, $stateParams, $uibModal, $filter, $q, Restangular, Session, _, ErrorService, WarningService) {
      var datamartId = $stateParams.datamartId;
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.editMode = true;
      $scope.rules = [];
      $scope.originalRulesIds = [];

      if ($stateParams.datamartId) {
        $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/datamart/sites/${$stateParams.datamartId}/edit`);
      } else {
        $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/datamart/sites/create`);
      }
      
    }
  ]);
});
