angular.module("StokerAngularApp", ["ngRadialGauge"])
  .controller("MyCtrl", function ($scope, $http, $interval) {
    var defaultScale = {
      min: 0,
      max: 300,
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
      blowers: {}
    };

    function updateFromStoker() {
      $http.jsonp("http://192.168.0.200/stoker.json?version=true&callback=JSON_CALLBACK")
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

            s.meterPercent = Math.ceil((s.current / defaultScale.max) * 100);
            s.meterStyle = {
              width: s.meterPercent + "%"
            };

            if (s.current < s.low) { s.meterClass = "secondary"; }
            if (s.current > s.high) { s.meterClass = "alert"; }
            if (s.current >= s.low && s.current <= s.high) { s.meterClass = "success"; }

            function hasRangesChanged() {
              if (s.blower === null) { return s.scale.ranges[0].max != (s.target - 10); }
              return s.low != s.scale.ranges[0].max || s.high != s.scale.ranges[1].max;
            }

            function updateRanges() {
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

          data.stoker.blowers.forEach(function (blower) {
            if (typeof $scope.stoker.blowers[blower.id] == 'undefined') {
              // There is a new blower...
              $scope.stoker.blowers[blower.id] = {};
            }

            // Update Blower information
            var b = $scope.stoker.blowers[blower.id];
            b.id = blower.id;
            b.name = blower.name;
            b.on = blower.on;
          });
        });
    }


    $interval(updateFromStoker, 1000);
  });
