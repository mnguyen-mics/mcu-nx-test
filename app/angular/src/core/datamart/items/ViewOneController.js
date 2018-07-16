define(['./module'], function (module) {
  'use strict';

  module.controller('core/datamart/items/ViewOneController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'core/common/auth/Session', '$location',
    function ($scope, $stateParams, Restangular, Common, Session, $location) {
      $location.path(Session.getV2WorkspacePrefixUrl() + '/library/catalog');
    }
  ]);
});
