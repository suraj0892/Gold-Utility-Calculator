import React from 'react';
import {
  Breadcrumbs as MUIBreadcrumbs,
  Link,
  Typography,
  Box
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface BreadcrumbProps {
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ selectedMenu, onMenuSelect }) => {
  const { t } = useTranslation();

  const getMenuLabel = (menuId: string) => {
    switch (menuId) {
      case 'purity':
        return t('purityCalculator');
      case 'amount':
        return t('amountCalculator');
      case 'interest':
        return t('interestCalculator');
      default:
        return '';
    }
  };

  return (
    <Box sx={{ 
      mb: 3, 
      p: 2, 
      backgroundColor: 'rgba(248, 246, 236, 0.5)',
      borderRadius: 1,
      border: '1px solid rgba(212, 175, 55, 0.2)'
    }}>
      <MUIBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#D4AF37' }} />}
        aria-label="breadcrumb"
      >
        <Link
          underline="hover"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#9c7c38',
            cursor: 'pointer',
            '&:hover': {
              color: '#D4AF37'
            },
            transition: 'color 0.2s ease'
          }}
          onClick={() => onMenuSelect('')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('goldUtilityCalculator')}
        </Link>
        
        {selectedMenu && (
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#8E5924',
              fontWeight: 'medium'
            }}
          >
            {getMenuLabel(selectedMenu)}
          </Typography>
        )}
      </MUIBreadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
