define(['./module', 'angular', 'jquery'], function (module, angular, $) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : external-campaign-editor
   */

  module.controller('core/campaigns/external/EditAdGroupController', [
    '$scope', '$q', '$location', '$stateParams', '$log', '$uibModal', 'Restangular', 'core/campaigns/DisplayCampaignService', 'lodash', 'core/common/auth/Session', "core/creatives/plugins/display-ad/DisplayAdService",
    function ($scope, $q, $location, $stateParams, $log, $uibModal, Restangular, DisplayCampaignService, _, Session, DisplayAdService) {
      var adGroupId = $stateParams.ad_group_id;
      var campaignId = $stateParams.campaign_id;
      if (!DisplayCampaignService.isInitialized() || DisplayCampaignService.getCampaignId() !== campaignId) {
        return $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display/external/edit/" + campaignId);
      }

      $scope.campaignName = DisplayCampaignService.getCampaignValue().name;
      $scope.adGroup = DisplayCampaignService.getAdGroupValue(adGroupId);

      $location.path(Session.getV2WorkspacePrefixUrl() + `/campaigns/display/${campaignId}/adgroups/${adGroupId}/edit`);

    
    }
  ]);
});
