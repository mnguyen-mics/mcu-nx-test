define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/mobileapplications/EditOneController', [
    '$scope', '$rootScope', '$log', '$location', '$state', '$stateParams', '$uibModal', '$filter', '$q', 'Restangular', 'core/common/auth/Session', 'lodash',
    'core/common/ErrorService', 'core/common/WarningService',
    function ($scope, $rootScope, $log, $location, $state, $stateParams, $uibModal, $filter, $q, Restangular, Session, _, ErrorService, WarningService) {
      var datamartId = Session.getCurrentDatamartId();
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $scope.editMode = false;
      $scope.app = {type: "MOBILE_APPLICATION", datamart_id: datamartId, organisation_id: organisationId};
      if ($stateParams.appId) {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/sites/' + $stateParams.appId + '/edit');
      } else {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/sites/create');
      }


    }
  ]);
});
