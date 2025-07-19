import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MenuOpen as MenuOpenIcon,
  Calculate as CalculateIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isDrawerOpen: boolean;
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
  onDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isDrawerOpen,
  selectedMenu,
  onMenuSelect,
  onDrawerToggle
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    {
      id: 'purity',
      label: t('purityCalculator'),
      icon: <CalculateIcon />
    },
    {
      id: 'amount',
      label: t('amountCalculator'),
      icon: <AccountBalanceIcon />
    }
  ];

  const drawerContent = (
    <Box sx={{ 
      width: 250,
      height: '100%',
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(248, 246, 236, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(212, 175, 55, 0.2)'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ 
          color: '#9c7c38',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          {t('menu')}
        </Typography>
        <IconButton 
          onClick={onDrawerToggle}
          size="small"
          sx={{ 
            color: '#D4AF37',
            '&:hover': {
              backgroundColor: 'rgba(212, 175, 55, 0.1)'
            }
          }}
        >
          <MenuOpenIcon />
        </IconButton>
      </Box>

      {/* Menu Items */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={selectedMenu === item.id}
              onClick={() => onMenuSelect(item.id)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(212, 175, 55, 0.25)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#D4AF37',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#9c7c38',
                    fontWeight: 'medium',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: selectedMenu === item.id ? '#D4AF37' : '#9c7c38'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: selectedMenu === item.id ? 'medium' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={isDrawerOpen}
      onClose={onDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 250,
          border: 'none',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
