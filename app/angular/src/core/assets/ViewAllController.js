define(['./module', 'clipboard', 'jquery'], function (module, clipboard, $) {
  'use strict';

  module.controller('core/assets/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$state', '$stateParams', '$log', 'core/configuration', '$filter',
    function ($scope, Restangular, Session, $location, $state, $stateParams, $log, configuration, $filter) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.assetsUrl = configuration.ASSETS_URL;
      $scope.assets = [];
      $scope.adRenderers = [];
      $scope.adLayoutRendererVersions = [];
      $scope.listMode = true;

      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/library/assets');

     
    }
  ]);
});