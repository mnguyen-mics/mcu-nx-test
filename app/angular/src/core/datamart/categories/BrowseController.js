define(['./module'], function (module) {

  'use strict';

  module.controller('core/datamart/categories/BrowseController', ['$scope', '$location', '$stateParams', '$log', 'Restangular', 'core/datamart/common/Common',
    'core/common/auth/Session', 'lodash', function ($scope, $location, $stateParams, $log, Restangular, Common, Session, lodash) {

      $scope.catalogBase = '#' + Session.getWorkspacePrefixUrl() + 'datamart/categories/';
      $scope.baseUrl = '#' + Session.getWorkspacePrefixUrl() + '/datamart/categories/' + $stateParams.catalogToken;
      $scope.itemUrl = Session.getWorkspacePrefixUrl() + '/datamart/items/' + $stateParams.catalogToken;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/library/catalog');

    }
  ]);

});
