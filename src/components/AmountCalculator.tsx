import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Box,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  IconButton,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add, 
  Remove, 
  PictureAsPdf as PdfIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatIndianNumber, numberToWords, numberToWordsTamil } from '../utils/numberUtils';
import { exportAmountToPNG, exportAmountToPDF, AmountExportData } from '../utils/exportUtils';

interface AmountCalculatorProps {
  onReset?: () => void;
}

const AmountCalculator: React.FC<AmountCalculatorProps> = ({ onReset }) => {
  const { t, i18n } = useTranslation();

  // State for inputs
  const [goldWeight, setGoldWeight] = useState<number | string>('');
  const [goldPurity, setGoldPurity] = useState<number | string | 'custom'>('');
  const [customGoldPurity, setCustomGoldPurity] = useState<number | string>('');
  const [goldRate22k, setGoldRate22k] = useState<number | string>('');
  const [goldRate22kDisplay, setGoldRate22kDisplay] = useState<string>(''); // For formatted display
  const [goldRate24k, setGoldRate24k] = useState<number | string>('');
  const [goldRate24kDisplay, setGoldRate24kDisplay] = useState<string>(''); // For formatted display
  const [miscChargeType, setMiscChargeType] = useState<'amount' | 'percentage'>('amount');
  const [miscAmount, setMiscAmount] = useState<number | string>('');
  const [miscAmountDisplay, setMiscAmountDisplay] = useState<string>(''); // For formatted display
  const [miscPercentage, setMiscPercentage] = useState<number | string>('');

  // State for results
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [goldValue, setGoldValue] = useState<number | null>(null);
  const [miscValue, setMiscValue] = useState<number | null>(null);

  // Export-related states
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Helper function for round half up
  const roundHalfUp = (num: number, decimals: number = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  };

  // Load values from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('amountCalculator');
    console.log('Loading from localStorage:', savedData); // Debug log
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('Parsed data:', parsed); // Debug log
        
        // Only set values if they exist and are not empty
        if (parsed.goldWeight !== undefined && parsed.goldWeight !== '') {
          setGoldWeight(parsed.goldWeight);
        }
        if (parsed.goldPurity !== undefined && parsed.goldPurity !== '') {
          setGoldPurity(parsed.goldPurity);
        }
        if (parsed.customGoldPurity !== undefined && parsed.customGoldPurity !== '') {
          setCustomGoldPurity(parsed.customGoldPurity);
        }
        if (parsed.goldRate22k !== undefined && parsed.goldRate22k !== '') {
          setGoldRate22k(parsed.goldRate22k);
        }
        if (parsed.goldRate22kDisplay !== undefined && parsed.goldRate22kDisplay !== '') {
          setGoldRate22kDisplay(parsed.goldRate22kDisplay);
        }
        if (parsed.goldRate24k !== undefined && parsed.goldRate24k !== '') {
          setGoldRate24k(parsed.goldRate24k);
        }
        if (parsed.goldRate24kDisplay !== undefined && parsed.goldRate24kDisplay !== '') {
          setGoldRate24kDisplay(parsed.goldRate24kDisplay);
        }
        if (parsed.miscChargeType !== undefined && parsed.miscChargeType !== '') {
          setMiscChargeType(parsed.miscChargeType);
        }
        if (parsed.miscAmount !== undefined && parsed.miscAmount !== '') {
          setMiscAmount(parsed.miscAmount);
        }
        if (parsed.miscAmountDisplay !== undefined && parsed.miscAmountDisplay !== '') {
          setMiscAmountDisplay(parsed.miscAmountDisplay);
        }
        if (parsed.miscPercentage !== undefined && parsed.miscPercentage !== '') {
          setMiscPercentage(parsed.miscPercentage);
        }
        
        // Load results if they exist
        if (parsed.totalAmount !== undefined && parsed.totalAmount !== null) {
          setTotalAmount(parsed.totalAmount);
        }
        if (parsed.goldValue !== undefined && parsed.goldValue !== null) {
          setGoldValue(parsed.goldValue);
        }
        if (parsed.miscValue !== undefined && parsed.miscValue !== null) {
          setMiscValue(parsed.miscValue);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save values to localStorage whenever they change
  const saveToLocalStorage = () => {
    const dataToSave = {
      goldWeight,
      goldPurity,
      customGoldPurity,
      goldRate22k,
      goldRate22kDisplay,
      goldRate24k,
      goldRate24kDisplay,
      miscChargeType,
      miscAmount,
      miscAmountDisplay,
      miscPercentage,
      // Include results
      totalAmount,
      goldValue,
      miscValue
    };
    console.log('Saving to localStorage:', dataToSave); // Debug log
    localStorage.setItem('amountCalculator', JSON.stringify(dataToSave));
  };

  // Save to localStorage whenever any input or result changes
  useEffect(() => {
    saveToLocalStorage();
  }, [goldWeight, goldPurity, customGoldPurity, goldRate22k, goldRate22kDisplay, 
      goldRate24k, goldRate24kDisplay, miscChargeType, miscAmount, miscAmountDisplay, miscPercentage,
      totalAmount, goldValue, miscValue]);

  // Common gold purity values
  const commonPurities = [
    { value: 91.6, label: t('22k') },
    { value: 75, label: t('18k') },
    { value: 58.3, label: t('14k') },
    { value: 41.7, label: t('10k') },
    { value: 37.5, label: t('9k') },
    { value: 33.3, label: t('8k') }
  ];

  const handlePuritySelect = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === 'custom') {
      setGoldPurity('custom');
    } else {
      setGoldPurity(value);
      setCustomGoldPurity('');
    }
  };

  // Calculate amount results
  const calculateAmountResults = (
    goldWeightVal: number,
    goldPurityVal: number,
    rate22kVal: number,
    rate24kVal: number,
    miscAmountVal: number,
    miscPercentageVal: number
  ) => {
    // Always convert to pure gold weight (100% purity)
    const pureGoldWeight = goldWeightVal * (goldPurityVal / 100);
    
    // Always use 24K rate for calculation since we're using pure gold weight
    const goldValueCalc = pureGoldWeight * rate24kVal;

    let miscValueCalc: number;
    if (miscChargeType === 'amount') {
      miscValueCalc = miscAmountVal;
    } else {
      miscValueCalc = goldValueCalc * (miscPercentageVal / 100);
    }

    const totalAmountCalc = goldValueCalc + miscValueCalc;

    setGoldValue(goldValueCalc);
    setMiscValue(miscValueCalc);
    setTotalAmount(totalAmountCalc);
  };

  // Helper function to handle misc amount input with formatting
  const handleMiscAmountChange = (value: string) => {
    // Remove existing commas and non-numeric characters (except decimal point)
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Validate decimal places (max 2)
    const parts = cleanValue.split('.');
    if (parts.length > 2) return; // More than one decimal point
    if (parts.length === 2 && parts[1].length > 2) return; // More than 2 decimal places
    
    // Update the actual numeric value
    setMiscAmount(cleanValue);
    
    // Format for display if it's a valid number
    if (cleanValue && !isNaN(Number(cleanValue))) {
      const formattedValue = formatIndianNumber(Number(cleanValue));
      setMiscAmountDisplay(formattedValue);
    } else {
      setMiscAmountDisplay(cleanValue);
    }
  };

  // Helper function to handle 24K gold rate input with formatting and cross-calculation
  const handleGoldRate24kChange = (value: string) => {
    // Remove existing commas and non-numeric characters (except decimal point)
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Validate decimal places (max 2)
    const parts = cleanValue.split('.');
    if (parts.length > 2) return; // More than one decimal point
    if (parts.length === 2 && parts[1].length > 2) return; // More than 2 decimal places
    
    // Update the actual numeric value
    setGoldRate24k(cleanValue);
    
    // Format for display if it's a valid number
    if (cleanValue && !isNaN(Number(cleanValue))) {
      const formattedValue = formatIndianNumber(Number(cleanValue));
      setGoldRate24kDisplay(formattedValue);
      
      // Calculate and update 22K rate (22K purity is 22/24 = 91.67%)
      const rate22k = Number(cleanValue) * (22 / 24);
      const roundedRate22k = roundHalfUp(rate22k, 0); // Round to whole number
      const formattedRate22k = formatIndianNumber(roundedRate22k);
      setGoldRate22k(roundedRate22k.toString());
      setGoldRate22kDisplay(formattedRate22k);
    } else {
      setGoldRate24kDisplay(cleanValue);
      // Clear 22K rate if 24K is invalid
      setGoldRate22k('');
      setGoldRate22kDisplay('');
    }
  };

  // Helper function to handle 22K gold rate input with formatting and cross-calculation
  const handleGoldRate22kChange = (value: string) => {
    // Remove existing commas and non-numeric characters (except decimal point)
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Validate decimal places (max 2)
    const parts = cleanValue.split('.');
    if (parts.length > 2) return; // More than one decimal point
    if (parts.length === 2 && parts[1].length > 2) return; // More than 2 decimal places
    
    // Update the actual numeric value
    setGoldRate22k(cleanValue);
    
    // Format for display if it's a valid number
    if (cleanValue && !isNaN(Number(cleanValue))) {
      const formattedValue = formatIndianNumber(Number(cleanValue));
      setGoldRate22kDisplay(formattedValue);
      
      // Calculate and update 24K rate (22K purity is 22/24 = 91.67%)
      const rate24k = Number(cleanValue) / (22 / 24);
      const roundedRate24k = roundHalfUp(rate24k, 0); // Round to whole number
      const formattedRate24k = formatIndianNumber(roundedRate24k);
      setGoldRate24k(roundedRate24k.toString());
      setGoldRate24kDisplay(formattedRate24k);
    } else {
      setGoldRate22kDisplay(cleanValue);
      // Clear 24K rate if 22K is invalid
      setGoldRate24k('');
      setGoldRate24kDisplay('');
    }
  };

  // Helper functions for increment/decrement
  const incrementGoldWeight = () => {
    const current = Number(goldWeight) || 0;
    const newValue = current + 0.1;
    setGoldWeight(newValue.toFixed(1));
  };

  const decrementGoldWeight = () => {
    const current = Number(goldWeight) || 0;
    const newValue = Math.max(current - 0.1, 0);
    setGoldWeight(newValue.toFixed(1));
  };

  const incrementCustomGoldPurity = () => {
    const current = Number(customGoldPurity) || 0;
    const newValue = Math.min(current + 0.1, 100);
    setCustomGoldPurity(newValue.toFixed(1));
  };

  const decrementCustomGoldPurity = () => {
    const current = Number(customGoldPurity) || 0;
    const newValue = Math.max(current - 0.1, 0);
    setCustomGoldPurity(newValue.toFixed(1));
  };

  const incrementMiscPercentage = () => {
    const current = Number(miscPercentage) || 0;
    const newValue = Math.min(current + 0.1, 1000);
    setMiscPercentage(newValue.toFixed(1));
  };

  const decrementMiscPercentage = () => {
    const current = Number(miscPercentage) || 0;
    const newValue = Math.max(current - 0.1, 0);
    setMiscPercentage(newValue.toFixed(1));
  };

  // Effect to calculate when inputs change
  useEffect(() => {
    if (goldWeight && goldPurity && 
        !(goldPurity === 'custom' && (!customGoldPurity || customGoldPurity === '')) &&
        goldRate24k) { // Only require 24K rate since we always use it
      
      const actualGoldPurity = goldPurity === 'custom' ? 
        Number(customGoldPurity) : Number(goldPurity);
      
      const miscAmountVal = miscChargeType === 'amount' ? 
        (miscAmount ? Number(miscAmount) : 0) : 0;
      const miscPercentageVal = miscChargeType === 'percentage' ? 
        (miscPercentage ? Number(miscPercentage) : 0) : 0;

      calculateAmountResults(
        Number(goldWeight),
        actualGoldPurity,
        0, // No longer needed
        goldRate24k ? Number(goldRate24k) : 0,
        miscAmountVal,
        miscPercentageVal
      );
    } else {
      setTotalAmount(null);
      setGoldValue(null);
      setMiscValue(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goldWeight, goldPurity, customGoldPurity, goldRate24k, miscChargeType, miscAmount, miscPercentage]);

  const handleReset = () => {
    setGoldWeight('');
    setGoldPurity('');
    setCustomGoldPurity('');
    setGoldRate24k('');
    setGoldRate24kDisplay('');
    setGoldRate22k('');
    setGoldRate22kDisplay('');
    setMiscChargeType('amount');
    setMiscAmount('');
    setMiscAmountDisplay('');
    setMiscPercentage('');
    setTotalAmount(null);
    setGoldValue(null);
    setMiscValue(null);
    
    // Clear localStorage
    localStorage.removeItem('amountCalculator');
    
    onReset?.();
  };

  // Export handler functions
  const handleExportPng = async () => {
    if (!hasValidResults()) {
      setSnackbarMessage(t('noDataToExport'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsExportingPng(true);
    try {
      await exportAmountToPNG('amount-results-section');
      setSnackbarMessage(t('exportSuccess'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('PNG export error:', error);
      setSnackbarMessage(t('exportError'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleExportPdf = async () => {
    if (!hasValidResults()) {
      setSnackbarMessage(t('noDataToExport'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsExportingPdf(true);
    try {
      const actualGoldPurity = goldPurity === 'custom' ? Number(customGoldPurity) : Number(goldPurity);
      const pureGoldWeight = Number(goldWeight) * (actualGoldPurity / 100);
      
      const exportData: AmountExportData = {
        title: 'Amount Calculator Results',
        goldWeight: Number(goldWeight),
        goldPurity: actualGoldPurity,
        goldRate24k: Number(goldRate24k),
        miscChargeType: miscChargeType,
        miscAmount: miscChargeType === 'amount' ? Number(miscAmount) : undefined,
        miscPercentage: miscChargeType === 'percentage' ? Number(miscPercentage) : undefined,
        totalAmount: totalAmount || 0,
        goldValue: goldValue || 0,
        miscValue: miscValue || 0,
        pureGoldWeight: pureGoldWeight
      };

      await exportAmountToPDF(exportData);
      setSnackbarMessage(t('exportSuccess'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('PDF export error:', error);
      setSnackbarMessage(t('exportError'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const hasValidResults = () => {
    return goldWeight && goldPurity && 
      !(goldPurity === 'custom' && (!customGoldPurity || customGoldPurity === '')) &&
      goldRate24k && totalAmount !== null;
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Stack 
      direction={{ xs: 'column', lg: 'row' }} 
      spacing={4} 
      sx={{ width: '100%' }}
    >
      {/* Input Section */}
      <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '400px' } }}>
        <Typography variant="h5" gutterBottom sx={{ 
          color: '#9c7c38',
          transition: 'color 0.3s ease',
          mb: 3
        }}>
          {t('inputValues')}
        </Typography>
        <Box 
          sx={{ 
            mt: 2, 
            p: 3, 
            backgroundColor: 'rgba(248, 246, 236, 0.6)',
            borderRadius: 2,
            border: '1px solid rgba(212, 175, 55, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <Stack spacing={2.5}>
            {/* Gold Weight */}
            <TextField
              fullWidth
              label={t('goldWeight')}
              value={goldWeight}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setGoldWeight(value);
                }
              }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="decrease gold weight"
                      onClick={decrementGoldWeight}
                      edge="end"
                      size="small"
                      disabled={Number(goldWeight) <= 0}
                      sx={{ 
                        mr: 0.5,
                        color: '#9c7c38',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.1)'
                        }
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="increase gold weight"
                      onClick={incrementGoldWeight}
                      edge="end"
                      size="small"
                      sx={{ 
                        color: '#9c7c38',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.1)'
                        }
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*'
              }}
            />

            {/* Gold Purity */}
            <FormControl fullWidth size="small">
              <InputLabel id="gold-purity-select-label">{t('currentPurity')}</InputLabel>
              <Select
                labelId="gold-purity-select-label"
                id="gold-purity-select"
                value={goldPurity.toString()}
                label={t('currentPurity')}
                onChange={handlePuritySelect}
              >
                {commonPurities.map((option) => (
                  <MenuItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </MenuItem>
                ))}
                <MenuItem value="custom">{t('customPurity')}</MenuItem>
              </Select>
            </FormControl>
            
            {goldPurity === 'custom' && (
              <TextField
                fullWidth
                label={t('customValue')}
                value={customGoldPurity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                    // Allow only 2 decimal places
                    const parts = value.split('.');
                    if (parts.length === 1 || (parts.length === 2 && parts[1].length <= 2)) {
                      setCustomGoldPurity(value);
                    }
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="decrease custom gold purity"
                        onClick={decrementCustomGoldPurity}
                        edge="end"
                        size="small"
                        disabled={Number(customGoldPurity) <= 0}
                        sx={{ 
                          mr: 0.5,
                          color: '#9c7c38',
                          '&:hover': {
                            backgroundColor: 'rgba(156, 124, 56, 0.1)'
                          }
                        }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="increase custom gold purity"
                        onClick={incrementCustomGoldPurity}
                        edge="end"
                        size="small"
                        disabled={Number(customGoldPurity) >= 100}
                        sx={{ 
                          color: '#9c7c38',
                          '&:hover': {
                            backgroundColor: 'rgba(156, 124, 56, 0.1)'
                          }
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\\.?[0-9]*'
                }}
              />
            )}

            {/* 24K Gold Rate - Primary rate for calculation */}
            <TextField
              fullWidth
              label={t('enter24kGoldRate')}
              type="text"
              value={goldRate24kDisplay}
              onChange={(e) => handleGoldRate24kChange(e.target.value)}
              size="small"
              placeholder="0.00"
              InputProps={{
                inputProps: { 
                  inputMode: 'decimal',
                  pattern: '[0-9,]*\\.?[0-9]*'
                }
              }}
              sx={{ mb: 2 }}
            />

            {/* 22K Gold Rate - Auto-calculated from 24K rate */}
            <TextField
              fullWidth
              label={t('enter22kGoldRate')}
              type="text"
              value={goldRate22kDisplay}
              onChange={(e) => handleGoldRate22kChange(e.target.value)}
              size="small"
              placeholder="0.00"
              InputProps={{
                inputProps: { 
                  inputMode: 'decimal',
                  pattern: '[0-9,]*\\.?[0-9]*'
                }
              }}
              sx={{ mb: 2 }}
            />

            {/* Info about calculation method */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderRadius: 1, 
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <Typography variant="body2" sx={{ color: '#8E5924', fontStyle: 'italic' }}>
                {t('calculationNote')}
              </Typography>
            </Box>

            {/* Miscellaneous Charges */}
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', color: '#666' }}>
                {t('miscCharges')}
              </FormLabel>
              <RadioGroup
                row
                value={miscChargeType}
                onChange={(e) => setMiscChargeType(e.target.value as 'amount' | 'percentage')}
              >
                <FormControlLabel 
                  value="amount" 
                  control={<Radio size="small" />} 
                  label={t('fixedAmount')} 
                />
                <FormControlLabel 
                  value="percentage" 
                  control={<Radio size="small" />} 
                  label={t('percentage')} 
                />
              </RadioGroup>
            </FormControl>

            {miscChargeType === 'amount' && (
              <TextField
                fullWidth
                label={t('miscAmount')}
                type="text"
                value={miscAmountDisplay}
                onChange={(e) => handleMiscAmountChange(e.target.value)}
                size="small"
                placeholder="0.00"
                InputProps={{
                  inputProps: { 
                    inputMode: 'decimal',
                    pattern: '[0-9,]*\\.?[0-9]*'
                  }
                }}
              />
            )}

            {miscChargeType === 'percentage' && (
              <TextField
                fullWidth
                label={t('miscPercentage')}
                value={miscPercentage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) >= 0 && Number(value) <= 1000)) {
                    // Allow only 2 decimal places
                    const parts = value.split('.');
                    if (parts.length === 1 || (parts.length === 2 && parts[1].length <= 2)) {
                      setMiscPercentage(value);
                    }
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="decrease misc percentage"
                        onClick={decrementMiscPercentage}
                        edge="end"
                        size="small"
                        disabled={Number(miscPercentage) <= 0}
                        sx={{ 
                          mr: 0.5,
                          color: '#9c7c38',
                          '&:hover': {
                            backgroundColor: 'rgba(156, 124, 56, 0.1)'
                          }
                        }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="increase misc percentage"
                        onClick={incrementMiscPercentage}
                        edge="end"
                        size="small"
                        disabled={Number(miscPercentage) >= 1000}
                        sx={{ 
                          color: '#9c7c38',
                          '&:hover': {
                            backgroundColor: 'rgba(156, 124, 56, 0.1)'
                          }
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\\.?[0-9]*'
                }}
              />
            )}
          </Stack>
          
          {/* Reset Button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleReset}
              sx={{
                color: '#D4AF37',
                borderColor: '#D4AF37',
                '&:hover': {
                  borderColor: '#B8941F',
                  backgroundColor: 'rgba(212, 175, 55, 0.04)',
                },
                fontWeight: 'medium',
                px: 3,
                py: 1,
                fontSize: '0.875rem',
              }}
            >
              {t('reset')}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Results Section */}
      <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '400px' } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h5" sx={{ 
            color: '#8E5924',
            transition: 'color 0.3s ease'
          }}>
            {t('results')}
          </Typography>
          
          {hasValidResults() && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('amountExportToPng')}>
                <span>
                  <IconButton
                    onClick={handleExportPng}
                    disabled={isExportingPng}
                    size="small"
                    sx={{
                      color: '#4CAF50',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      },
                      '&:disabled': {
                        color: '#ccc',
                      },
                    }}
                  >
                    {isExportingPng ? <CircularProgress size={20} /> : <ImageIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title={t('amountExportToPdf')}>
                <span>
                  <IconButton
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    size="small"
                    sx={{
                      color: '#f44336',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      },
                      '&:disabled': {
                        color: '#ccc',
                      },
                    }}
                  >
                    {isExportingPdf ? <CircularProgress size={20} /> : <PdfIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>
        
        <Box id="amount-results-section" sx={{ 
          mt: 2, 
          p: 4, 
          bgcolor: 'rgba(248, 246, 240, 0.8)',
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(200, 117, 51, 0.3)',
          transition: 'all 0.3s ease',
          minHeight: '300px'
        }}>
          {(goldWeight && goldPurity && 
            !(goldPurity === 'custom' && (!customGoldPurity || customGoldPurity === '')) &&
            goldRate24k
          ) ? (
            <>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(212, 175, 55, 0.15)',
                borderRadius: 1, 
                borderLeft: '4px solid #D4AF37',
                transition: 'all 0.3s ease'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ color: 'primary.main', mb: 2 }}
                  dangerouslySetInnerHTML={{ 
                    __html: t('totalAmountResult', { 
                      amount: totalAmount ? formatIndianNumber(totalAmount) : '0.00'
                    })
                  }}
                />
                
                {/* Amount in Words */}
                {totalAmount && totalAmount > 0 && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                    borderRadius: 1,
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic', 
                        color: '#2E7D32',
                        fontWeight: 'medium',
                        lineHeight: 1.4
                      }}
                    >
                      <strong>{t('amountInWords')}:</strong><br />
                      {i18n.language === 'ta' ? 
                        numberToWordsTamil(totalAmount) : 
                        numberToWords(totalAmount)
                      }
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Breakdown Section */}
              <Box sx={{ mt: 3, pt: 2, pb: 1, borderTop: '1px solid #eaeaea' }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1.5 }}>
                  {t('breakdown')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 1 }}>
                  <Typography 
                    variant="body1"
                    dangerouslySetInnerHTML={{ 
                      __html: t('goldValue', { 
                        value: goldValue ? formatIndianNumber(goldValue) : '0.00'
                      })
                    }}
                  />
                  <Typography 
                    variant="body1"
                    dangerouslySetInnerHTML={{ 
                      __html: t('miscChargesValue', { 
                        value: miscValue ? formatIndianNumber(miscValue) : '0.00'
                      })
                    }}
                  />
                  <Typography variant="body1" color="textSecondary">
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('goldWeight', { 
                        weight: Number(goldWeight).toFixed(3) || '0.000'
                      })
                    }} />
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('goldPurityUsed', { 
                        purity: (goldPurity === 'custom' ? 
                          Number(customGoldPurity).toFixed(2) : 
                          Number(goldPurity).toFixed(2)) || '0.00'
                      })
                    }} />
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('rateUsed', { 
                        type: '24k',
                        rate: goldRate24k ? formatIndianNumber(Number(goldRate24k)) : '0.00'
                      })
                    }} />
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('pureGoldWeightUsed', { 
                        weight: (goldWeight && goldPurity !== 'custom' ? 
                          (Number(goldWeight) * Number(goldPurity) / 100).toFixed(3) : 
                          goldWeight && customGoldPurity ? 
                          (Number(goldWeight) * Number(customGoldPurity) / 100).toFixed(3) : '0.000')
                      })
                    }} />
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mt: 8 }}>
              {t('enterAllValues')}
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Snackbar for export notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default AmountCalculator;
