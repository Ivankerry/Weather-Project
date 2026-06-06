import { state, updateWeatherData } from '../state.js';
import { getConditionTextByCode, getWeatherIconClass } from '../utils/helpers.js';
import { generateAgronomicAdvice } from './farmUI.js';
import { updateAero } from './mascot.js';
import { updateWeatherBackground } from './background.js';

export function renderWeather(data) {
  // Update city display from location timezone
  const city = data.location?.city || data.city || data.location?.timezone?.split('/')[1]?.replace('_', ' ') || 'Your Location';
  document.getElementById('city-name').textContent = city;
  document.getElementById('header-city').textContent = city;

  // Render Date
  const dateStr = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  document.getElementById('hero-date').textContent = dateStr;

  // Temperature display
  const currentTemp = data.current?.temperature !== undefined ? Math.round(data.current.temperature) : '--';
  const heroTempElement = document.getElementById('hero-temp');
  heroTempElement.textContent = currentTemp;
  document.getElementById('degree-symbol').style.display = 'inline-block';

  // Condition title
  const conditionCode = data.current?.condition_code || '0';
  const conditionText = getConditionTextByCode(conditionCode);
  document.getElementById('hero-condition').textContent = conditionText;

  // Metrics tiles mapping
  // Parse current hour from timestamp to extract detailed metrics from hourly list
  let currentHour = 12;
  if (data.current?.time) {
    const timePart = data.current.time.split('T')[1];
    currentHour = parseInt(timePart.split(':')[0], 10);
  }
  
  const currentHourly = data.hourly?.find(h => {
    if (!h.time) return false;
    const hTimePart = h.time.split('T')[1];
    const hHour = parseInt(hTimePart.split(':')[0], 10);
    return hHour === currentHour;
  }) || data.hourly?.[currentHour] || {};

  document.getElementById('m-humidity').textContent = currentHourly.humidity ?? '--';
  document.getElementById('m-wind').textContent = data.current?.wind_speed ?? currentHourly.wind_speed ?? '--';
  document.getElementById('m-feels').textContent = currentHourly.feels_like !== undefined ? Math.round(currentHourly.feels_like) : '--';
  document.getElementById('m-uv').textContent = currentHourly.uv_index ?? '--';
  document.getElementById('m-precip').textContent = currentHourly.precipitation ?? (data.daily?.[0]?.precipitation_sum ?? '--');
  document.getElementById('m-vis').textContent = currentHourly.visibility ?? '10';

  // Render hourly cards and weekly forecast
  renderHourlyStrip(data.hourly || []);
  renderWeeklyForecast(data.daily || []);
  renderSunArc(data.daily?.[0] || {});

  // Update latest weather cache and trigger daily advice
  updateWeatherData(data);
  generatePersonalAdvice(data, currentHourly);
  generateAgronomicAdvice(state.latestFarmData, data);
  updateWeatherBackground(conditionCode);
  updateAero(data, state.latestFarmData);
}

function generatePersonalAdvice(data, currentHourly) {
  const listContainer = document.getElementById('personal-advice-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';
  const advices = [];

  const uv = currentHourly.uv_index ?? 0;
  const precip = currentHourly.precipitation ?? 0;
  const precipProb = data.daily?.[0]?.precipitation_probability ?? 0;
  const wind = data.current?.wind_speed ?? (currentHourly.wind_speed ?? 0);
  const feelsLike = currentHourly.feels_like ?? 20;

  // Sunscreen Alert
  if (uv >= 3) {
    advices.push(`UV index is moderate/high today (${uv}). Please apply sunscreen (SPF 30+) and wear sunglasses if spending time outdoors.`);
  }

  // Umbrella Alert
  if (precipProb > 40 || precip > 1) {
    advices.push(`High chance of showers today (${precipProb}%). We recommend carrying an umbrella or wearing a rain coat.`);
  }

  // Wind / Chill Alert
  if (wind > 20 && feelsLike < 18) {
    advices.push(`Breezy and chilly conditions today. Wear a windbreaker or a light jacket to stay warm.`);
  }

  if (advices.length === 0) {
    advices.push("Weather conditions are calm. No special precautions needed for daily activities.");
  }

  advices.forEach(adv => {
    const li = document.createElement('li');
    li.style.fontSize = '14px';
    li.style.color = 'var(--text-secondary)';
    li.style.lineHeight = '1.5';
    li.textContent = adv;
    listContainer.appendChild(li);
  });
}

function renderHourlyStrip(hours) {
  const container = document.getElementById('hourly-container');
  container.innerHTML = '';

  const currentHour = new Date().getHours();

  hours.forEach(hour => {
    const card = document.createElement('div');
    card.className = 'hour-card';

    // Parse hour number from time string e.g. "2026-06-05T14:00"
    let timeStr = '00:00';
    let hourNum = 0;
    if (hour.time) {
      timeStr = hour.time.split('T')[1]?.slice(0, 5) || hour.time.slice(-5);
      hourNum = parseInt(timeStr.split(':')[0], 10);
    }

    // Check if this card represents the current hour
    if (hourNum === currentHour) {
      card.classList.add('current');
    }

    const timeLabel = document.createElement('span');
    timeLabel.className = 'time';
    timeLabel.textContent = timeStr;

    const icon = document.createElement('i');
    icon.className = `wi ${getWeatherIconClass(hour.condition_code)}`;

    const tempLabel = document.createElement('span');
    tempLabel.className = 'temp';
    tempLabel.textContent = `${Math.round(hour.temperature || 0)}°`;

    card.appendChild(timeLabel);
    card.appendChild(icon);
    card.appendChild(tempLabel);
    container.appendChild(card);
  });

  // Enable easy horizontal scrolling with mouse wheel for desktop users
  container.addEventListener('wheel', (evt) => {
    if (evt.deltaY !== 0) {
      const atLeftEnd = container.scrollLeft <= 0 && evt.deltaY < 0;
      const atRightEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth) && evt.deltaY > 0;
      
      // Only hijack vertical scroll if there's room to scroll horizontally
      if (!atLeftEnd && !atRightEnd) {
        evt.preventDefault();
        container.scrollLeft += evt.deltaY;
      }
    }
  }, { passive: false });
}

