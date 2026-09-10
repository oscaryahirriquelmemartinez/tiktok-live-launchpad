import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el dev server a través del proxy de preview (127.0.0.1)
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
