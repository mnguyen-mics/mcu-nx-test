define(['./module'], function (module) {
  'use strict';

  var updateStatistics = function ($scope, CampaignAnalyticsReportService, organisationId, ErrorService) {

    var currentStatObj = $scope.statisticsQuery = {
      rand: Math.random().toString(36).substring(8),
      isRunning: true,
      error: null
    };

    CampaignAnalyticsReportService.setDateRange($scope.reportDateRange);
    // Moment is not immutable
    var report = CampaignAnalyticsReportService.allCampaigns(organisationId);
    report.then(function (stats) {

      currentStatObj.isRunning = false;

      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.displayCampaignsStatistics = stats;
    }).catch(function (e) {
      currentStatObj.isRunning = false;
      currentStatObj.error = e;
      ErrorService.showErrorModal(e);
    });
  };

  /**
   * Campaign list controller
   */
  module.controller('core/campaigns/ListDisplayCampaignsController', [
    '$scope', '$location', '$uibModal', '$log', 'Restangular', 'd3', 'moment', 'core/campaigns/DisplayCampaignService', 'core/common/auth/Session',
    'CampaignAnalyticsReportService', 'core/campaigns/CampaignPluginService', 'core/common/files/ExportService', 'core/common/ErrorService',
    function ($scope, $location, $uibModal, $log, Restangular, d3, moment, DisplayCampaignService, Session,
              CampaignAnalyticsReportService, CampaignPluginService, ExportService, ErrorService) {
      $log.debug("init campaigns");
      var currentWorkspace = Session.getCurrentWorkspace();

      $location.path(Session.getV2WorkspacePrefixUrl() + '/campaigns/display');
    }
  ]);

});
