define(['./module'], function (module) {

  'use strict';


  module.controller('core/datamart/segments/ViewOneController', [
    '$scope', 'moment', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', 'core/datamart/queries/QueryContainer', 'd3', '$timeout', 'core/datamart/segments/report/AudienceSegmentAnalyticsReportService', '$location',
    function ($scope, moment, $log, Restangular, Session, _, $stateParams, QueryContainer, d3, $timeout, AudienceSegmentAnalyticsReportService, $location) {


      $scope.organisationId = $stateParams.organisation_id;

      $scope.datamartId = Session.getCurrentDatamartId();

      $scope.statsLoading = true;

      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/audience/segments/'+$scope.segmentId);

      

    }
  ]);
});

