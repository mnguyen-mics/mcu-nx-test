define(['./module'], function (module) {

  'use strict';

  module.controller('core/visitanalysers/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal', '$state', '$stateParams',
    function ($scope, Restangular, Session, $location, $uibModal, $state, $stateParams) {
      $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/datamart/visit_analyzers');
    }
  ]);
});
