define(['./module'], function (module) {
    'use strict';
  
    module.directive("mcsScenario", [
      '$log', 'Restangular', 'core/common/auth/Session', '$stateParams', '$location', '$state',
      'core/campaigns/DisplayCampaignService', '$uibModal', 'core/common/promiseUtils','$q',  'async',
      'core/scenarios/StorylineContainer',"core/common/WaitingService", 'core/common/ErrorService',
      function ($log, Restangular, Session,  $stateParams, $location, $state, DisplayCampaignService, $uibModal, promiseUtils,$q, async, StorylineContainer,waitingService, ErrorService) {
        return {
          restrict: 'E',
          scope: {
            // same as '=condition'
            scenarioContainer: '=',
          },
          link: function ($scope, element, attr) {

            if (!$scope.scenarioContainer) {
              throw new Error('missing scenarioContainer');
            }

            $scope.isCreationMode = !$scope.scenarioContainer.scenario.id;

            $scope.goToCampaign = function (campaign) {
              switch (campaign.type) {
                case "DISPLAY":
                  $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display/report/" + campaign.id + "/basic");
                  break;
                default:
                  $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display");
                  break;
              }
            };

            $scope.deleteNode = function (node) {
              $scope.scenarioContainer.graph.deleteNode(node);
            };

            $scope.addInput = function (type) {
              $scope.scenarioContainer.inputs.post({"type": type}, {"scenario_id": $scope.scenarioContainer.scenario.id}).then(function (r) {
                $scope.editInput(r);
              });
            };

            $scope.onConnection = function (link, handler, from, to) {
              $log.log("connection of ", handler, "from", from, "to", to);
              $scope.scenarioContainer.graph.addEdge(from, handler, to);

            };
            $scope.onDeconnect = function (link, edge) {
              $log.log("deconnection of ", link, "edge", edge);
              $scope.scenarioContainer.graph.removeEdge(edge);

            };

            $scope.deleteInput = function (input) {
              input.remove({"scenario_id": $scope.scenarioContainer.scenario.id}).then(function (r) {
              });
            };

            $scope.editInput = function (input) {
              $location.path(Session.getWorkspacePrefixUrl() + "/library/scenarios/" + $scope.scenarioContainer.scenario.id + "/inputs/" + input.id);
            };

            $scope.cancel = function () {
              $location.path(Session.getWorkspacePrefixUrl() + "/library/scenarios");
            };

            $scope.saveBeginNode = function (beginNode) {
              Restangular.one('scenarios', $scope.scenarioContainer.scenario.id).one("storyline").post("begin", beginNode).then(function (r, error) {

              });
            };

            // TODO if we want to create a campaign here we need something more complex handling also ad groups
            $scope.addCampaign = function (type) {
              if(type === 'TRIGGER') {
                $scope.scenarioContainer.graph.addNode({"type":"QUERY_INPUT","x":0,"y":0,"query_id":null});
              } else if (type === 'LIBRARY') {
                $uibModal.open({
                  templateUrl: 'angular/src/core/campaigns/ChooseExistingCampaign.html',
                  scope: $scope,
                  backdrop: 'static',
                  controller: 'core/campaigns/ChooseExistingCampaignController',
                  size: "lg"
                });
              }
            };
            $scope.$on("mics-campaign:selected", function (event, campaign, subCampaign) {
                $log.log("adding a campaign node", arguments);
                if(subCampaign) {
                  $scope.scenarioContainer.graph.addNode({campaign_id: campaign.id, type:campaign.type + "_CAMPAIGN", ad_group_id: subCampaign.id});
                } else {
                  $scope.scenarioContainer.graph.addNode({campaign_id: campaign.id, type:campaign.type + "_CAMPAIGN"});
                }
                $log.log("new graph : ", $scope.scenarioContainer.graph);
            });
            
            $scope.cancel = function () {
              $location.path(Session.getWorkspacePrefixUrl() + "/library/scenarios");
            };
          
          },
          templateUrl: function (elem, attr) {
            return 'angular/src/core/scenarios/scenarios-ui.html';
          }
        };
      }
    ]);
  });
  
  
  
  