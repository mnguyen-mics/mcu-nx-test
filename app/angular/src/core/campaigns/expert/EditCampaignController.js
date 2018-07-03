define(['./module', 'moment'], function (module, moment) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : Expert
   */

  module.controller('core/campaigns/expert/EditCampaignController', [
    'jquery', '$scope', '$uibModal', '$log', '$location', '$stateParams', 'lodash', 'core/campaigns/DisplayCampaignService', 'core/campaigns/CampaignPluginService',
    'core/common/WaitingService', 'core/common/ErrorService', 'core/campaigns/goals/GoalsService', 'core/common/auth/Session',
    function (jQuery, $scope, $uibModal, $log, $location, $stateParams, _, DisplayCampaignService, CampaignPluginService, WaitingService, ErrorService, GoalsService, Session) {
      var campaignId = $stateParams.campaign_id;
      $scope.organisationId = $stateParams.organisation_id;
      $scope.goalTypes = GoalsService.getGoalTypesList();
      $scope.isConversionType = GoalsService.isConversionType;
      $scope.getConversionType = GoalsService.getConversionType;
      $scope.checkedGoalTypes = [];
      $scope.conversionGoals = [];
      $scope.campaignScopeHelper = {
        campaignDateRange: {startDate: moment(), endDate: moment().add(20, 'days')},
        schedule: ''
      };

      $location.path(Session.getV2WorkspacePrefixUrl() + `/campaigns/display/${campaignId}/edit`);

      
    }
  ])
  ;
})
;

