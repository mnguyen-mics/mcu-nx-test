define(['./module'], function (module) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : Expert
   */

  module.controller('core/campaigns/expert/EditAdGroupController', [
    '$scope', '$location', '$stateParams', '$uibModal', '$log', 'core/campaigns/DisplayCampaignService', 'core/common/ConstantsService', 'lodash','core/common/auth/Session',
    function($scope, $location, $stateParams, $uibModal, $log, DisplayCampaignService, ConstantsService, _, Session) {

      var adGroupId = $stateParams.ad_group_id;
      var organisationId = $stateParams.organisation_id;
      var campaignId = $stateParams.campaign_id;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/campaigns/display/'+campaignId+'/adgroups/'+adGroupId+'/edit');


    }
  ]);
});
