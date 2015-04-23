define(['./module'], function (module) {
  'use strict';

  /**
   * Video Ad Property Container
   */

  module.factory('core/creatives/plugins/video-ad/VideoAdPropertyContainer', [
    '$q', 'Restangular',
    function ($q, Restangular) {

      var VideoAdPropertyContainer = function VideoAdPropertyContainer(property) {
        this.value = property;
        this.id = property.id;
      };

      VideoAdPropertyContainer.prototype.update = function update() {
        var deferred = $q.defer();
        this.value.put().then(function (property) {
          deferred.resolve(property);
        }, function (reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
      };

      VideoAdPropertyContainer.prototype.persist = function persist(creativeId) {
        return Restangular.one("video_ads", creativeId).one("renderer_properties").customPUT([this.value]);
      };

      return VideoAdPropertyContainer;
    }
  ]);
});


