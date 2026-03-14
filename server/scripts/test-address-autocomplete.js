/**
 * Quick test for address autocomplete (Google Places when key is set).
 * Run from server folder: node scripts/test-address-autocomplete.js
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
const PORT = process.env.PORT || 5000;
const BASE = process.env.API_BASE_URL || `http://localhost:${PORT}`;

async function test() {
  console.log('Google key set:', !!API_KEY);
  console.log('Testing:', BASE + '/api/shipping/address-autocomplete?q=toronto');
  try {
    const res = await fetch(`${BASE}/api/shipping/address-autocomplete?q=toronto`);
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Success:', data.success);
    console.log('Suggestions count:', data.suggestions?.length ?? 0);
    if (data.suggestions?.length) {
      console.log('First suggestion:', JSON.stringify(data.suggestions[0], null, 2));
      if (data.suggestions[0].placeId) {
        console.log('-> Google Places is being used (suggestions have placeId)');
      } else {
        console.log('-> Nominatim fallback (no placeId)');
      }
    }
  } catch (e) {
    console.error('Error (is the server running?):', e.message);
  }
}

test();
