angular.module("StokerAngularApp", ["ngRadialGauge"])
  .controller("MyCtrl", function ($scope, $http, $interval) {
    var config = {
      minTemp: 0,
      maxTemp: 300,
      interval: 2000,
      blowerAlertPercentage: 80,
      stokerIp: "rayburn.myds.me",
      intervalPromise: null
    }

    var defaultScale = {
      min: config.minTemp,
      max: config.maxTemp,
      unit: "°",
      precision: 2,
      ranges: [
        { min: 0, max: 0, color: "#0000FF" },
        { min: 0, max: 500, color: "#00FF00" },
        { min: 500, max: 500, color: "#FF0000" }
      ]
    };

    $scope.stoker = {
      version: "0.0.0.0",
      sensors: {},
      foodSensors: {},
      airSensors: {},
      blowers: {}
    };

    $scope.testMode = function() {
      config.stokerIp = "127.0.0.1:3000";
      config.interval = 200;
      $interval.cancel(config.intervalPromise);
      config.intervalPromise = $interval(updateFromStoker, config.interval);
    }

    function updateFromStoker() {
      $http.jsonp("http://" + config.stokerIp + "/stoker.json?version=true&callback=JSON_CALLBACK")
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
                  { min: defaultScale.min, max: defaultScale.min, color: "#0000FF" },
                  { min: defaultScale.min, max: defaultScale.max, color: "#00FF00" },
                  { min: defaultScale.max, max: defaultScale.max, color: "#FF0000" },
                ];
              }
              if (s.blower === null) {
                return [
                  { min: defaultScale.min, max: s.target - 10, color: "#0000FF" },
                  { min: s.target - 10, max: s.target + 10, color: "#00FF00" },
                  { min: s.target + 10, max: defaultScale.max, color: "#FF0000" }
                ];
              }
              return [
                { min: defaultScale.min, max: s.low, color: "#0000FF" },
                { min: s.low, max: s.high, color: "#00FF00" },
                { min: s.high, max: defaultScale.max, color: "#FF0000" }
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
