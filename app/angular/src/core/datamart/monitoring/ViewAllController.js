define(['./module'], function (module) {

  'use strict';


  module.controller('core/datamart/monitoring/ViewAllController', [
    '$scope', 'core/common/auth/Session', '$location',
    function($scope, Session, $location) {

      // redirect to v2
      $location.path(Session.getV2WorkspacePrefixUrl() + '/audience/timeline');

      if (Session.cookies && Session.cookies.mics_vid){
        $scope.myTimelineHref = "#" + Session.getWorkspacePrefixUrl() + "/datamart/users/user_agent_id/vec:" + Session.cookies.mics_vid + "?live=true";
      }

    }
  ]);

});
