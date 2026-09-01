/** @type {import('next').NextConfig} */
const nextConfig = {
  // This page ports a plain-DOM script into React via a single useEffect.
  // Strict Mode double-invokes effects in dev, which would attach every
  // event listener twice, so it's switched off here.
  reactStrictMode: false,
};

module.exports = nextConfig;
