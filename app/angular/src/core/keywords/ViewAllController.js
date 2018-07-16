define(['./module'], function (module) {

  'use strict';

  // TODO
  module.controller('core/keywords/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal',
    function($scope, Restangular, Session, $location, $uibModal) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      Restangular.all('keyword_lists').getList({organisation_id: organisationId}).then(function (keywordsLists) {
        $scope.keywordsLists = keywordsLists;
      });

      
      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/library/keywordslist');
      
     
    }
  ]);

});

