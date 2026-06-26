import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Пустой конфиг для Turbopack (отключает ошибку)
  turbopack: {},
  
  // Webpack конфиг оставляем для совместимости
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas'];
    return config;
  },
};

export default nextConfig;
