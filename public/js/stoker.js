angular.module("StokerAngularApp", ["ngRadialGauge"])
  .controller("MyCtrl", function ($scope, $http, $interval) {
    $scope.stoker = newStoker();
    $scope.dials = true;

    $scope.configureMode = function() {
      return resetLocalData(window.prompt("What is the IP address of your Stoker?", ""), 2000, $interval, $scope, $http);
    }
    $scope.localMode = function() {
      return resetLocalData("rayburn.myds.me", 2000, $interval, $scope, $http);
    }
    $scope.testMode = function() {
      return resetLocalData("stoker.azurewebsites.net", 500, $interval, $scope, $http);
    }
    $scope.localTestMode = function() {
      return resetLocalData("127.0.0.1:4000", 250, $interval, $scope, $http);
    }

    $scope.toggleDials = function() {
      $scope.dials = !$scope.dials;
    }

    function update() {
      return updateFromStoker($http, $scope);
    }

    config.intervalPromise = $interval(update, config.interval);
  });
