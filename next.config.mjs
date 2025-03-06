/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: {
      buildActivity: false, 
      buildActivityPosition: "bottom-right"
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'map.ponyrit.nl',
          port: '',
          pathname: '/*',
          search: ''
        },
        {
          protocol: 'https',
          hostname: 'ezmapdesign.com',
          port: '',
          pathname: '/demos/aces/**',
          search: ''
        }                        
      ]
  }       
};

export default nextConfig;
