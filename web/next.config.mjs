/** @type {import('next').NextConfig} */
const nextConfig = {
  // Las imágenes se sirven vía URL firmada temporal; si usas next/image con
  // dominios remotos, agrégalos aquí. Por ahora usamos <img> con signed URLs.
  images: {
    remotePatterns: [
      // Ejemplo Supabase Storage:
      // { protocol: 'https', hostname: '<tu-proyecto>.supabase.co' },
    ],
  },
};

export default nextConfig;
