define(['./module'], function (module) {
  'use strict';

  module.controller('core/location/AddPostalCodeListController', [
            '$scope', '$uibModalInstance', '$document', '$log',  "Restangular", 'core/common/auth/Session', 'core/common/IdGenerator',
    function($scope, $uibModalInstance, $document, $log,  Restangular, Session, IdGenerator) {

      $scope.input = {};
      $scope.addedPostalCodes = [];

      $scope.input.country = "";
      $scope.input.countries = [];
      $scope.input.type= "zipcode";
      $scope.postalCodesList = undefined;

      $scope.$watch("input.country", function(newValue, oldValue){
        if(newValue !== undefined || newValue !== "") {
          if (newValue !== '') {
            $scope.input.countries.push(newValue);
          }
        }
      });

      $scope.removeCountry = function(country) {
        $scope.input.countries.splice($scope.input.countries.indexOf(country), 1);
      };

      $scope.$watch("input.postalCodesList", function (newValue, oldValue) {
        if(newValue === undefined || newValue === "") {
          $scope.addedPostalCodes = [];
        } else {
          $scope.addedPostalCodes = newValue.replace(/\s/g, '').split(",");
        }
      });

      $scope.done = function () {
        var postalCodeAdded;
        for (var i = 0; i < $scope.addedPostalCodes.length; i++) {
          postalCodeAdded = $scope.addedPostalCodes[i];
          $scope.$emit("mics-location:postal-code-added", {
            id: IdGenerator.getId(),
            type: 'POSTAL_CODE',
            country: $scope.input.country,
            postal_code : postalCodeAdded
          });
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});


