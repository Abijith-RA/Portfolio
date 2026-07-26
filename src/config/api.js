// API Configuration Helper
// Accesses environment variables from .env safely

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  apiKey: import.meta.env.VITE_API_KEY || '',
};

/**
 * Example helper function to make API requests using the stored environment variables.
 * Components call this helper function instead of managing raw API keys.
 */
export async function fetchPortfolioData(endpoint = '/projects') {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
}
