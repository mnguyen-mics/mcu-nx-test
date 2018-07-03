define(['./module'], function (module) {

  'use strict';


  module.controller('core/datamart/partitions/ViewOneController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$stateParams', '$q',
    'core/datamart/segments/report/AudienceSegmentAnalyticsReportService', 'moment', 'lodash', '$location',
    function ($scope, Restangular, Session, $stateParams, $q, AudienceSegmentAnalyticsReportService, moment, _, $location) {
      var partitionId = $stateParams.partition_id;
      var datamartId = Session.getCurrentDatamartId();

       // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/audience/partitions/'+partitionId);

      

    }    
  ]);
});

