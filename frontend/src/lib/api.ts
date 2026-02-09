/**
 * API Configuration
 * Uses environment variable in production, falls back to localhost for development
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API = {
    base: API_BASE_URL,
    integrations: `${API_BASE_URL}/api/v1/integrations`,
    xs: `${API_BASE_URL}/api/v1/xs`,
    unity: `${API_BASE_URL}/api/v1/unity`,
};

export default API;
