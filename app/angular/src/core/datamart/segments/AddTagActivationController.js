define(['./module'], function (module) {
    'use strict';
  
    module.controller('core/datamart/segments/AddTagActivationController', [
      '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
      function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {
  
        if($scope.activation.value.id) {
          $scope.step = 'STEP_2';
  
          $scope.properties = [];
          if($scope.activation.properties) {
            $scope.properties = $scope.activation.properties;
          } else {
            $scope.activation.loadProperties().then(function(pluginInstance) {
              $scope.properties = pluginInstance.properties;
            });  
          }
        } else {
  
  
          $scope.plugin ={};
  
          $scope.properties = [];
  
          $scope.step = 'STEP_1';
  
  
          Restangular.all("plugins").getList({plugin_type: 'AUDIENCE_SEGMENT_TAG_FEED'}).then(function (results) {
            console.log(results)
            $scope.plugins = results;
            $scope.pluginsById = {};
            for(var i=0; i < $scope.plugins.length; i++) {
              var r = $scope.plugins[i];
              $scope.pluginsById[r.id] = r;
            }
          });
        }
  
        $scope.next = function() {
          $scope.step = 'STEP_2';
          $scope.properties = [];
  
          $scope.activation.loadDefaultProperties(Restangular.one("plugins", $scope.plugin.id)).then(function(pluginInstance) {
  
            $scope.properties = pluginInstance.properties;
          });
  
        };
        $scope.done = function() {
          if(!$scope.activation.value.id) {
            var plugin = $scope.pluginsById[$scope.plugin.id];
            var value = $scope.activation.value;
            value.group_id = plugin.group_id;
            value.artifact_id = plugin.artifact_id;
            value.status = 'PAUSED';
          }
          $scope.$emit("mics-audience-segment:tag-feed-added", $scope.activation);        
          $uibModalInstance.close();
        };
  
        $scope.cancel = function() {
          $uibModalInstance.close();
        };
  
      }
    ]);
  });
  