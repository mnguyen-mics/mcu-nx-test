define(['./module', 'moment-duration-format'], function (module) {

  'use strict';


  module.controller('core/datamart/users/ViewOneController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'jquery', 'core/common/auth/Session',
    'lodash', 'moment', '$log', '$location', '$q',
    function ($scope, $stateParams, Restangular, Common, $, Session, lodash, moment, $log, $location, $q) {

      var INITIAL_ACTIVITIES_LIMIT = 10;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/audience/timeline');

      


    }
  ]);

});
