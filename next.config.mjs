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
};

export default nextConfig;
