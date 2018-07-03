define(['./module'], function (module) {

  'use strict';



  module.controller('core/datamart/partitions/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', '$stateParams', '$location', 'core/common/ErrorService', 'core/common/WaitingService',
    function ($scope, $log, Restangular, Session, $stateParams, $location, ErrorService, WaitingService) {
      var partitionId = $stateParams.partition_id;
      var type = $stateParams.type;

      var datamartId = Session.getCurrentDatamartId();
      var organisationId = Session.getCurrentWorkspace().organisation_id;

      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/audience/partitions/${partitionId}/edit');

      
    }
  ]);
});
