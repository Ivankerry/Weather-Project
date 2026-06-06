import { API_BASE_URL } from '../config.js';
import { renderWeather } from '../ui/weatherUI.js';
import { showError } from '../utils/helpers.js';

export async function fetchWeatherData(lat, lon) {
  try {
    let response = await fetch(`${API_BASE_URL}/v1/weather?lat=${lat}&lon=${lon}&days=7&ai=true&units=metric&lang=en`, {
      method: 'GET'
    });

    // If AI summary generation fails or has server issues, retry without AI parameters
    if (!response.ok) {
      console.warn(`Weather API with AI failed (status ${response.status}). Retrying without AI summary...`);
      response = await fetch(`${API_BASE_URL}/v1/weather?lat=${lat}&lon=${lon}&days=7&units=metric&lang=en`, {
        method: 'GET'
      });
    }

    if (!response.ok) {
      throw new Error(`Weather API returned status code ${response.status}`);
    }

    const data = await response.json();
    renderWeather(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    showError();
    throw error;
  }
}
