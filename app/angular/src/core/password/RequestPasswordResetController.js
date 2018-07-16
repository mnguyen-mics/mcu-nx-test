define(['./module', "autofill-event"], function (module) {
  'use strict';

  module.controller('core/password/RequestPasswordResetController', [
    '$scope', '$rootScope', '$location', '$stateParams', '$log', 'Restangular', 'core/login/constants',
    function ($scope, $rootScope, $location, $stateParams, $log, Restangular, LoginConstants) {
      $scope.email = "";

      // redirect to v2
      $location.path('/forgot_password');

     
    }
  ]);
});