const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  headers: async () => {
    if (process.env.NODE_ENV === "production")
      return [
        {
          source: "/images/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=3600",
            },
          ],
        },
        {
          source: "/bg/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=3600",
            },
          ],
        },
        {
          source: "/fonts/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=3600",
            },
          ],
        },
        {
          source: "/sounds/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=3600",
            },
          ],
        },
      ];

    return [];
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};
