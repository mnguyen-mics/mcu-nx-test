define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/adlayouts/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$state', '$stateParams', '$location', 'core/common/IabService', 'core/configuration',
    function ($scope, $log, Restangular, Session, _, $state, $stateParams, $location, IabService, configuration) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $location.path(Session.getV2WorkspacePrefixUrl() + `/settings/datamart/visit_analyzers`);
    }
  ])
  ;
})
;
