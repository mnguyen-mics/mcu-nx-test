define(['./module'], function (module) {
  'use strict';

  module.controller('core/goals/EditAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal',
    function($scope, Restangular, Session, $location, $uibModal) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      Restangular.all('goals').getList({organisation_id: organisationId, archived: false}).then(function (goals) {
        $scope.goals = goals;
      });

      $location.path(Session.getV2WorkspacePrefixUrl() + '/campaigns/goal');

     
    }
  ]);

});
