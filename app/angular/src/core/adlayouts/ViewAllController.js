define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/adlayouts/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$state', '$stateParams', '$uibModal', '$log', '$filter',
    function ($scope, Restangular, Session, $location, $state, $stateParams, $uibModal, $log, $filter) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/datamart/visit_analyzers`);
    }
  ]);
});
