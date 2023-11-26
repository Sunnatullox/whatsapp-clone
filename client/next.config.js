/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:"1287256863",
    NEXT_PUBLIC_ZEGO_SERVER_ID:"2edf9659d3e05da1deac26434a5bc27c"
  },
  images:{
    domains:["localhost"]
  }
};

module.exports = nextConfig;
