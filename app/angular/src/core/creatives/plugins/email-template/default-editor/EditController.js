define(['./module', 'ui.ace'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/email-template/default-editor/EditController', [
    '$scope', '$log', '$location', '$stateParams', 'core/common/auth/Session', 'core/creatives/CreativePluginService',
    'Restangular', '$uibModal', 'core/common/WaitingService', 'core/common/ErrorService',
    'core/creatives/plugins/email-template/EmailTemplateService', 'core/common/properties/RendererPluginInstanceContainer', 'lodash',
    function ($scope, $log, $location, $stateParams, Session, CreativePluginService,
              Restangular, $uibModal, WaitingService, ErrorService,
              EmailTemplateService, RendererPluginInstanceContainer, _) {
      $scope.previewWidth = 750;
      $scope.previewHeight = 500;
      $scope.htmlContent = "";
      $scope.plainText = "";

      $location.path(Session.getV2WorkspacePrefixUrl() + '/creatives/email/'+$stateParams.creative_id+'/edit');

      

    }
  ]);
});
