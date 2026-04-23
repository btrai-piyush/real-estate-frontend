const getWindowConfig = () => {
  if (
    typeof window !== "undefined" &&
    window.__APP_CONFIG__ &&
    typeof window.__APP_CONFIG__ === "object"
  ) {
    return window.__APP_CONFIG__;
  }

  return {};
};

export function getRuntimeConfig(key) {
  const config = getWindowConfig();

  if (typeof key === "string" && key.length > 0) {
    return config[key];
  }

  return config;
}