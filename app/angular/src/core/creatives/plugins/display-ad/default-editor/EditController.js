define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/display-ad/default-editor/EditController', [
    '$scope', '$log', '$location', '$stateParams', 'core/creatives/plugins/display-ad/DisplayAdService', 'core/common/auth/Session', 'core/creatives/CreativePluginService',
    '$controller', "core/common/ErrorService", '$state', 'core/common/IabService', 'lodash', 'Restangular',
    function ($scope, $log, $location, $stateParams, DisplayAdService, Session, CreativePluginService, $controller, errorService, $state, IabService, _, Restangular) {
      $scope.displayAd = {};
      $controller('core/creatives/plugins/display-ad/common/CommonEditController', { $scope: $scope });
      $scope.organisationId = $stateParams.organisation_id;

      function cleanProperties(properties) {
        var props = properties.slice();
        for (var i = props.length - 1; i >= 0; --i) {
          if (props[i].value.value === null ||
              (props[i].value.property_type === "INT" && props[i].value.value.value === null) ||
              (props[i].value.property_type === "DOUBLE" && props[i].value.value.value === null) ||
              (props[i].value.property_type === "STYLE_SHEET" && props[i].value.value.id === null) ||
              (props[i].value.property_type === "AD_LAYOUT" && props[i].value.value.id === null) ||
              (props[i].value.property_type === "STRING" && props[i].value.value.value === null) ||
              (props[i].value.property_type === "ASSET" && props[i].value.value.file_path === null) ||
              (props[i].value.property_type === "URL" && props[i].value.value.url === null)) {
            properties.splice(i, 1);
          }
        }
        return properties || [];
      }

      $scope.$on("display-ad:loaded", function () {
        // The parent controller has loaded the creative, you can use it now (check DisplayAdService)
        $log.info("display-ad:loaded");
        IabService.getAdSizes($scope.displayAd.subtype, $scope.organisationId).then(function(formats) {
          $scope.iabAdSizes = formats;
          if (formats.indexOf($scope.displayAd.format) > -1) {
            $scope.isCustomFormat = false;
          } else {
            $scope.isCustomFormat = true;
          }
          
        });

        var quantumTagProp = _.find($scope.properties, function(prop) { return prop.value.technical_name === "quantum_tag"; });          
        var quantumHash = quantumTagProp.value.value.value.match(/ah: "(.*?)"/)[1];
        $scope.quantumAdPreviewUrl = "http://s3.amazonaws.com/static.elasticad.net/nativedemo/apxcreativepreview.html?ean-test-native=true&ean-testall-native=true&ean-isinpreview=1&ean-test-hash=" + quantumHash;

      });

      $scope.takeScreenshot = function (creativeId) {
        Restangular.one('creatives', creativeId).all('screenshots').post([], { organisation_id: $scope.organisationId }).then(function (response) {
          $log.debug("Screenshot was taken!" + response);
        });
      };

      // Save button
      $scope.save = function (disabledEdition) {
        this.properties = cleanProperties(this.properties);
        if (disabledEdition) {
          if ($stateParams.creative_id !== undefined) {
            $scope.takeScreenshot($stateParams.creative_id);
          }
          $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
        } else {
          DisplayAdService.save().then(function (displayAdContainer) {
            $scope.takeScreenshot(displayAdContainer.id);
            $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
          }, function failure(response) {
            errorService.showErrorModal({
              error: response
            });
          });
        }
      };

      // Save button
      $scope.saveAndRefresh = function () {
        this.properties = cleanProperties(this.properties);
        DisplayAdService.save().then(function (displayAdContainer) {
          $scope.takeScreenshot(displayAdContainer.id);
          // $state.reload();
          // see https://github.com/angular-ui/ui-router/issues/582
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        }, function failure(response) {
          errorService.showErrorModal({
            error: response
          });
        });
      };

      // back button
      $scope.cancel = function () {
        DisplayAdService.reset();
        $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
      };

      $scope.findWarnings = function (propertyContainer) {
        var property = propertyContainer.value;
        var warnings = [];
        switch (property.technical_name) {
          case "tag":
            if (property.value && property.value.value && property.value.value.substr(0, 7) === "http://") {
              warnings.push("The tag isn't in https, the creative will not be displayed on secured websites.");
            }
        }
        return warnings;
      };

      $scope.isQuantumAdRenderer = function() {
        return $scope.displayAd.renderer_artifact_id === "quantum-native-script";
      };
      
    }
  ]);
});