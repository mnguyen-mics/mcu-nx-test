define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/UserAccountController', [
    '$scope', '$log', '$location', 'Restangular', 'core/common/auth/Session',
    function ($scope, $log, $location, Restangular, Session) {
      var userProfile = Session.getUserProfile();
      $scope.email = userProfile.email;
      $scope.firstName = userProfile.first_name;
      $scope.lastName = userProfile.last_name;
      $scope.workspaces = userProfile.workspaces;

      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/account/my_profile`);
    }
  ]);

});
