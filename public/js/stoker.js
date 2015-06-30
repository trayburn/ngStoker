angular.module("StokerAngularApp", ["ngRadialGauge"])
  .controller("MyCtrl", function ($scope, $http, $interval) {
    var config = {
      minTemp: 0,
      maxTemp: 300,
      interval: 2000,
      blowerAlertPercentage: 80,
      stokerIp: "stoker.azurewebsites.net",
      colors: {
        blue: "#DDDDFF",
        green: "#66FF66",
        red: "#FF0000"
      },
      intervalPromise: null
    }

    var defaultScale = {
      min: config.minTemp,
      max: config.maxTemp,
      unit: "°",
      precision: 2,
      ranges: [
        { min: 0, max: 0, color: config.colors.blue },
        { min: 0, max: 500, color: config.colors.green },
        { min: 500, max: 500, color: config.colors.red }
      ]
    };

    function newStoker(version) {
      return {
        version: version || "TEST MODE",
        sensors: {},
        foodSensors: {},
        airSensors: {},
        blowers: {}
      };
    }

    $scope.stoker = newStoker();

    $scope.dials = true;

    $scope.configureMode = function() {
      config.stokerIp = window.prompt("What is the IP address of your Stoker?", "rayburn.myds.me");
      config.interval = 250;
      $interval.cancel(config.intervalPromise);
      config.intervalPromise = $interval(updateFromStoker, config.interval);
      $scope.stoker = newStoker();
    }


    $scope.testMode = function() {
      config.stokerIp = "stoker.azurewebsites.net";
      config.interval = 500;
      $interval.cancel(config.intervalPromise);
      config.intervalPromise = $interval(updateFromStoker, config.interval);
      $scope.stoker = newStoker();
    }

    $scope.localTestMode = function() {
      config.stokerIp = "127.0.0.1:4000";
      config.interval = 250;
      $interval.cancel(config.intervalPromise);
      config.intervalPromise = $interval(updateFromStoker, config.interval);
      $scope.stoker = newStoker();
    }

    $scope.toggleDials = function() {
      $scope.dials = !$scope.dials;
    }


    function updateFromStoker() {
      $http.jsonp("http://" + config.stokerIp + "/stoker.json?version=true&callback=JSON_CALLBACK&nocache=" + new Date().getTime())
        .success(function (data) {
          $scope.stoker.version = data.stoker.version;
          var chartDataPoint = { };
          data.stoker.sensors.forEach(function (sensor) {
            if (typeof $scope.stoker.sensors[sensor.id] == 'undefined') {
              // There is a new Sensor...
              var newScale = {};
              angular.extend(newScale, defaultScale);
              $scope.stoker.sensors[sensor.id] = { scale: newScale };
            }

            // Update Sensor information
            var s = $scope.stoker.sensors[sensor.id];
            s.id = sensor.id;
            s.name = sensor.name;
            s.current = sensor.tc;
            s.alarm = sensor.al;
            s.target = sensor.ta;
            s.high = sensor.th;
            s.low = sensor.tl;
            s.blower = sensor.blower;

            if (s.blower === null && typeof $scope.stoker.foodSensors[sensor.id] == 'undefined') {
              $scope.stoker.foodSensors[sensor.id] = s;
            }
            if (s.blower != null && typeof $scope.stoker.airSensors[sensor.id] == 'undefined') {
              $scope.stoker.airSensors[sensor.id] = s;
            }

            function hasRangesChanged() {
              if (s.alarm == 0) {
                return s.scale.ranges[1].min != config.minTemp ||
                       s.scale.ranges[1].max != config.maxTemp;
              }

              if (s.blower === null) {
                return s.scale.ranges[0].max != (s.target - 10);
              }

              return s.low != s.scale.ranges[0].max || s.high != s.scale.ranges[1].max;
            }

            function updateRanges() {
              if (s.alarm == 0) {
                return [
                  { min: defaultScale.min, max: defaultScale.min, color: config.colors.blue },
                  { min: defaultScale.min, max: defaultScale.max, color: config.colors.green },
                  { min: defaultScale.max, max: defaultScale.max, color: config.colors.red },
                ];
              }
              if (s.blower === null) {
                return [
                  { min: defaultScale.min, max: s.target - 10, color: config.colors.blue },
                  { min: s.target - 10, max: s.target + 10, color: config.colors.green },
                  { min: s.target + 10, max: defaultScale.max, color: config.colors.red }
                ];
              }
              return [
                { min: defaultScale.min, max: s.low, color: config.colors.blue },
                { min: s.low, max: s.high, color: config.colors.green },
                { min: s.high, max: defaultScale.max, color: config.colors.red }
              ];
            }

            // Update scale
            if (hasRangesChanged()) {
              s.scale.ranges = updateRanges();
            }

          });

          function newHistoryArray() {
            var retVal = [];
            for (var i = 0; i < 100; i++) {
              retVal.push(0);
            }
            return retVal;
          }

          data.stoker.blowers.forEach(function (blower) {
            if (typeof $scope.stoker.blowers[blower.id] == 'undefined') {
              // There is a new blower...
              $scope.stoker.blowers[blower.id] = { history: newHistoryArray() };
            }

            // Update Blower information
            var b = $scope.stoker.blowers[blower.id];
            b.id = blower.id;
            b.name = blower.name;
            b.on = blower.on;
            b.history.shift();
            b.history.push(blower.on);
            b.runPercentage = b.history.reduce(function(a, b) {
              return a + b;
            });

            b.meterStyle = {
              width: b.runPercentage + "%"
            };

            if (b.runPercentage >= config.blowerAlertPercentage) {
              b.meterClass = "alert";
            }
            else {
              b.meterClass = "success";
            }
          });
        });
    }


    config.intervalPromise = $interval(updateFromStoker, config.interval);
  });
