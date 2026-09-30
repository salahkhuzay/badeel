/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // مفيد عند النشر على استضافة ثابتة (Vercel / Netlify / Cloudflare Pages)
  images: { unoptimized: true },
};

export default nextConfig;
