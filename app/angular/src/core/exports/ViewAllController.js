define(['./module'], function (module) {

  'use strict';

  module.controller('core/exports/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal', '$filter',
    function ($scope, Restangular, Session, $location, $uibModal, $filter) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/library/exports');

      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      Restangular.all('exports').getList({organisation_id: organisationId, max_results: 2000}).then(function (exports) {
        $scope.exports = exports;
      });

      $scope.filteredExports = function(){
        return $filter('filter')($scope.exports, $scope.searchInput);
      };

      $scope.organisationId = organisationId;
    }
  ]);

});


