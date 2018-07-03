define(['./module', 'jquery'], function (module, $) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : external
   */

  module.controller('core/campaigns/external/EditCampaignController', [
    '$scope', '$log', '$uibModal', '$location', '$stateParams', 'lodash', 'core/campaigns/DisplayCampaignService', 'core/campaigns/CampaignPluginService',
    'core/common/WaitingService', 'core/common/ErrorService', 'core/common/auth/Session', 'core/campaigns/goals/GoalsService',
    function ($scope, $log, $uibModal, $location, $stateParams, _, DisplayCampaignService, CampaignPluginService, WaitingService, ErrorService, Session, GoalsService) {
      var campaignId = $stateParams.campaign_id;
      $scope.organisationId = $stateParams.organisation_id;
      $scope.goalTypes = GoalsService.getGoalTypesList();
      $scope.isConversionType = GoalsService.isConversionType;
      $scope.getConversionType = GoalsService.getConversionType;
      $scope.checkedGoalTypes = [];
      $scope.conversionGoals = [];
      $scope.campaignScopeHelper = {};

      $location.path(Session.getV2WorkspacePrefixUrl() + '/campaigns/display/'+campaignId+'/edit');

     
    }
  ])
  ;
})
;

