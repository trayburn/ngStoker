angular.module("KendoDemos", ["kendo.directives"])
  .controller("MyCtrl", function ($scope, $http, $interval) {

    $scope.stoker = {
      version: "0.0.0.0",
      sensors: {},
      blowers: {}
    };

    $scope.chart = {
      data: [],
      series: []
    };
    $scope.chart.dataSource = new kendo.data.DataSource({ data: $scope.chart.data });

    function updateFromStoker() {
      $http.jsonp("http://192.168.0.200/stoker.json?version=true&callback=JSON_CALLBACK")
        .success(function (data) {
          $scope.stoker.version = data.stoker.version;
          var chartDataPoint = { };
          data.stoker.sensors.forEach(function (sensor) {
            if (typeof $scope.stoker.sensors[sensor.id] == 'undefined') {
              // There is a new sensor...
              $scope.stoker.sensors[sensor.id] = {};
              $scope.chart.series.push({ field: sensor.id, name: sensor.name });
            }
            var s = $scope.stoker.sensors[sensor.id];
            s.id = sensor.id;
            s.name = sensor.name;
            s.current = sensor.tc;
            s.alarm = sensor.al;
            s.target = sensor.ta;
            s.high = sensor.th;
            s.low = sensor.tl;
            s.blower = sensor.blower;

            chartDataPoint[sensor.id] = sensor.tc;
          });

          $scope.chart.dataSource.add(chartDataPoint);

          data.stoker.blowers.forEach(function (blower) {
            if (typeof $scope.stoker.blowers[blower.id] == 'undefined') {
              $scope.stoker.blowers[blower.id] = {};
            }
            var b = $scope.stoker.blowers[blower.id];
            b.id = blower.id;
            b.name = blower.name;
            b.on = blower.on;
          });
        });
    }


    $interval(updateFromStoker, 250);

    $scope.scale = {
      min: 0,
      max: 500,
      ranges: [{
        from: 150,
        to: 200,
        color: "#ffc700"
      }, {
        from: 200,
        to: 300,
        color: "#ff7a00"
      }, {
        from: 300,
        to: 350,
        color: "#c20000"
      }]
    };
  });
