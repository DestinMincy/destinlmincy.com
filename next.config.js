/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@refinedev/antd", "antd", "@ant-design/icons", "@ant-design/cssinjs", "rc-util", "rc-pagination", "rc-picker", "rc-notification", "rc-tooltip"],
};

module.exports = nextConfig;
