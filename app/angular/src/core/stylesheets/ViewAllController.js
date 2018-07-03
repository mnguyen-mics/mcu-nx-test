define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/stylesheets/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$state', '$stateParams', '$uibModal', '$log', '$filter',
    function ($scope, Restangular, Session, $location, $state, $stateParams, $uibModal, $log, $filter) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $scope.stylesheets = [];
      $scope.adRenderers = [];
      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/datamart/visit_analyzers`);
    }
  ]);
});