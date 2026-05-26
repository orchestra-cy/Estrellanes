import Config from 'react-native-config';

const FALLBACK_API_BASE_URL = 'https://toothalie-production.up.railway.app/api';

export const BaseUrl =
  (Config.API_BASE_URL && Config.API_BASE_URL.trim()) ||
  FALLBACK_API_BASE_URL;

export const API_BASE_URL = BaseUrl;

if (!Config.API_BASE_URL) {
  console.warn(
    `[API] API_BASE_URL is missing in .env. Using fallback: ${FALLBACK_API_BASE_URL}`,
  );
}
