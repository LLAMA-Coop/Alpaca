const nextConfig = {
    reactStrictMode: false,
    basePath: process.env.NEXT_PUBLIC_BASEPATH || "",
    assetPrefix: process.env.NEXT_PUBLIC_BASEPATH || "",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
            },
        ],
        dangerouslyAllowSVG: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
