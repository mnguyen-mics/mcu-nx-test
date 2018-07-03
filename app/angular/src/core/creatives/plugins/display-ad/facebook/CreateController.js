define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/display-ad/facebook/CreateController', [
    '$scope', '$location', 'core/common/auth/Session', 'core/creatives/CreativePluginService', '$log', "core/creatives/plugins/display-ad/DisplayAdService", '$q',
    function ($scope, $location, Session, CreativePluginService, $log, DisplayAdService, $q) {


      $location.path(Session.getV2WorkspacePrefixUrl() + `/creatives/display/create`);

      

    }
  ]);
});
