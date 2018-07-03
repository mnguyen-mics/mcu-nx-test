define(['./module'], function (module) {
  'use strict';

  module.controller('core/datamart/items/ViewAllController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'core/common/auth/Session', 'lodash', '$location', '$log',
    function ($scope, $stateParams, Restangular, Common, Session, _, $location, $log) {
      $scope.baseUrl = $location.path();
      $scope.datamartId = Session.getCurrentDatamartId();

      $location.path(Session.getV2WorkspacePrefixUrl() + '/library/catalog');
    }
  ]);
});