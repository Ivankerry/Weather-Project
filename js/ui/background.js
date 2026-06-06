export function updateWeatherBackground(conditionCode) {
  const container = document.getElementById('bg-effects-container');
  if (!container) return;

  // Reset current background effects
  container.className = '';
  container.innerHTML = '';

  const code = String(conditionCode || '0');
  const isRain = ['51', '53', '55', '56', '57', '61', '63', '65', '66', '67', '80', '81', '82'].includes(code);
  const isStorm = ['95', '96', '99'].includes(code);
  
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;

  if (isRain) {
    container.classList.add('bg-rainy');
    
    // Generate rain particles
    const raindropCount = 60;
    for (let i = 0; i < raindropCount; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.top = `${Math.random() * -20}px`;
      drop.style.animationDuration = `${0.5 + Math.random() * 0.8}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(drop);
    }
  } else if (isStorm) {
    container.classList.add('bg-stormy');
  } else if (code === '0' || code === '1') {
    if (isNight) {
      container.classList.add('bg-night');
      
      // Generate stars
      const starCount = 45;
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${2 + Math.random() * 4}s`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        container.appendChild(star);
      }
    } else {
      container.classList.add('bg-sunny');
    }
  }
}
