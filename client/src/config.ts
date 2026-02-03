// Backend URLs
export const AI_API_URL = import.meta.env.VITE_AI_URL || (import.meta.env.PROD ? 'https://cityguardian-ai.onrender.com' : 'http://localhost:8000');
export const AUTH_API_URL = import.meta.env.VITE_AUTH_URL || (import.meta.env.PROD ? 'https://cityguardian-server.onrender.com/api' : 'http://localhost:5000/api');

// ... keep existing code ...
