import { state } from '../state.js';

// Aero Mascot Trivia Database
export const AERO_TRIVIA = [
  "Did you know? Sunflowers can be used to extract toxic ingredients from soil, such as lead, arsenic, and uranium.",
  "Farming Fact: Plants can hear! Research shows that some plants can sense the sound of running water or insects feeding.",
  "Weather Trivia: A single bolt of lightning contains enough energy to toast 100,000 slices of bread.",
  "Farming Fact: Drones can scan crop fields in minutes to identify dry patches or pest infestations before they spread.",
  "Weather Trivia: Raindrops are not actually tear-shaped. They look more like tiny hamburger buns as they fall.",
  "Agronomy Fact: Healthy trees can increase nearby property values by up to 20 percent.",
  "Weather Trivia: The highest temperature ever recorded on Earth was 56.7 degrees Celsius in Death Valley in 1913.",
  "Farming Fact: Worms are a farmer's best friend. They aerate the soil and turn organic matter into rich fertilizer."
];

// Initialize Aero Mascot interactivity
export function initMascot() {
  const mascot = document.getElementById('aero-mascot');
  if (mascot) {
    mascot.addEventListener('click', (e) => {
      e.stopPropagation();
      mascot.classList.toggle('active');
    });
    document.addEventListener('click', () => {
      mascot.classList.remove('active');
    });
    
    const triviaBtn = document.getElementById('btn-aero-trivia');
    if (triviaBtn) {
      triviaBtn.addEventListener('click', (e) => {
        // Prevent click from propagating to document (closing bubble) or to mascot (toggling it)
        e.stopPropagation();
        triggerAeroTrivia();
      });
    }

    // Trigger automated wandering motion
    initAeroMovement();
  }
}

// Update virtual pet mascot animations, accessories, and speech bubbles
export function updateAero(weatherData, farmData) {
  const mascot = document.getElementById('aero-mascot');
  const bubble = document.getElementById('aero-bubble');
  const leafUmbrella = document.getElementById('aero-leaf-umbrella');
  const sunglasses = document.getElementById('aero-sunglasses');
  const eyeLeft = document.getElementById('aero-eye-left');
  const eyeRight = document.getElementById('aero-eye-right');
  const mouth = document.getElementById('aero-mouth');

  if (!mascot || !bubble) return;

  // Defaults
  mascot.classList.remove('windy');
  if (leafUmbrella) leafUmbrella.style.display = 'none';
  if (sunglasses) sunglasses.style.display = 'none';
  if (eyeLeft) eyeLeft.setAttribute('fill', 'var(--accent-teal)');
  if (eyeRight) eyeRight.setAttribute('fill', 'var(--accent-teal)');
  if (mouth) mouth.setAttribute('d', 'M47 56 Q50 58 53 56'); // Smile

  let statusMessage = "Hello! I am Aero. Let's check the weather!";

  // 1. Evaluate Weather-driven states
  if (weatherData) {
    let currentHour = 12;
    if (weatherData.current?.time) {
      currentHour = parseInt(weatherData.current.time.split('T')[1].split(':')[0], 10);
    }
    const currentHourly = weatherData.hourly?.[currentHour] || {};
    
    const uv = currentHourly.uv_index ?? 0;
    const precipProb = weatherData.daily?.[0]?.precipitation_probability ?? 0;
    const wind = weatherData.current?.wind_speed ?? 0;

    // Raining State
    if (precipProb > 40) {
      if (leafUmbrella) leafUmbrella.style.display = 'block';
      statusMessage = "Propeller shields active! Remember to carry a leaf umbrella today!";
    }
    // Sunny State
    else if (uv >= 3) {
      if (sunglasses) sunglasses.style.display = 'block';
      statusMessage = "Sunglasses on! UV levels are high today. Don't forget your SPF!";
    }
    // Windy State
    else if (wind > 20) {
      mascot.classList.add('windy');
      statusMessage = "Hold on tight! Propellers spinning at max speed to fight the wind!";
    }
    else {
      statusMessage = "Weather conditions look calm. Perfect day to plan farm activities!";
    }
  }

  // 2. Evaluate Farm Scanner state interaction override
  if (farmData) {
    const health = farmData.tree_health || {};
    const careCount = health.needs_care ?? 0;
    const replacementCount = health.needs_replacement ?? 0;

    if (careCount > 0 || replacementCount > 0) {
      // Worry mood
      if (eyeLeft) eyeLeft.setAttribute('fill', 'var(--accent-amber)');
      if (eyeRight) eyeRight.setAttribute('fill', 'var(--accent-amber)');
      if (mouth) mouth.setAttribute('d', 'M47 58 Q50 54 53 58'); // Frown
      
      statusMessage = `Oh no! I detected ${careCount + replacementCount} trees needing care or replacement. Check out my agronomic recommendations!`;
    } else {
      // Happy mood
      statusMessage = "Aero scan complete! All tree crowns look fully green and healthy. Fantastic job!";
    }
  }

  const textEl = document.getElementById('aero-text');
  if (textEl) {
    textEl.textContent = statusMessage;
  } else {
    bubble.textContent = statusMessage;
  }
}

// Initialize Aero Mascot random roaming movement
export function initAeroMovement() {
  const mascot = document.getElementById('aero-mascot');
  if (!mascot) return;

  // Cache initial position coordinates and transition left/top instead of right/bottom
  setTimeout(() => {
    const rect = mascot.getBoundingClientRect();
    mascot.style.right = 'auto';
    mascot.style.bottom = 'auto';
    mascot.style.left = `${rect.left}px`;
    mascot.style.top = `${rect.top}px`;

    // Roam every 15 seconds
    setInterval(moveAeroRandomly, 15000);
  }, 1000);
}

// Compute random coordinates inside safe bounds
export function moveAeroRandomly() {
  const mascot = document.getElementById('aero-mascot');
  if (!mascot) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Set boundary margins (80px to 120px) to keep character fully in view
  const paddingX = 100;
  const paddingY = 120;
  const randomX = Math.max(paddingX, Math.floor(Math.random() * (width - paddingX * 2)));
  const randomY = Math.max(paddingY, Math.floor(Math.random() * (height - paddingY * 2)));

  mascot.style.left = `${randomX}px`;
  mascot.style.top = `${randomY}px`;
}

// Mascot trivia presenter
export function triggerAeroTrivia() {
  const bubbleText = document.getElementById('aero-text');
  const eyeLeft = document.getElementById('aero-eye-left');
  const eyeRight = document.getElementById('aero-eye-right');
  const mouth = document.getElementById('aero-mouth');
  if (!bubbleText) return;

  // Pick random trivia
  const randomIndex = Math.floor(Math.random() * AERO_TRIVIA.length);
  const fact = AERO_TRIVIA[randomIndex];
  bubbleText.textContent = fact;

  // Set excited expressions (violet eyes, open mouth)
  if (eyeLeft) eyeLeft.setAttribute('fill', 'var(--accent-violet)');
  if (eyeRight) eyeRight.setAttribute('fill', 'var(--accent-violet)');
  if (mouth) mouth.setAttribute('d', 'M45 56 Q50 62 55 56');

  // Reset expression back to normal after 6 seconds
  setTimeout(() => {
    updateAero(state.latestWeatherData, state.latestFarmData);
  }, 6000);
}
