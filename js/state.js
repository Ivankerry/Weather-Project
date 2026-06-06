export const state = {
  selectedFile: null,
  currentLatitude: -1.2921, // Defaults to Nairobi
  currentLongitude: 36.8219,
  latestWeatherData: null,
  latestFarmData: null
};

export function updateLocation(lat, lon) {
  state.currentLatitude = lat;
  state.currentLongitude = lon;
}

export function updateWeatherData(data) {
  state.latestWeatherData = data;
}

export function updateFarmData(data) {
  state.latestFarmData = data;
}

export function updateSelectedFile(file) {
  state.selectedFile = file;
}
