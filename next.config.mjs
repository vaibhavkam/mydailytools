/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — produces /out folder of pure HTML/CSS/JS for S3 + CloudFront.
  output: "export",
  // Required because we use next/image without a server image optimizer.
  images: { unoptimized: true },
  // Each route becomes /path/index.html so S3 default-document routing works.
  trailingSlash: true,
  // No runtime config — everything is build-time.
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    // quicktype-core has a NodeIO module that imports node:fs / node:stream.
    // We never use that path in the browser (we feed it strings), so replace
    // those scheme imports with empty modules.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false, path: false, stream: false, crypto: false, os: false,
    };
    return config;
  },
};

export default nextConfig;
