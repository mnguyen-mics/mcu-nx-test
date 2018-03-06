define(['./module'], function (module) {
  'use strict';
  
  module.factory("core/scenarios/ScenarioContainer", [
    'Restangular', '$q', 'lodash', 'core/common/auth/Session', "async", 'core/common/promiseUtils', '$log', 'core/datamart/queries/common/Common',
    'core/scenarios/StorylineContainer',
    function (Restangular, $q, lodash, Session, async, promiseUtils, $log, Common, StorylineContainer) {

      var ScenarioContainer = function ScenarioContainer(scenarioId) {
        this.scenario = {};
        this.graph = {};
        this.inputs = {};
        var self = this;
        if (scenarioId) {
          Restangular.one('scenarios', scenarioId).get().then(function (scenario) {
            self.graph = new StorylineContainer(scenario);
            self.scenario = scenario;
          });
          Restangular.one('scenarios', scenarioId).all("inputs").getList().then(function (campaigns) {
            self.inputs = campaigns;
          });
        } else {
          self.scenario = {datamart_id: Session.getCurrentDatamartId()};
          self.graph = new StorylineContainer(null);
        }
      };

      ScenarioContainer.prototype.saveOrUpdate = function (scenario) {
        var self = this;
       
        
        if(!this.scenario.id) {
          return Restangular.one('scenarios', scenario.id).get().then(function (campaigns) {
            return self.graph.saveWithNewScenario(campaigns);
          });
          
          
        }else {
          return self.graph.save();
        }
      };

      ScenarioContainer.prototype.getScenario = function () {
        return this.scenario;
      };

      ScenarioContainer.prototype.getGraph = function () {
        return this.graph;
      };

      ScenarioContainer.prototype.getInputs = function () {
        return this.inputs;
      };

      return ScenarioContainer;
    }
  ]);
});
    