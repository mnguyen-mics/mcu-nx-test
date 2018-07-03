define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/adlayouts/CreateOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/common/IabService',
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, IabService) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/visit_analyzers');
     
    }
  ]);
});
