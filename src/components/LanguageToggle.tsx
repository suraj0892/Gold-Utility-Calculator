import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    // Explicitly save to localStorage to ensure persistence
    localStorage.setItem('i18nextLng', newLanguage);
  };

  const languages = {
    en: { label: 'English', flag: '🇺🇸', short: 'EN' },
    ta: { label: 'தமிழ்', flag: '🇮🇳', short: 'தமிழ்' }
  };

  return (
    <Box sx={{ minWidth: isMobile ? 80 : 140 }}>
      <FormControl size="small" fullWidth>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          IconComponent={ExpandMoreIcon}
          renderValue={(selected) => (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? 0.5 : 1,
              py: 0.5
            }}>
              <LanguageIcon sx={{ 
                fontSize: isMobile ? '0.9rem' : '1rem', 
                color: '#D4AF37' 
              }} />
              <Typography sx={{ 
                fontSize: isMobile ? '0.75rem' : '0.85rem', 
                fontWeight: 'medium',
                color: 'white'
              }}>
                {isMobile 
                  ? languages[selected as keyof typeof languages]?.short
                  : `${languages[selected as keyof typeof languages]?.flag} ${languages[selected as keyof typeof languages]?.label}`
                }
              </Typography>
            </Box>
          )}
          sx={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(248, 246, 236, 0.1) 100%)',
            backdropFilter: 'blur(15px)',
            borderRadius: 3,
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(248, 246, 236, 0.2) 100%)',
              borderColor: 'rgba(212, 175, 55, 0.5)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
            },
            '&.Mui-focused': {
              borderColor: '#D4AF37',
              boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
            },
            '& .MuiSelect-select': {
              color: 'white',
              fontWeight: 'medium',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              padding: isMobile ? '6px 8px' : '8px 12px',
            },
            '& .MuiSvgIcon-root': {
              color: '#D4AF37',
              fontSize: isMobile ? '1rem' : '1.2rem',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(248, 246, 236, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                mt: 1,
                '& .MuiMenuItem-root': {
                  borderRadius: 1,
                  margin: '4px 8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    transform: 'translateX(2px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.25)',
                    }
                  }
                }
              }
            }
          }}
        >
          {Object.entries(languages).map(([code, lang]) => (
            <MenuItem key={code} value={code}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                width: '100%'
              }}>
                <Typography sx={{ fontSize: '1.2rem' }}>
                  {lang.flag}
                </Typography>
                <Typography sx={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 'medium',
                  color: '#333'
                }}>
                  {lang.label}
                </Typography>
                {i18n.language === code && (
                  <Chip
                    size="small"
                    label="Active"
                    sx={{
                      ml: 'auto',
                      backgroundColor: '#D4AF37',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: '20px'
                    }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageToggle;
