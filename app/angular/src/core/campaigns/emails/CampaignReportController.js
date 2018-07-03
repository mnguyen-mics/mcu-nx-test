define(['./module', 'angular', 'lodash'], function (module, angular, _) {
  'use strict';

  /**
   * Email Campaign Report Controller
   */
  module.controller('core/campaigns/emails/CampaignReportController', [
    '$scope', '$http', '$location', '$uibModal', '$log', '$stateParams', 'Restangular', 'core/campaigns/report/ChartsService', 'core/campaigns/emails/EmailCampaignService',
    'core/campaigns/CampaignPluginService', 'core/common/auth/Session', 'd3', 'moment', '$interval', '$q', 'core/common/ErrorService',
    'core/common/auth/AuthenticationService', '$timeout', 'CampaignAnalyticsReportService', 'core/campaigns/emails/EmailCampaignContainer',
    function ($scope, $http, $location, $uibModal, $log, $stateParams, Restangular, ChartsService, EmailCampaignService, CampaignPluginService,
              Session, d3, moment, $interval, $q, ErrorService, AuthenticationService, $timeout, CampaignAnalyticsReportService,EmailCampaignContainer) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      $location.path(Session.getV2WorkspacePrefixUrl() + `/campaigns/email/${$stateParams.campaign_id}`);
    

    }
  ]);
});
