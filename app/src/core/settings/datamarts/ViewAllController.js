define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/datamarts/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'lodash',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, _) {
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.itemsPerPage = 20;
      $scope.currentPageCreative = 0;

      Restangular.all("datamarts").getList({"organisation_id": $scope.organisationId, "allow_administrator": "true"}).then(function(datamarts) {

        $scope.datamarts = datamarts;
       });


      $scope.new = function() {
        $location.path("/" + $scope.organisationId + "/settings/datamarts/new");
      };


      $scope.edit = function(datamart) {
        $location.path("/" + $scope.organisationId + "/settings/datamarts/edit/" + datamart.id);
      };

    }
  ]);
});
