/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "github.com", "picsum.photos"], // разрешить загрузку с localhost
  },
};

module.exports = nextConfig;
