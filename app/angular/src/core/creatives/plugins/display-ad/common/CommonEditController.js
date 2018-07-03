/* global _ */
define(['./module'], function (module) {
  'use strict';

  /**
   * Common controller
   */
  module.controller('core/creatives/plugins/display-ad/common/CommonEditController', [
    '$scope', '$sce', '$log', '$location', '$stateParams', 'core/creatives/plugins/display-ad/DisplayAdService', 'core/common/auth/Session', 'core/creatives/CreativePluginService', 'core/configuration', '$state',
    function ($scope, $sce, $log, $location, $stateParams, DisplayAdService, Session, CreativePluginService, configuration, $state) {
      var creativeId = $stateParams.creative_id;

      $location.path(Session.getV2WorkspacePrefixUrl() + '/creatives/display/edit/'+creativeId);

     
    }
  ]);
});

