import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl size="small" fullWidth>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
            '& .MuiSelect-select': {
              color: 'white',
              fontWeight: 'medium',
              fontSize: '0.875rem',
            },
            '& .MuiSvgIcon-root': {
              color: 'white',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="ta">தமிழ்</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageToggle;
