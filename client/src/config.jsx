// config.js
const config = {
  apiBaseUrl:
    import.meta.env.VITE_API_URL ??
    (import.meta.env.MODE === "development"
      ? "http://localhost:8080"
      : "https://campusxchange-server.onrender.com"),
};

export default config;

