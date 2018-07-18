define(['./module'], function (module) {

  'use strict';


  module.controller('core/keywords/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$uibModal', '$stateParams', 'core/keywords/KeywordListContainer', '$location',
    function($scope, $log, Restangular, Session, _, $uibModal, $stateParams, KeywordListContainer, $location) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;

      var keywordslistId = $stateParams.keywordslist_id;


      // redirect to v2
      if (keywordslistId) {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/library/keywordslist/'+ keywordslistId+'/edit');
      } else {
        $location.path(Session.getV2WorkspacePrefixUrl() + '/library/keywordslist/create');
      }
      

     
    }
  ]);
});

