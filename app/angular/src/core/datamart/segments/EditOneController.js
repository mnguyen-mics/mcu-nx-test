define(['./module'], function (module) {

  'use strict';



  module.controller('core/datamart/segments/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$uibModal','moment',
    'core/datamart/queries/QueryContainer','$q','core/common/properties/PluginInstanceContainer',
    function($scope, $log, Restangular, Session, _, $stateParams, $location, $uibModal, moment, QueryContainer,$q, PluginInstanceContainer) {
      var segmentId = $stateParams.segment_id;
      var type = $stateParams.type;

      $scope.isCreationMode = !segmentId;

      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/audience/segments/'+segmentId+'/edit');

    
    }
  ]);
});
