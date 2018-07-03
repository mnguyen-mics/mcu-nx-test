define(['./module', 'lodash'], function (module, _) {

  'use strict';

  module.controller('core/scenarios/EditOneController/NodeController', ["$scope",'$log', '$uibModal','core/datamart/queries/QueryContainer', 'core/common/auth/Session', '$location',function($scope,$log, $uibModal, QueryContainer,Session, $location) {
    var datamartId = Session.getCurrentDatamartId();
    var nodeCtrl = this;
    $log.info($scope);

    this.editTrigger = function () {
      var newScope = $scope.$new(true);
      newScope.queryContainer = $scope.node.queryContainer.copy();
      newScope.evaluationContainer = {};
      if (!$scope.node.value.evaluation_mode){
        newScope.evaluationContainer.evaluation_mode = 'LIVE';
      } else {
        newScope.evaluationContainer.evaluation_mode = $scope.node.value.evaluation_mode;
      }
      if (!$scope.node.value.evaluation_period){
        newScope.evaluationContainer.evaluation_period = 30;
      } else {
        newScope.evaluationContainer.evaluation_period = $scope.node.value.evaluation_period;
      }
      if (!$scope.node.value.evaluation_period_unit){
        newScope.evaluationContainer.evaluation_period_unit = 'DAY';
      } else {
        newScope.evaluationContainer.evaluation_period_unit = $scope.node.value.evaluation_period_unit;
      }

      newScope.enableSelectedValues = true;
      newScope.enableEvaluationMode = true;
      $uibModal.open({
        templateUrl: 'angular/src/core/datamart/queries/edit-query.html',
        scope : newScope,
        backdrop : 'static',
        controller: 'core/datamart/queries/EditQueryController',
        windowClass: 'edit-query-popin'
      }).result.then(function ok(queryContainerUpdate, evaluationContainer){
        $scope.node.updateQueryContainer(queryContainerUpdate);
        $scope.node.value.evaluation_mode = newScope.evaluationContainer.evaluation_mode;
        $scope.node.value.evaluation_period = newScope.evaluationContainer.evaluation_period;
        $scope.node.value.evaluation_period_unit = newScope.evaluationContainer.evaluation_period_unit;
      }, function cancel(){
        $log.debug("Edit Query model dismissed");
      });
    };



  }]);




  module.controller('core/scenarios/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', '$stateParams', '$location', '$state', 'core/campaigns/DisplayCampaignService', '$uibModal', 'core/common/promiseUtils','$q',  'async', 'core/scenarios/StorylineContainer',"core/common/WaitingService", 'core/common/ErrorService',
    function ($scope, $log, Restangular, Session,  $stateParams, $location, $state, DisplayCampaignService, $uibModal, promiseUtils,$q, async, StorylineContainer,waitingService, ErrorService) {

      $location.path(Session.getV2WorkspacePrefixUrl() + `/automations/${$stateParams.scenario_id}/edit`);

    
    }
  ]);
});
