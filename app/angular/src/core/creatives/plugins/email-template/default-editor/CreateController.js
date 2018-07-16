define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/email-template/default-editor/CreateController', [
    '$scope', '$location', 'core/common/auth/Session', 'core/creatives/CreativePluginService', '$log', '$q',
    "Restangular", 'core/creatives/plugins/email-template/EmailTemplateService','core/common/properties/RendererPluginInstanceContainer', 'lodash',
    function ($scope, $location, Session, CreativePluginService, $log, $q, Restangular, EmailTemplateService, RendererPluginInstanceContainer, _) {

      $scope.wrapper = {
        emailTemplateName: "",
        selectedRenderer: null
      };

      $location.path(Session.getV2WorkspacePrefixUrl() + '/creatives/email/create');

     

    }
  ]);
});
