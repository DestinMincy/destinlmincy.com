import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
    token: {
        fontSize: 16,
        colorPrimary: '#2776EA',
        colorInfo: '#2776EA',
        colorSuccess: '#52c41a', // Standard green
        colorWarning: '#faad14', // Standard yellow
        colorError: '#ff4d4f', // Standard red
        colorTextBase: '#333333',
        fontFamily: 'Montserrat, sans-serif',
    },
    components: {
        Button: {
            colorPrimary: '#2776EA',
            algorithm: true, // Enable algorithm for derived colors
        },
        Typography: {
            fontFamilyCode: 'monospace',
        },
    },
};

export default theme;
