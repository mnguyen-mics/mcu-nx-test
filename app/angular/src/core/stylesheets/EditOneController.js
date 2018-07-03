define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/stylesheets/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$state', '$stateParams', '$location', 'core/common/ErrorService',
    function ($scope, $log, Restangular, Session, _, $state, $stateParams, $location, errorService) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/datamart/visit_analyzers`);
    }
  ])
  ;
})
;