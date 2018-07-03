define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/stylesheets/CreateOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', '$stateParams', '$location',
    function ($scope, $log, Restangular, Session, $stateParams, $location) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/datamart/visit_analyzers`);
    }
  ]);
});