define(['./module'], function (module) {
  'use strict';

  // TODO remove this method, use fetch-plugin-version-properties.
  module.directive('fetchPluginProperties', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function(fetchPluginProperties) {
              var asString = fetchPluginProperties;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)$/);
              var pluginIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(pluginIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                var properties = Restangular.one("plugins", newValue).all("properties").getList().then(function (props) {
                  $scope[exposedVar] = {};
                  for(var i = 0; i < props.length; i++) {
                    var prop = props[i];
                    $scope[exposedVar][prop.technical_name] = prop.value;
                  }
                });
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchPluginProperties);
        }
      };
    }
  ]);

  module.directive('fetchPluginVersionProperties', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function(fetchPluginVersionProperties) {
              var asString = fetchPluginVersionProperties;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)$/);
              var pluginVersionIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(pluginVersionIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                // TODO use the properties of the instance instead ? They already get the PLUGIN_STATIC properties
                Restangular.one("plugins").one("version", newValue).get().then(function (plugin) {
                  return Restangular.one("plugins", plugin.id).one("versions", newValue).all("properties").getList();
                }).then(function (props) {
                  $scope[exposedVar] = {};
                  for(var i = 0; i < props.length; i++) {
                    var prop = props[i];
                    $scope[exposedVar][prop.technical_name] = prop.value;
                  }
                });
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchPluginVersionProperties);
        }
      };
    }
  ]);


  module.directive('fetchPlugin', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function(fetchPlugin) {
              var asString = fetchPlugin;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)$/);
              var pluginIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(pluginIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                var plugin = Restangular.one("plugins", newValue);
                $scope[exposedVar] = plugin.get().$object;
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchPlugin);
        }
      };
    }
  ]);


  module.directive('fetchPluginFromVersion', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function(fetchPluginFromVersion) {
              var asString = fetchPluginFromVersion;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)$/);
              var pluginIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(pluginIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                var plugin = Restangular.one("plugins").one("version", newValue);
                $scope[exposedVar] = plugin.get().$object;
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchPluginFromVersion);
        }
      };
    }
  ]);

  // TODO remove this method, use fetch-plugin-version-properties.
  module.directive('fetchPluginPropertiesFromVersion', [
    "Restangular",
    function(Restangular) {
      return {
        restrict: 'EA',
        controller: [
          "$scope",
          function($scope) {
            this.setup = function(fetchPluginPropertiesFromVersion) {
              var asString = fetchPluginPropertiesFromVersion;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)$/);
              var pluginIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(pluginIdExpr, function(newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                Restangular.one("plugins/version", newValue).get().then(function(pluginVersion) {

                  var properties = Restangular.one("plugins", pluginVersion.id).all("properties").getList().then(function(props) {
                    $scope[exposedVar] = {};
                    for (var i = 0; i < props.length; i++) {
                      var prop = props[i];
                      $scope[exposedVar][prop.technical_name] = prop.value;
                    }
                  });

                });

              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchPluginPropertiesFromVersion);
        }
      };
    }
  ]);


});



