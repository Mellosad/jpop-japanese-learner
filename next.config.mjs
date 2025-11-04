/** @type {import('next').NextConfig} */
const nextConfig = {
    // YouTube iframe 허용
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "frame-src 'self' https://www.youtube.com https://youtube.com"
            }
          ]
        }
      ];
    }
  }
  
  export default nextConfig
  