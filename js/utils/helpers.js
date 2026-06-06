export function showError() {
  const errorBanner = document.getElementById('error-banner');
  if (errorBanner) {
    errorBanner.style.display = 'block';
  }
}

export function hideError() {
  const errorBanner = document.getElementById('error-banner');
  if (errorBanner) {
    errorBanner.style.display = 'none';
  }
}

// Map WMO codes to human readable text descriptions
export function getConditionTextByCode(conditionCode) {
  const code = String(conditionCode || '0');
  const codeMap = {
    '0': 'Clear Sky',
    '1': 'Mainly Clear',
    '2': 'Partly Cloudy',
    '3': 'Overcast',
    '45': 'Foggy',
    '48': 'Depositing Rime Fog',
    '51': 'Light Drizzle',
    '53': 'Moderate Drizzle',
    '55': 'Dense Drizzle',
    '56': 'Light Freezing Drizzle',
    '57': 'Dense Freezing Drizzle',
    '61': 'Slight Rain',
    '63': 'Moderate Rain',
    '65': 'Heavy Rain',
    '66': 'Light Freezing Rain',
    '67': 'Heavy Freezing Rain',
    '71': 'Slight Snow Fall',
    '73': 'Moderate Snow Fall',
    '75': 'Heavy Snow Fall',
    '77': 'Snow Grains',
    '80': 'Slight Rain Showers',
    '81': 'Moderate Rain Showers',
    '82': 'Violent Rain Showers',
    '85': 'Slight Snow Showers',
    '86': 'Heavy Snow Showers',
    '95': 'Thunderstorm',
    '96': 'Thunderstorm with Slight Hail',
    '99': 'Thunderstorm with Heavy Hail'
  };
  return codeMap[code] || 'Unknown';
}

// Weather Icon selector based on WMO code strings
export function getWeatherIconClass(conditionCode) {
  const code = String(conditionCode || '0');
  
  if (code === '0') return 'wi-day-sunny';
  if (code === '1' || code === '2') return 'wi-day-cloudy';
  if (code === '3') return 'wi-cloudy';
  if (code === '45' || code === '48') return 'wi-fog';
  if (code === '51' || code === '53' || code === '55' || code === '56' || code === '57') return 'wi-sprinkle';
  if (code === '61' || code === '63' || code === '65' || code === '66' || code === '67' || code === '80' || code === '81' || code === '82') return 'wi-rain';
  if (code === '71' || code === '73' || code === '75' || code === '77' || code === '85' || code === '86') return 'wi-snow';
  if (code === '95' || code === '96' || code === '99') return 'wi-thunderstorm';
  
  return 'wi-cloud'; // Default fallback
}
