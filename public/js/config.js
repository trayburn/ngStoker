var config = {
  minTemp: 0,
  maxTemp: 450,
  interval: 2000,
  blowerAlertPercentage: 80,
  stokerIp: "stoker.azurewebsites.net",
  colors: {
    blue: "#0000FF",
    green: "#00FF00",
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
