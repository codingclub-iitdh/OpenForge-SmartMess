// @mui
import { GlobalStyles as MUIGlobalStyles } from '@mui/material';

// ----------------------------------------------------------------------

export default function GlobalStyles() {
  const inputGlobalStyles = (
    <MUIGlobalStyles
      styles={{
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#faf8fc',
          backgroundImage:
            'radial-gradient(at 0% 0%, hsla(283, 65%, 92%, 0.5) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(38, 100%, 85%, 0.35) 0px, transparent 50%)',
          backgroundAttachment: 'fixed',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f5f0f8',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(108, 27, 133, 0.25)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(108, 27, 133, 0.45)',
          },
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        img: {
          display: 'block',
          maxWidth: '100%',
        },
        ul: {
          margin: 0,
          padding: 0,
        },
        /* Ant Design Collapse Theming */
        '.ant-collapse': {
          borderColor: 'rgba(108, 27, 133, 0.15) !important',
        },
        '.ant-collapse > .ant-collapse-item > .ant-collapse-header': {
          color: '#6c1b85 !important',
          fontWeight: '600 !important',
          fontFamily: "'DM Sans', 'Inter', sans-serif !important",
        },
        '.ant-collapse > .ant-collapse-item-active > .ant-collapse-header': {
          color: '#6c1b85 !important',
          background: 'rgba(108, 27, 133, 0.04) !important',
        },
        '.ant-spin-dot-item': {
          backgroundColor: '#6c1b85 !important',
        },
        '.ant-select-focused .ant-select-selector': {
          borderColor: '#6c1b85 !important',
          boxShadow: '0 0 0 2px rgba(108, 27, 133, 0.1) !important',
        },
        '.ant-btn-primary': {
          backgroundColor: '#6c1b85 !important',
          borderColor: '#6c1b85 !important',
        },
        '.ant-btn-primary:hover': {
          backgroundColor: '#9C4DB5 !important',
          borderColor: '#9C4DB5 !important',
        },
      }}
    />
  );

  return inputGlobalStyles;
}
