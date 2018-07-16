define(['./module'], function (module) {

  'use strict';

  module.controller('core/attributionmodels/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal', '$state', '$stateParams',
    function($scope, Restangular, Session, $location, $uibModal, $state, $stateParams) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $location.path(Session.getV2WorkspacePrefixUrl() + '/settings/campaigns/attribution_models');

    }
  ]);

});


