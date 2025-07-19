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

interface AmountCalculatorProps {
  onReset?: () => void;
}

const AmountCalculator: React.FC<AmountCalculatorProps> = ({ onReset }) => {
  const { t } = useTranslation();

  // State for inputs
  const [goldWeight, setGoldWeight] = useState<number | string>('');
  const [goldPurity, setGoldPurity] = useState<number | string | 'custom'>('');
  const [customGoldPurity, setCustomGoldPurity] = useState<number | string>('');
  const [goldRate22k, setGoldRate22k] = useState<number | string>('');
  const [goldRate24k, setGoldRate24k] = useState<number | string>('');
  const [rateType, setRateType] = useState<'22k' | '24k'>('22k');
  const [miscChargeType, setMiscChargeType] = useState<'amount' | 'percentage'>('amount');
  const [miscAmount, setMiscAmount] = useState<number | string>('');
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
    let baseRate: number;
    
    if (rateType === '22k') {
      baseRate = rate22kVal;
    } else {
      baseRate = rate24kVal;
    }

    // Calculate the effective rate based on purity
    // If using 22k rate: effectiveRate = baseRate * (purity / 91.6)
    // If using 24k rate: effectiveRate = baseRate * (purity / 100)
    let effectiveRate: number;
    if (rateType === '22k') {
      effectiveRate = baseRate * (goldPurityVal / 91.6);
    } else {
      effectiveRate = baseRate * (goldPurityVal / 100);
    }

    const goldValueCalc = goldWeightVal * effectiveRate;

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

  // Effect to calculate when inputs change
  useEffect(() => {
    if (goldWeight && goldPurity && 
        !(goldPurity === 'custom' && (!customGoldPurity || customGoldPurity === '')) &&
        ((rateType === '22k' && goldRate22k) || (rateType === '24k' && goldRate24k))) {
      
      const actualGoldPurity = goldPurity === 'custom' ? 
        Number(customGoldPurity) : Number(goldPurity);
      
      const miscAmountVal = miscChargeType === 'amount' ? 
        (miscAmount ? Number(miscAmount) : 0) : 0;
      const miscPercentageVal = miscChargeType === 'percentage' ? 
        (miscPercentage ? Number(miscPercentage) : 0) : 0;

      calculateAmountResults(
        Number(goldWeight),
        actualGoldPurity,
        goldRate22k ? Number(goldRate22k) : 0,
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
  }, [goldWeight, goldPurity, customGoldPurity, goldRate22k, goldRate24k, rateType, miscChargeType, miscAmount, miscPercentage]);

  const handleReset = () => {
    setGoldWeight('');
    setGoldPurity('');
    setCustomGoldPurity('');
    setGoldRate22k('');
    setGoldRate24k('');
    setRateType('22k');
    setMiscChargeType('amount');
    setMiscAmount('');
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
              type="number"
              value={goldWeight}
              onChange={(e) => setGoldWeight(e.target.value)}
              size="small"
              InputProps={{
                inputProps: { min: 0, step: 0.001 }
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
                type="number"
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
                  inputProps: { min: 0, max: 100, step: 0.01 }
                }}
              />
            )}

            {/* Gold Rates */}
            <TextField
              fullWidth
              label={t('enter22kGoldRate')}
              type="number"
              value={goldRate22k}
              onChange={(e) => setGoldRate22k(e.target.value)}
              size="small"
              InputProps={{
                inputProps: { min: 0, step: 0.01 }
              }}
            />

            <TextField
              fullWidth
              label={t('enter24kGoldRate')}
              type="number"
              value={goldRate24k}
              onChange={(e) => setGoldRate24k(e.target.value)}
              size="small"
              InputProps={{
                inputProps: { min: 0, step: 0.01 }
              }}
            />

            {/* Rate Type Selection */}
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', color: '#666' }}>
                {t('selectRateType')}
              </FormLabel>
              <RadioGroup
                row
                value={rateType}
                onChange={(e) => setRateType(e.target.value as '22k' | '24k')}
              >
                <FormControlLabel 
                  value="22k" 
                  control={<Radio size="small" />} 
                  label={
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('use22kRate', { type: '22k' }) 
                    }} />
                  }
                />
                <FormControlLabel 
                  value="24k" 
                  control={<Radio size="small" />} 
                  label={
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('use24kRate', { type: '24k' }) 
                    }} />
                  }
                />
              </RadioGroup>
            </FormControl>

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
                type="number"
                value={miscAmount}
                onChange={(e) => setMiscAmount(e.target.value)}
                size="small"
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            )}

            {miscChargeType === 'percentage' && (
              <TextField
                fullWidth
                label={t('miscPercentage')}
                type="number"
                value={miscPercentage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                    // Allow only 2 decimal places
                    const parts = value.split('.');
                    if (parts.length === 1 || (parts.length === 2 && parts[1].length <= 2)) {
                      setMiscPercentage(value);
                    }
                  }
                }}
                size="small"
                InputProps={{
                  inputProps: { min: 0, max: 100, step: 0.01 }
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
            ((rateType === '22k' && goldRate22k) || (rateType === '24k' && goldRate24k))
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
                      amount: totalAmount?.toFixed(2) || '0.00'
                    })
                  }}
                />
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
                        value: goldValue?.toFixed(2) || '0.00'
                      })
                    }}
                  />
                  <Typography 
                    variant="body1"
                    dangerouslySetInnerHTML={{ 
                      __html: t('miscChargesValue', { 
                        value: miscValue?.toFixed(2) || '0.00'
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
                        type: rateType,
                        rate: (rateType === '22k' ? 
                          Number(goldRate22k).toFixed(2) : 
                          Number(goldRate24k).toFixed(2)) || '0.00'
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