function renderWeeklyForecast(forecastDays) {
  const container = document.getElementById('forecast-container');
  container.innerHTML = '';

  forecastDays.forEach((day, index) => {
    const card = document.createElement('div');
    card.className = 'day-card';

    // Weekday name formatting
    const dayLabel = document.createElement('span');
    dayLabel.className = 'day-name';
    if (index === 0) {
      dayLabel.textContent = 'Today';
      dayLabel.classList.add('today');
    } else {
      dayLabel.textContent = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' });
    }

    const icon = document.createElement('i');
    icon.className = `wi ${getWeatherIconClass(day.condition_code)}`;

    const maxTemp = document.createElement('span');
    maxTemp.className = 'temp-max';
    maxTemp.textContent = `${Math.round(day.temp_max || 0)}°`;

    const minTemp = document.createElement('span');
    minTemp.className = 'temp-min';
    minTemp.textContent = `${Math.round(day.temp_min || 0)}°`;

    card.appendChild(dayLabel);
    card.appendChild(icon);
    card.appendChild(maxTemp);
    card.appendChild(minTemp);

    // Rain probability pill insertion
    const rainChance = day.precipitation_probability || 0;
    if (rainChance > 0) {
      const rainPill = document.createElement('span');
      rainPill.className = 'rain-pill';
      rainPill.textContent = `${rainChance}%`;
      card.appendChild(rainPill);
    }

    container.appendChild(card);
  });
}

function renderSunArc(daily) {
  const sunriseStr = daily.sunrise ? daily.sunrise.split('T')[1]?.slice(0, 5) : '06:00';
  const sunsetStr = daily.sunset ? daily.sunset.split('T')[1]?.slice(0, 5) : '18:00';

  document.getElementById('sunrise-time').textContent = sunriseStr;
  document.getElementById('sunset-time').textContent = sunsetStr;

  // Convert time HH:MM to absolute minutes
  const parseTimeToMinutes = (timeStr) => {
    const cleanStr = timeStr.replace(/[^0-9:]/g, ''); // strip AM/PM
    const parts = cleanStr.split(':');
    let hrs = parseInt(parts[0] || '0', 10);
    const mins = parseInt(parts[1] || '0', 10);

    // Simple standard handling of 12-hour values if present
    if (timeStr.toLowerCase().includes('pm') && hrs < 12) {
      hrs += 12;
    }
    if (timeStr.toLowerCase().includes('am') && hrs === 12) {
      hrs = 0;
    }

    return hrs * 60 + mins;
  };

  const sunriseMin = parseTimeToMinutes(sunriseStr);
  const sunsetMin = parseTimeToMinutes(sunsetStr);
  
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  let progress = 0;
  if (currentMin >= sunriseMin && currentMin <= sunsetMin) {
    progress = (currentMin - sunriseMin) / (sunsetMin - sunriseMin);
  } else if (currentMin > sunsetMin) {
    progress = 1;
  }

  // Calculate arc dot tracking position
  const theta = Math.PI - (progress * Math.PI);
  const dotX = 70 + 60 * Math.cos(theta);
  const dotY = 60 - 60 * Math.sin(theta);

  // Update SVG attributes
  const dotElement = document.getElementById('sun-arc-dot');
  if (dotElement) {
    dotElement.setAttribute('cx', dotX);
    dotElement.setAttribute('cy', dotY);
  }

  const filledPath = document.getElementById('sun-arc-filled');
  if (filledPath) {
    // Total path length of semi-circle is approx 188.5
    const pathLength = 188.5;
    const offset = pathLength - (pathLength * progress);
    filledPath.setAttribute('stroke-dasharray', pathLength);
    filledPath.setAttribute('stroke-dashoffset', offset);
  }
}
