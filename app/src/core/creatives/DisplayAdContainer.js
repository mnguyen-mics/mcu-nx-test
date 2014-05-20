(function () {
  'use strict';

  var module = angular.module('core/creatives');
  /*
   * Display Ad Container
   */

  module.factory("core/creatives/DisplayAdContainer", [
    "$q", "Restangular", "core/common/IdGenerator", "async", 
    function($q, Restangular, IdGenerator, async) {


      var DisplayAdContainer = function DisplayAdContainer() {

        this.creationMode = true;


        this.value = {type:"DISPLAY", template_group_id: "com.mediarithmics.campaign.display", template_artifact_id:"default-template"};
      };

      DisplayAdContainer.prototype.load = function (creativeId) {

        var root = Restangular.one('display_ads', creativeId);
        // send requests to get the value and the list of
        // ad group ids
        var creativeResourceP = root.get();
        var propertiesP = root.getList('renderer_properties');

        var self = this;

        var defered = $q.defer();


        $q.all([creativeResourceP, propertiesP])
        .then( function (result) {
          self.creationMode = false;
          self.value = result[0];
          self.id = self.value.id;
          var properties = result[1];

          var propertiesP = [];
          if (properties.length > 0) {

            for(var i=0; i < properties.length; i++) {
              // load the ad group container corresponding to the id list in ad groups
              var propertyCtn = new PropertyContainer(properties[i]);

              self.properties.push(propertyCtn);
            }

            defered.resolve(self);

          } else {
            // return the loaded container
            defered.resolve(self);
          }



        }, function(reason) {

          defered.reject(reason);
        });

        // return the promise
        return defered.promise;
      };



      DisplayAdContainer.prototype.getProperty = function getProperty(id) {

        for(var i=0; i < this.properties.length; i++){
          if (this.properties[i].id === id) {
            return this.properties[i];
          }
        }
        return null;
      };


      DisplayAdContainer.prototype.persist = function persist() {

        var defered = $q.defer();

        var self = this;

        Restangular.all('display_ads').post(this.value, {organisation_id: this.organisationId})
        .then(angular.bind(this, function(campaign) {

          self.id = campaign.id;

          var pArray = [];

          if (self.properties.length > 0) {

            for(var i=0; i < this.properties.length; i++) {
              // persist the properties container
              pArray.push(this.properties[i].persist(self.id));
            }

            $q.all(pArray).then(function(result) {

              defered.resolve(self);

            }, function(reason) {
              defered.reject(reason);
            });

          } else {
            // return the loaded container
            defered.resolve(self);
          }

        }), function(reason) {
          defered.reject(reason);
        });

        return defered.promise;
      };

      DisplayAdContainer.prototype.update = function update() {

        var defered = $q.defer();

        var self = this;

        this.value.put().then(function(campaign) {

          var properties = self.properties;

          async.mapSeries(properties, function(property, callback) {

              // update the property
              property.update(self.id).then(function(result) {
                callback(null, result);
              }, function(reason) {
                callback(new Error(reason));
              });


          }, function(err, results){

            if (err) {
              defered.reject(err);
            } else {
              defered.resolve(self);
            }
          });


        }, function(reason) {
          defered.reject(reason);
        });

        return defered.promise;
      };

      return DisplayAdContainer;
    }
  ]);
})();

