define(['./module'], function (module) {

  'use strict';

  module.controller('core/placementlists/EditAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal',
    function($scope, Restangular, Session, $location, $uibModal) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      Restangular.all('placement_lists').getList({organisation_id: organisationId}).then(function (placementLists) {
        $scope.placementLists = placementLists;
      });
      
      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/library/placementlist');

     
    }
  ]);

});


