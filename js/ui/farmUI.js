import { state, updateFarmData, updateSelectedFile } from '../state.js';
import { analyzeFarmImage } from '../api/farmApi.js';
import { updateAero } from './mascot.js';

export function initFarmScanner() {
  const dropzone = document.getElementById('farm-dropzone');
  const fileInput = document.getElementById('farm-file-input');
  
  const defaultUI = document.getElementById('dropzone-default');
  const previewUI = document.getElementById('dropzone-preview');
  const previewImg = document.getElementById('preview-img');
  const previewFilename = document.getElementById('preview-filename');
  
  const btnBrowse = document.querySelector('.btn-browse');
  const btnClear = document.getElementById('btn-clear-preview');
  const btnAnalyze = document.getElementById('btn-analyze');
  const farmError = document.getElementById('farm-error');

  // Trigger file selection window
  btnBrowse.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  // Drag-and-drop support
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFileSelection(files[0]);
    }
  });

  // Standard input selection
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      processFileSelection(fileInput.files[0]);
    }
  });

  // File rendering setup
  function processFileSelection(file) {
    // Validate type compatibility
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      farmError.style.display = 'block';
      farmError.textContent = 'Please choose a compatible JPEG, PNG, or WEBP image.';
      return;
    }

    farmError.style.display = 'none';
    updateSelectedFile(file);

    // Use FileReader for preview image extraction
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewFilename.textContent = file.name;
      defaultUI.style.display = 'none';
      previewUI.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }

  // Restore dropzone default view
  btnClear.addEventListener('click', (e) => {
    e.stopPropagation();
    resetDropzone();
  });

  function resetDropzone() {
    updateSelectedFile(null);
    fileInput.value = '';
    previewImg.src = '';
    previewFilename.textContent = '';
    previewUI.style.display = 'none';
    defaultUI.style.display = 'flex';
    farmError.style.display = 'none';
    document.getElementById('farm-results-panel').style.display = 'none';
  }

  // Trigger analysis network upload
  btnAnalyze.addEventListener('click', async () => {
    if (!state.selectedFile) return;

    // UI state updates
    farmError.style.display = 'none';
    document.getElementById('farm-results-panel').style.display = 'none';
    const loader = document.getElementById('farm-loading-indicator');
    loader.style.display = 'flex';

    // Optional metadata gathering
    const farmerId = document.getElementById('input-farmer-id').value;
    const county = document.getElementById('input-county').value;
    const acres = document.getElementById('input-acres').value;
    const location = document.getElementById('input-location').value;
    const notes = document.getElementById('input-notes').value;

    const fd = new FormData();
    fd.append('image', state.selectedFile);
    if (farmerId) fd.append('farmerId', farmerId);
    if (county) fd.append('county', county);
    if (acres) fd.append('landAcres', acres);
    if (location) fd.append('location', location);
    if (notes) fd.append('notes', notes);

    try {
      await analyzeFarmImage(fd);
      loader.style.display = 'none';
    } catch (err) {
      console.error('Farm analysis error:', err);
      loader.style.display = 'none';
      farmError.style.display = 'block';
      farmError.textContent = 'Farm analysis failed. Please verify connection and try again.';
    }
  });
}

// Populate UI results for Farm Scan
export function renderFarmAnalysis(data) {
  const resultsPanel = document.getElementById('farm-results-panel');
  
  // Basic numeric metrics
  const total = data.total_tree_count ?? 0;
  document.getElementById('stat-trees').textContent = total;
  document.getElementById('stat-canopy').textContent = `${data.canopy_coverage_pct ?? 0}%`;
  document.getElementById('stat-confidence').textContent = `${Math.round((data.confidence_score ?? 0) * 100)}%`;
  document.getElementById('stat-density').textContent = data.tree_density_per_acre ?? '--';

  // Health stats configuration
  const health = data.tree_health || {};
  const healthyCount = health.healthy ?? 0;
  const careCount = health.needs_care ?? 0;
  const replacementCount = health.needs_replacement ?? 0;

  const healthyPct = total > 0 ? Math.round((healthyCount / total) * 100) : 0;
  const carePct = total > 0 ? Math.round((careCount / total) * 100) : 0;
  const replacementPct = total > 0 ? Math.round((replacementCount / total) * 100) : 0;

  // Set health text labels
  document.getElementById('val-healthy').textContent = `${healthyCount} (${healthyPct}%)`;
  document.getElementById('val-care').textContent = `${careCount} (${carePct}%)`;
  document.getElementById('val-replacement').textContent = `${replacementCount} (${replacementPct}%)`;

  // Update distribution progress fills
  document.getElementById('fill-healthy').style.width = `${healthyPct}%`;
  document.getElementById('fill-care').style.width = `${carePct}%`;
  document.getElementById('fill-replacement').style.width = `${replacementPct}%`;

  // Imagery mapping
  document.getElementById('img-original').src = data.original_image_url || '';
  document.getElementById('img-annotated').src = data.overlay_image_url || '';

  // Observations list injection
  const obsContainer = document.getElementById('farm-observations');
  obsContainer.innerHTML = '';
  const observations = data.observations || [];
  observations.forEach(obs => {
    const li = document.createElement('li');
    li.textContent = obs;
    obsContainer.appendChild(li);
  });

  // Recommendations list injection
  const recContainer = document.getElementById('farm-recommendations');
  recContainer.innerHTML = '';
  const recommendations = data.recommendations || [];
  recommendations.forEach(rec => {
    const li = document.createElement('li');
    li.textContent = rec;
    recContainer.appendChild(li);
  });

  // Calculate and populate smart crossover agronomic advice
  updateFarmData(data);
  generateAgronomicAdvice(data, state.latestWeatherData);
  updateAero(state.latestWeatherData, data);

  // Reveal results container
  resultsPanel.style.display = 'grid';
}

