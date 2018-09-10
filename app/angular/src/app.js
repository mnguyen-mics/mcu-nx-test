define(['app-setup', 'angularAMD', 'jquery'],
  function (app, angularAMD, jQuery) {
    'use strict';

    // jQuery("#mics_loading").remove();

    app.run(['$rootScope', '$window', '$location', '$log', 'core/common/auth/AuthenticationService', 'core/common/auth/Session', "lodash", "core/login/constants", "core/common/ErrorReporting","$state","$stateParams", "$urlRouter",
      function ($rootScope, $window, $location, $log, AuthenticationService, Session, _, LoginConstants, ErrorReporting, $state, $stateParams, $urlRouter ) {
        var defaults = _.partialRight(_.assign, function (a, b) {
          return typeof a === 'undefined' ? b : a;
        });

        ErrorReporting.setup();
        //

        function updateWorkspaces() {
          $log.debug("app.js updateWorkspaces !", $state.current, $state.params);
          $rootScope.currentOrganisation = Session.getCurrentWorkspace().organisation_name;
          $rootScope.currentOrganisationId = Session.getCurrentWorkspace().organisation_id;
          var workspace = Session.getCurrentWorkspace();
          $rootScope.currentWorkspace =  workspace;
          $rootScope.currentWorkspaceId = "o" + workspace.organisation_id + "d" + workspace.datamart_id;
          $rootScope.currentV2WorkspaceId = Session.getV2WorkspacePrefixUrl();
          var toStateParams = _.extend({} , $stateParams);
          toStateParams.organisation_id = $rootScope.currentWorkspaceId;
          $log.debug("redirect to new state", toStateParams);
          if ($state.current.name.indexOf("init-session") === -1 && !$location.url().match('/v2') && !$location.url().match('/login')) {
            $state.go($state.current, toStateParams, {
              location: true, notify: true, reload: true
            });
          }
        }


        if (AuthenticationService.hasAccessToken()) {
          // Done by react
          // if (AuthenticationService.hasRefreshToken()) {
          //   AuthenticationService.setupTokenRefresher();
          // }
          if (!Session.isInitialized()) {
            $log.debug("not initialized");
            AuthenticationService.pushPendingPath($location.url());
            // if (!$location.url().match('/v2')) {
              // $location.path('/init-session');
            // } else {
              var re = /v2\/o\/([\d]+)\//i;
              var $organisation_id = $location.url().match(re)[1];
              Session.init($organisation_id).then(function () {
                if (!$location.url().match('/v2')) {
                  $location.path(AuthenticationService.popPendingPath());
                }
                // var event = new Event(LoginConstants.LOGIN_SUCCESS);
                // $window.dispatchEvent(event);
                // $rootScope.$broadcast(LoginConstants.LOGIN_SUCCESS);
              });
            // }
          }
        } 
        // Auto login based on refresh token is done by react
        // But angular and react are not really synchronise
        // osef if its a route handled by angular, no auto login
        // else if (AuthenticationService.hasRefreshToken()) {
        //   $log.debug("has refresh token -> remember-me");
        //   // Keep the current path in memory
        //   AuthenticationService.pushPendingPath($location.url());
        //   // Redirect to the remember-me page
        //   AuthenticationService.createAccessToken().then(function () {
        //     // success  redirect to the pending path
        //     if (!$location.url().match('/v2')) {
        //       $location.path(AuthenticationService.popPendingPath());
        //     }

        //   }, function() {
        //     // failure : redirect to the login page
        //     $location.path('/login');
        //   });
        //   // $location.path('/remember-me');
        // } 
        else {
          var parsedStateFromUrl = _($state.get()).find(function(s) {
            // http://stackoverflow.com/questions/29892353/angular-ui-router-resolve-state-from-url/30926025#30926025

            if(s.$$state && s.$$state().url) {
              var urlAndQuery = $location.url().split("?");
              return !!s.$$state().url.exec(urlAndQuery[0], urlAndQuery[1]);
            } else {
              return false;
            }
          });
          $log.debug("parsed state from url : ", parsedStateFromUrl);
          if (!parsedStateFromUrl || !parsedStateFromUrl.publicUrl) {
            if (!$location.url().match('/v2') && !$location.url().match('/login') && !$location.url().match('/set-password')) {
              $log.debug("not a public url, go to login");
              AuthenticationService.pushPendingPath($location.url());
              // Redirect to login
              $location.path('/login');
            }
          }
        }




        $rootScope.$on(LoginConstants.WORKSPACE_CHANGED, updateWorkspaces);




        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
          var options = defaults(toState, {
            publicUrl: false,
            topbar: true
          });

          if (toState.data && toState.data.category) {
            $rootScope.category = toState.data.category;
          } else {
            var urlMatch = toState.name.match(/\/?(\w+)\/?/);
            if (urlMatch) {
              $rootScope.category = urlMatch[1];
            }
          }

          $rootScope.topbar = options.topbar;


        });
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
          $log.debug("$stateChangeStart ", fromState.url, " : ", toState.url);
          $log.debug("$stateChangeStart ", fromParams, " : ", toParams);
          if (toState.publicUrl) {
            $log.debug("nothing to check, public url !");
          } else {
            // if (!AuthenticationService.hasRefreshToken()) {
            //   if (toState.url !== 'login') {
            //     AuthenticationService.pushPendingPath($location.url());
            //   }
            //   // Redirect to login
            //   $location.path('/login');
            // } else 
            if (toParams.organisation_id !== fromParams.organisation_id && !!toParams.organisation_id) {
              var workspace = Session.getCurrentWorkspace();
              if (workspace && ("o" + workspace.organisation_id + "d" + workspace.datamart_id === toParams.organisation_id || workspace.organisation_id === toParams.organisation_id)) {
                $log.debug("done");
              } else if (toState.name !== 'logout') {
                $log.debug("prevent");
                event.preventDefault();

                $log.debug('onStateChangeStart: window.organisationId=', window.organisationId);
                if (!Session.isInitialized() && window.organisationId) {
                  AuthenticationService.setRestangularAuthHeader();
                  Session.init(window.organisationId).then(function() {
                    Session.updateWorkspaceFromCurrentWorkspace(window.organisationId).then(function (result) {
                      if (result) {
                        $state.go(toState, toParams, {
                          location: true, notify: true, reload: true
                        });
                      } else {
                        $state.go(toState, toParams, {
                          location: true, notify: false, reload: false
                        });
                      }
                    });
                  });
                }

                Session.updateWorkspaceFromCurrentWorkspace(toParams.organisation_id).then(function (result) {
                  if (result) {
                    $state.go(toState, toParams, {
                      location: true, notify: true, reload: true
                    });
                  } else {
                    $state.go(toState, toParams, {
                      location: true, notify: false, reload: false
                    });
                  }
                });
              }
            }
          }
        });
      }
    ]);

    angularAMD.bootstrap(app, true, document.body);
    window.angularLoaded = true;
    return app;
  });
