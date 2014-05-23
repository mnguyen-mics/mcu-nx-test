(function(){

  'use strict';

  var module = angular.module('core/campaigns/keywords', [
    'core/campaigns',
    'core/creatives',
    'core/adgroups',
    'restangular'
  ]);

  module.config([
    "$routeProvider",
    function ($routeProvider) {
      $routeProvider
      .when('/display-campaigns/campaign/keywords/:campaign_id?', {
        templateUrl: 'src/core/campaigns/keywords/index.html',
        topbar : false
      });
    }
  ]);

})();