// Generate agronomic crossover recommendations combining scanner stats and weather forecast
export function generateAgronomicAdvice(farmData, weatherData) {
  const smartAdviceContainer = document.getElementById('farm-smart-advice');
  const weatherAdviceContainer = document.getElementById('weather-farmer-advice-list');

  // Set default placeholder on weather tab if no scan data exists yet
  if (!farmData) {
    if (weatherAdviceContainer) {
      weatherAdviceContainer.innerHTML = `<li style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">Please upload a farm image in the Farm Scanner tab to generate agronomic recommendations.</li>`;
    }
    return;
  }

  const advices = [];
  const health = farmData.tree_health || {};
  const careCount = health.needs_care ?? 0;
  const replacementCount = health.needs_replacement ?? 0;
  const density = farmData.tree_density_per_acre ?? 0;

  // Forecast factors evaluation
  let next3DaysNoRain = false;
  let rainTomorrow = false;
  let mildTempWeek = false;
  let highHumidity = false;

  if (weatherData && weatherData.daily) {
    // Check rain probability for next 3 days
    const rainProbs = weatherData.daily.slice(0, 3).map(day => day.precipitation_probability ?? 0);
    next3DaysNoRain = rainProbs.every(p => p === 0);

    // Rain probability forecast tomorrow
    const probTomorrow = weatherData.daily[1]?.precipitation_probability ?? 0;
    rainTomorrow = probTomorrow > 60;

    // Check if average temperature is mild
    const temps = weatherData.daily.map(day => ((day.temp_min ?? 0) + (day.temp_max ?? 0)) / 2);
    const avgTemp = temps.reduce((sum, t) => sum + t, 0) / temps.length;
    mildTempWeek = avgTemp >= 18 && avgTemp <= 25;

    // High humidity warning check
    const humidityToday = weatherData.current?.humidity ?? 0;
    highHumidity = humidityToday > 80;
  }

  // Irrigation Scheduling decisions
  if (careCount > 0 && next3DaysNoRain) {
    advices.push("Irrigation Alert: Your scan identified trees needing care, and no rainfall is forecasted for the next 3 days. Plan manual watering soon.");
  } else if (careCount > 0 && rainTomorrow) {
    advices.push("Watering Delay: Trees need care, but rain is expected tomorrow. Let nature irrigate your crops, then assess canopy moisture.");
  }

  // Fungal Risk evaluation
  if (density > 150 && highHumidity) {
    const humidityVal = weatherData.current?.humidity ?? 80;
    advices.push(`Fungal Risk: High humidity (${humidityVal}%) combined with dense tree placement increases the risk of leaf rust. Inspect inner branches for ventilation.`);
  }

  // Seedling window evaluation
  if (replacementCount > 5 && mildTempWeek) {
    advices.push("Optimal Planting Window: You have trees marked for replacement. Mild forecast temperatures this week provide a perfect window to plant young saplings.");
  }

  if (advices.length === 0) {
    advices.push("Your farm metrics match current forecast parameters. Follow standard seasonal crop rotation guidelines.");
  }

  // Render to both containers
  const renderList = (container) => {
    if (!container) return;
    container.innerHTML = '';
    advices.forEach(adv => {
      const li = document.createElement('li');
      li.style.fontSize = '14px';
      li.style.color = 'var(--text-secondary)';
      li.style.lineHeight = '1.5';
      li.textContent = adv;
      container.appendChild(li);
    });
  };

  renderList(smartAdviceContainer);
  renderList(weatherAdviceContainer);
}
