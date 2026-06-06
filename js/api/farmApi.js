import { API_BASE_URL, API_KEY } from '../config.js';
import { renderFarmAnalysis } from '../ui/farmUI.js';

export async function analyzeFarmImage(formData) {
  const response = await fetch(`${API_BASE_URL}/v1/trees/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Tree Analysis returned status code ${response.status}`);
  }

  const data = await response.json();
  renderFarmAnalysis(data);
}
