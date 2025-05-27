const BASE_URL = 'http://localhost:8111/api/manuscripts';

export async function getManuscriptsByCountry(isoCode) {
  try {
    const response = await fetch(`${BASE_URL}/by-country?country=${isoCode}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching manuscripts for ${isoCode}:`, error);
    return [];
  }
  
}
