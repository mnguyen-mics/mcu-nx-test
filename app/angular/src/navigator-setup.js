define(['angular'], function () {
    'use strict';

    var navigator = angular.module('navigator', [
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ngAnimate',
      'ngRoute',
      'restangular',
      'ngBootstrap',
      'ui.keypress',
      'ui.unique',
      'ui.router',
      'ui.ace',
      'ct.ui.router.extras',
      'nvd3',
      'core/configuration',
    
      'core/scenarios',
      
      'core/datamart',
      'core/login',
      
      'core/common',

    ]);

    return navigator;
  }
);
