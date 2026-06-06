import { state, updateLocation } from './state.js';
import { fetchWeatherData } from './api/weatherApi.js';
import { hideError, showError } from './utils/helpers.js';
import { initTabs } from './ui/tabs.js';
import { initFarmScanner } from './ui/farmUI.js';
import { initMascot } from './ui/mascot.js';

document.addEventListener('DOMContentLoaded', () => {
  // Hydrate Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Setup tab switcher logic
  initTabs();

  // Setup Farm Scanner drag and drop zone logic
  initFarmScanner();

  // Initialize Aero Mascot interactivity
  initMascot();

  // Begin Geolocation tracking process
  detectLocation();
});

// User location detection using browser Geolocation API
function detectLocation() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
        loadWeatherAndUsage();
      },
      (err) => {
        // Fallback silently to defaults
        console.warn(`Geolocation failed: ${err.message}. Using fallback coordinates.`);
        loadWeatherAndUsage();
      },
      options
    );
  } else {
    loadWeatherAndUsage();
  }
}

// Coordinate parallel fetch calls for weather and usage details
function loadWeatherAndUsage() {
  hideError();
  
  fetchWeatherData(state.currentLatitude, state.currentLongitude).catch(err => {
    console.error('Initial network fetch failure:', err);
    showError();
  });
}
