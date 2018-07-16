define(['./module'], function (module) {

  'use strict';


  module.controller('core/goals/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$state','$uibModal',
    'core/datamart/queries/QueryContainer', '$q', 'core/common/promiseUtils', 'async', 'core/common/WaitingService',
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, $state,$uibModal,QueryContainer, $q, promiseUtils, async, WaitingService) {
      var goalId = $stateParams.goal_id;
      var triggerDeletionTask = false;
      var datamartId = Session.getCurrentDatamartId();
      var queryId = -1;
      var deletedAttributionModels = [];
      var isCreationMode = goalId ? false : true;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/campaigns/goal/' + $stateParams.goal_id + '/edit');

     

    }     

  ]);
});
