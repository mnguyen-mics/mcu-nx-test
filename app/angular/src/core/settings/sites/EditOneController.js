define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/settings/sites/EditOneController', [
    '$scope', '$rootScope', '$log', '$location', '$state', '$stateParams', '$uibModal', '$filter', '$q', 'Restangular', 'core/common/auth/Session', 'lodash',
    'core/common/ErrorService', 'core/common/WarningService',
    function ($scope, $rootScope, $log, $location, $state, $stateParams, $uibModal, $filter, $q, Restangular, Session, _, ErrorService, WarningService) {
      var datamartId = Session.getCurrentDatamartId();
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $scope.aliasesPerPage = 20;
      $scope.aliasesCurrentPage = 0;
      $scope.editMode = false;
      $scope.site = { type: "SITE", datamart_id: datamartId, organisation_id: organisationId };
      $scope.aliases = [];
      $scope.rules = [];
      $scope.originalAliasesIds = [];
      $scope.originalRulesIds = [];

      if ($stateParams.siteId) {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/sites/'+$stateParams.siteId+'/edit');
      } else {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/sites/create');
      }

     

    }
  ]);
});
