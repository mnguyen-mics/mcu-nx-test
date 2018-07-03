define(['./module', 'moment'], function (module, moment) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : Expert
   */

  module.controller('core/campaigns/emails/EditCampaignController', [
    'jquery', '$scope', '$uibModal', '$log', '$location', '$stateParams', '$sce', 'lodash', 'core/configuration',
    'core/campaigns/CampaignPluginService', 'core/common/WaitingService', 'core/common/ErrorService', 'core/campaigns/goals/GoalsService',
    'Restangular', 'core/campaigns/emails/EmailCampaignContainer', 'core/common/auth/Session', 'core/common/auth/AuthenticationService',
    function (jQuery, $scope, $uibModal, $log, $location, $stateParams, $sce, _, configuration,
              CampaignPluginService, WaitingService, ErrorService, GoalsService,
              Restangular, EmailCampaignContainer, Session, AuthenticationService) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      var campaignId = $stateParams.campaign_id;
      var campaignCtn = {};

      $location.path(Session.getV2WorkspacePrefixUrl() + `/campaigns/email/${$stateParams.campaign_id}/edit`);

     
    }
  ]);
});
