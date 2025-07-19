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
  FormLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatIndianNumber, numberToWords, numberToWordsTamil } from '../utils/numberUtils';

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
      
      // Calculate and update 22K rate (22K purity is 91.6%)
      const rate22k = Number(cleanValue) * (91.6 / 100);
      const formattedRate22k = formatIndianNumber(rate22k);
      setGoldRate22k(rate22k.toFixed(2));
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
      
      // Calculate and update 24K rate (22K purity is 91.6%)
      const rate24k = Number(cleanValue) / (91.6 / 100);
      const formattedRate24k = formatIndianNumber(rate24k);
      setGoldRate24k(rate24k.toFixed(2));
      setGoldRate24kDisplay(formattedRate24k);
    } else {
      setGoldRate22kDisplay(cleanValue);
      // Clear 24K rate if 22K is invalid
      setGoldRate24k('');
      setGoldRate24kDisplay('');
    }
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
    setMiscChargeType('amount');
    setMiscAmount('');
    setMiscAmountDisplay('');
    setMiscPercentage('');
    setTotalAmount(null);
    setGoldValue(null);
    setMiscValue(null);
    onReset?.();
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
              onChange={(e) => setGoldWeight(e.target.value)}
              size="small"
              inputProps={{
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*'
              }}
            />

            {/* Gold Purity */}
            <FormControl fullWidth size="small">
              <InputLabel id="gold-purity-select-label">{t('selectGoldPurity')}</InputLabel>
              <Select
                labelId="gold-purity-select-label"
                id="gold-purity-select"
                value={goldPurity.toString()}
                label={t('selectGoldPurity')}
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
        <Typography variant="h5" gutterBottom sx={{ 
          color: '#8E5924',
          transition: 'color 0.3s ease',
          mb: 3
        }}>
          {t('results')}
        </Typography>
        <Box sx={{ 
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
    </Stack>
  );
};

export default AmountCalculator;
