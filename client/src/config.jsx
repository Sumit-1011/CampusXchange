// config.js

const config = {
  apiBaseUrl:
    import.meta.env.VITE_PRIMARY_API_URL ||
    (import.meta.env.MODE === "development"
      ? import.meta.env.VITE_LOCAL_API_URL
      : import.meta.env.VITE_FALLBACK_API_URL),

  fallbackApiBaseUrl: import.meta.env.VITE_FALLBACK_API_URL,
};

export default config;
