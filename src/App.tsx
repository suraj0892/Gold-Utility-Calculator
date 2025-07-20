import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import './i18n';

// Import components
import Sidebar from './components/Sidebar';
import Breadcrumb from './components/Breadcrumb';
import LanguageToggle from './components/LanguageToggle';
import PurityCalculator from './components/PurityCalculator';
import AmountCalculator from './components/AmountCalculator';
import InterestCalculator from './components/InterestCalculator';
import { StorageManager } from './utils/storageUtils';

function App() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Initialize StorageManager when app starts
  const storageManager = StorageManager.getInstance();
  
  // Get initial selected menu from user preferences or default to 'purity'
  const getInitialSelectedMenu = () => {
    const savedMenu = storageManager.getUserPreference('selectedMenu');
    return savedMenu || 'purity';
  };
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);
  const [selectedMenu, setSelectedMenu] = useState(getInitialSelectedMenu());

  // Save selected menu to user preferences whenever it changes
  useEffect(() => {
    storageManager.setUserPreference('selectedMenu', selectedMenu);
  }, [selectedMenu, storageManager]);

  // Initialize language from user preferences or default to English
  useEffect(() => {
    const savedLanguage = storageManager.getUserPreference('language') || localStorage.getItem('i18nextLng');
    if (savedLanguage && ['en', 'ta'].includes(savedLanguage)) {
      if (i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage);
        // Save to our storage utility for future use
        storageManager.setUserPreference('language', savedLanguage);
      }
    } else if (!savedLanguage) {
      // Only set English as default if no language preference exists
      i18n.changeLanguage('en');
      storageManager.setUserPreference('language', 'en');
    }
  }, [i18n, storageManager]);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleMenuSelect = (menu: string) => {
    setSelectedMenu(menu);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  // Create dynamic theme
  const customTheme = createTheme({
    palette: {
      primary: {
        main: '#D4AF37', // Gold color
      },
      secondary: {
        main: '#C87533', // Copper color
      },
      background: {
        default: '#f5f5f5',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Noto Sans Tamil", "Helvetica", "Arial", sans-serif',
      h3: {
        fontWeight: 600,
      },
      h6: {
        fontFamily: '"Roboto", "Noto Sans Tamil", "Helvetica", "Arial", sans-serif',
      },
    },
  });

  const renderMainContent = () => {
    if (!selectedMenu) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h4" sx={{ color: '#9c7c38', textAlign: 'center' }}>
            {t('welcomeMessage')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', maxWidth: '500px' }}>
            {t('selectCalculatorMessage')}
          </Typography>
        </Box>
      );
    }

    switch (selectedMenu) {
      case 'purity':
        return <PurityCalculator />;
      case 'amount':
        return <AmountCalculator />;
      case 'interest':
        return <InterestCalculator />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar
          isDrawerOpen={isDrawerOpen}
          selectedMenu={selectedMenu}
          onMenuSelect={handleMenuSelect}
          onDrawerToggle={handleDrawerToggle}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: isMobile ? 0 : isDrawerOpen ? '250px' : 0,
          }}
        >
          {/* App Bar */}
          <AppBar 
            position="fixed" 
            sx={{ 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="toggle drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  fontSize: {
                    xs: '1rem',    // Smaller on mobile
                    sm: '1.1rem',  // Medium on small tablets
                    md: '1.25rem'  // Full size on desktop
                  },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {isMobile ? t('goldCalculator') : t('goldUtilityCalculator')}
              </Typography>
              
              <LanguageToggle />
            </Toolbar>
          </AppBar>

          {/* Content */}
          <Box sx={{ 
            mt: 8, // Account for AppBar height
            p: 3,
            minHeight: 'calc(100vh - 64px)'
          }}>
            <Container maxWidth="xl">
              {/* Breadcrumb */}
              <Breadcrumb
                selectedMenu={selectedMenu}
                onMenuSelect={handleMenuSelect}
              />

              {/* Main Content Area */}
              {renderMainContent()}
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
