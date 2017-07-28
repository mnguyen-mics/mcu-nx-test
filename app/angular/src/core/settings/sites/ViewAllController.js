define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/sites/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'lodash', '$filter', 'core/common/WarningService',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, _, $filter, WarningService) {
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.itemsPerPage = 20;
      $scope.currentPageCreative = 0;

      $scope.$watchGroup(["datamartId", "organisationId"], function (values) {
        if (values) {
          Restangular.all("datamarts/" + $scope.datamartId + "/sites").getList({"organisation_id": $scope.organisationId, max_results:200}).then(function(sites) {
            $scope.sites = sites;
          });
        }
      });

      $scope.filteredSites = function () {
        return $filter('filter')($scope.sites, $scope.searchInput);
      };

      $scope.edit = function(site) {
        $location.path(Session.getWorkspacePrefixUrl() +  "/settings/sites/edit/" + site.id);
      };

      $scope.new = function() {
        $location.path(Session.getWorkspacePrefixUrl() +  "/settings/sites/new");
      };

      $scope.delete = function(site) {
        WarningService.showWarningModal("Do you really want to delete this site?").then(function () {
          Restangular.all("datamarts/" + $scope.datamartId + "/sites/" + site.id).remove({"organisation_id": $scope.organisationId}).then(function() {
            $state.transitionTo($state.current, $stateParams, {
              reload: true, inherit: true, notify: true
            });
          });
        });
      };
    }
  ]);
});
