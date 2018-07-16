define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/serviceusage/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'ServiceUsageReportService', 'lodash', '$q', 'ngTableParams', 'core/common/files/ExportService',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, ServiceUsageReportService, _, $q, NgTableParams, ExportService) {
      var currentWorkspace = Session.getCurrentWorkspace();
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/my_datamart/' + $scope.datamartId + '/service_usage_report');

      
    }
  ]);
});
