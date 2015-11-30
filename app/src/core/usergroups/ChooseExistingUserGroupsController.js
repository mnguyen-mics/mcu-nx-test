define(['./module'], function (module) {
  'use strict';

  module.controller('core/usergroups/ChooseExistingUserGroupsController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {

      $scope.availableUserGroups = Restangular.all("user_groups").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;

      $scope.selectedUserGroups = [];

      $scope.done = function() {
        var usergroup;
        for (var i = 0; i < $scope.selectedUserGroups.length; i++) {
          usergroup = $scope.selectedUserGroups[i];
          $scope.$emit("mics-user-group:selected", {
            usergroup : usergroup,
            exclude : usergroup.exclude // TODO use a wrapper ?
          });
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});

