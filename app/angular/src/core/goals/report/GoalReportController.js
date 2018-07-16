define(['./module', 'lodash'], function (module, _) {
  'use strict';

  var updateChartsStatistics = function ($scope, goalId, GoalAnalyticsReportService, ChartsService, charts) {
    var leftMetric = charts[0];
    var rightMetric = charts[1];

    // Get statistics according to time filter
    if ($scope.timeFilter === $scope.timeFilters[1]) {
      GoalAnalyticsReportService.hourlyPerformance(goalId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    } else {
      GoalAnalyticsReportService.dailyPerformance(goalId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    }
  };

  var updateStatistics = function ($scope, goalId, GoalAnalyticsReportService, ChartsService, charts) {
    GoalAnalyticsReportService.setDateRange($scope.reportDateRange);
    var attributionModels = $scope.attributionModels;


    if (GoalAnalyticsReportService.dateRangeIsToday()) {
      $scope.timeFilter = $scope.timeFilters[1];
    }

    $scope.xaxisdomain = [GoalAnalyticsReportService.getStartDate().toDate().getTime(),
      GoalAnalyticsReportService.getEndDate().toDate().getTime()
    ];

    updateChartsStatistics($scope, goalId, GoalAnalyticsReportService, ChartsService, charts);
    _.forEach(attributionModels, function (attributionModel) {
      attributionModel.stats = {};
      var stats = attributionModel.stats;

      GoalAnalyticsReportService.attributionKpi(goalId, attributionModel.id).then(function (data) {
        stats.global = data;
      });

      GoalAnalyticsReportService.attributionCampaigns(goalId, attributionModel.id).then(function (data) {
        stats.campaigns = data.transform("interaction_type", true);
      });
      GoalAnalyticsReportService.attributionSources(goalId, attributionModel.id).then(function (data) {
        stats.sources = data.transform("interaction_type", true);
      });
      GoalAnalyticsReportService.attributionCreatives(goalId, attributionModel.id).then(function (data) {
        stats.creatives = data.transform("interaction_type", true);
      });

      return;
    });


    GoalAnalyticsReportService.kpi(goalId)
      .then(function (data) {
        $scope.kpis = data;
      });
  };

  /**
   * Campaign list controller
   */
  module.controller('core/goals/report/GoalReportController', [
    '$scope', '$location', '$uibModal', '$log', '$stateParams', 'Restangular', 'core/goals/report/ChartsService', 'GoalAnalyticsReportService', 'core/common/auth/Session', 'core/common/files/ExportService',
    function ($scope, $location, $uibModal, $log, $stateParams, Restangular, ChartsService, GoalAnalyticsReportService, Session, ExportService) {
      var goalId = $stateParams.goal_id;
      // Chart
      $scope.reportDateRange = GoalAnalyticsReportService.getDateRange();
      $scope.reportDefaultDateRanges = GoalAnalyticsReportService.getDefaultDateRanges();
      $scope.timeFilters = ['Daily', 'Hourly']; // Time filters order is important
      $scope.timeFilter = $scope.timeFilters[0];
      $scope.chartArea = "chart-area";
      $scope.charts = ['value', 'conversions'];
      $scope.getChartName = ChartsService.getChartName;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/campaigns/goal/' + $stateParams.goal_id );

   
    }
  ]);
});
