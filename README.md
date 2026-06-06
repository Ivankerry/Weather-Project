# WeatherAI

A weather dashboard + farm tree analysis tool built with HTML, CSS, and vanilla JavaScript, powered by the WeatherAI API.

## Features
- Auto-detects your location and shows current conditions, AI weather insights, hourly and 7-day forecast
- Farm Scanner: upload drone/aerial images to count trees, assess canopy health, and get agronomic recommendations

## Setup

1. Clone the repo
   ```bash
   git clone https://github.com/Ivankerry/weatherai-app.git
   cd weatherai-app
   ```

2. Open the project by running the included local Node server. A proper local server is required because the WeatherAI API has a strict CORS policy that only allows requests from `http://localhost:8080/`.

   ```bash
   # Run the custom Node.js server
   node server.js
   ```

3. Navigate to **http://localhost:8080/** in your browser.

4. Create a `.env` file in the root directory and add your WeatherAI API key:
   ```env
   API_KEY=YOUR_API_KEY_HERE
   ```
   *(The custom Node server dynamically passes this to the front-end to protect it from source control).*

## Architecture

This project uses a clean Vanilla JS and CSS architecture:
- **`js/` (ES Modules)**: Logic is split across `main.js`, state management (`state.js`), UI controllers (`weatherUI.js`, `farmUI.js`, `mascot.js`, `tabs.js`), and API wrappers (`weatherApi.js`, `farmApi.js`).
- **`css/` (CSS Modules)**: Styling is segmented into logical files: `variables.css`, `base.css`, `layout.css`, `components.css`, `weather.css`, `farm.css`, `backgrounds.css`, and `mascot.css`.

## Tech Stack
- HTML5 &middot; Vanilla CSS (Modular) &middot; Vanilla JavaScript (ES Modules)
- Custom Node.js local dev server (`server.js`)
- WeatherAI API (weather, trees/forestry, usage)
- Weather Icons &middot; Lucide Icons &middot; Sora + DM Sans (Google Fonts)
