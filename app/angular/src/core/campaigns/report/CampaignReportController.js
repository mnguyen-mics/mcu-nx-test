define(['./module', 'angular', 'lodash'], function (module, angular, _) {
  'use strict';

  var updateChartsStatistics = function ($scope, campaignId, CampaignAnalyticsReportService, ChartsService, charts) {
    var leftMetric = charts[0];
    var rightMetric = charts[1];

    // Get statistics according to time filter
    if ($scope.timeFilter === $scope.timeFilters[1]) {
      return CampaignAnalyticsReportService.hourlyPerformance(campaignId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    } else {
      return CampaignAnalyticsReportService.dailyPerformance(campaignId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    }
  };

  var updateStatistics = function ($scope, campaignId, CampaignAnalyticsReportService, ChartsService, charts, $q, ErrorService) {

    var currentStatObj = $scope.statisticsQuery = {
      rand: Math.random().toString(36).substring(8),
      isRunning: true,
      error: null
    };

    var promises = [];

    CampaignAnalyticsReportService.setDateRange($scope.date.reportDateRange);
    if (CampaignAnalyticsReportService.dateRangeIsToday()) {
      $scope.timeFilter = $scope.timeFilters[1];
    }

    $scope.xaxisdomain = [CampaignAnalyticsReportService.getStartDate().toDate().getTime(),
      CampaignAnalyticsReportService.getEndDate().toDate().getTime()
    ];

    promises.push(updateChartsStatistics($scope, campaignId, CampaignAnalyticsReportService, ChartsService, charts));

    promises.push(CampaignAnalyticsReportService.adGroupPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.adGroupPerformance = data;
    }));

    promises.push(CampaignAnalyticsReportService.adPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.adPerformance = data;
    }));

    promises.push(CampaignAnalyticsReportService.targetedSegmentPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.targetedSegmentPerformance = data;
    }));

    promises.push(CampaignAnalyticsReportService.discoveredSegmentPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.discoveredSegmentPerformance = data;
    }));

    // For unspeakable reasons (and hopefully soon-to-be-fixed ones) this triggers a huuuuge boost.
    // I'll work on these, please continue my combat if I fall.
    setTimeout(function () {
      promises.push(CampaignAnalyticsReportService.mediaPerformance(campaignId, $scope.hasCpa, "-".concat($scope.orderBy), 30).then(function (data) {
        // an other refresh was triggered, don't do anything !
        if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
          return;
        }

        $scope.mediaPerformance = data;
      }));


      // we now have all promises
      $q.all(promises).then(function () {
        currentStatObj.isRunning = false;
      }).catch(function (e) {
        currentStatObj.isRunning = false;
        currentStatObj.error = e;
        ErrorService.showErrorModal(e);
      });
    }, 500);

    CampaignAnalyticsReportService.kpi(campaignId, $scope.hasCpa).then(function (data) {
      $scope.kpis = data;
    });
  };

  /**
   * Campaign list controller
   */
  module.controller('core/campaigns/report/CampaignReportController', [
    '$scope', '$http', '$location', '$uibModal', '$log', '$stateParams', 'Restangular', 'core/campaigns/report/ChartsService', 'core/campaigns/DisplayCampaignService',
    'CampaignAnalyticsReportService', 'core/campaigns/CampaignPluginService', 'core/common/auth/Session', 'core/common/files/ExportService',
    'core/campaigns/goals/GoalsService', 'd3', 'moment', '$interval', '$q', 'core/common/ErrorService', 'core/common/auth/AuthenticationService',
    function ($scope, $http, $location, $uibModal, $log, $stateParams, Restangular, ChartsService, DisplayCampaignService, CampaignAnalyticsReportService, CampaignPluginService,
              Session, ExportService, GoalsService, d3, moment, $interval, $q, ErrorService, AuthenticationService) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/campaigns/display/'+$stateParams.campaign_id);
     
    }
  ]);
});
