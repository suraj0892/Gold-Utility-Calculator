import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Box,
  Stack,
  Button,
  FormControl,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatIndianNumber, numberToWords, numberToWordsTamil } from '../utils/numberUtils';

interface InterestCalculatorProps {
  onReset?: () => void;
}

const InterestCalculator: React.FC<InterestCalculatorProps> = ({ onReset }) => {
  const { t, i18n } = useTranslation();

  // State for inputs
  const [amount, setAmount] = useState<number | string>('');
  const [amountDisplay, setAmountDisplay] = useState<string>(''); // For formatted display
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs()); // Current date as default
  const [interestRate, setInterestRate] = useState<number | string>('');
  const [interestPeriod, setInterestPeriod] = useState<'monthly' | 'yearly'>('yearly');

  // State for results
  const [principalAmount, setPrincipalAmount] = useState<number | null>(null);
  const [interestAmount, setInterestAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<{ years: number; months: number; days: number } | null>(null);

  // Set current date as default end date (removed since we're setting it in state declaration)
  // useEffect(() => {
  //   const today = new Date();
  //   const formattedDate = today.toISOString().split('T')[0];
  //   setEndDate(formattedDate);
  // }, []);

  // Handle amount input with Indian formatting
  const handleAmountChange = (value: string) => {
    // Remove existing commas and non-numeric characters except decimal point
    const cleanValue = value.replace(/,/g, '').replace(/[^\d.]/g, '');
    
    if (cleanValue === '' || !isNaN(Number(cleanValue))) {
      setAmount(cleanValue);
      
      // Format for display
      if (cleanValue && !cleanValue.endsWith('.')) {
        const numValue = parseFloat(cleanValue);
        if (!isNaN(numValue)) {
          setAmountDisplay(formatIndianNumber(numValue));
        } else {
          setAmountDisplay(cleanValue);
        }
      } else {
        setAmountDisplay(cleanValue);
      }
    }
  };

  // Calculate time difference
  const calculateTimeDifference = (start: Dayjs | null, end: Dayjs | null) => {
    if (!start || !end) return null;
    
    const startDate = start.toDate();
    const endDate = end.toDate();
    
    if (endDate < startDate) {
      return null;
    }
    
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    
    if (days < 0) {
      months--;
      const daysInPreviousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
      days += daysInPreviousMonth;
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months, days };
  };

  // Calculate simple interest
  const calculateInterest = () => {
    if (!amount || !startDate || !endDate || !interestRate) {
      setPrincipalAmount(null);
      setInterestAmount(null);
      setTotalAmount(null);
      setTimePeriod(null);
      return;
    }

    const principal = Number(amount);
    const rate = Number(interestRate);
    
    const timeDiff = calculateTimeDifference(startDate, endDate);
    if (!timeDiff) {
      setPrincipalAmount(null);
      setInterestAmount(null);
      setTotalAmount(null);
      setTimePeriod(null);
      return;
    }

    setTimePeriod(timeDiff);
    setPrincipalAmount(principal);

    // Convert time to the selected period
    let timeInSelectedPeriod: number;
    if (interestPeriod === 'yearly') {
      timeInSelectedPeriod = timeDiff.years + (timeDiff.months / 12) + (timeDiff.days / 365);
    } else {
      timeInSelectedPeriod = (timeDiff.years * 12) + timeDiff.months + (timeDiff.days / 30);
    }

    // Simple Interest Formula: SI = (P * R * T) / 100
    const interest = (principal * rate * timeInSelectedPeriod) / 100;
    const total = principal + interest;

    setInterestAmount(interest);
    setTotalAmount(total);
  };

  // Calculate interest when inputs change
  useEffect(() => {
    calculateInterest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, startDate, endDate, interestRate, interestPeriod]);

  const handleReset = () => {
    setAmount('');
    setAmountDisplay('');
    setStartDate(null);
    setEndDate(dayjs());
    setInterestRate('');
    setInterestPeriod('yearly');
    setPrincipalAmount(null);
    setInterestAmount(null);
    setTotalAmount(null);
    setTimePeriod(null);
    onReset?.();
  };

  const isValidDateRange = startDate && endDate && endDate.isAfter(startDate, 'day') || endDate?.isSame(startDate, 'day');

  return (
    <Stack 
      direction={{ xs: 'column', lg: 'row' }} 
      spacing={{ xs: 2, lg: 4 }}
      sx={{ width: '100%' }}
    >
      {/* Input Section */}
      <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '400px' } }}>
        <Typography variant="h5" gutterBottom sx={{ 
          color: '#9c7c38',
          transition: 'color 0.3s ease',
          mb: { xs: 2, lg: 3 }
        }}>
          {t('inputValues')}
        </Typography>
        <Box 
          sx={{ 
            mt: { xs: 1, lg: 2 }, 
            p: { xs: 2, lg: 3 }, 
            backgroundColor: 'rgba(248, 246, 236, 0.6)',
            borderRadius: 2,
            border: '1px solid rgba(212, 175, 55, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <Stack spacing={{ xs: 2, lg: 2.5 }}>
            {/* Principal Amount */}
            <TextField
              fullWidth
              label={t('principalAmount')}
              value={amountDisplay}
              onChange={(e) => handleAmountChange(e.target.value)}
              size="small"
              inputProps={{
                inputMode: 'decimal',
                pattern: '[0-9,]*\\.?[0-9]*'
              }}
              placeholder="0.00"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                }
              }}
            />

            {/* Date Selection Section */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 }
              }}>
                {/* Start Date */}
                <DatePicker
                  label={t('startDate')}
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                    // If end date is before new start date, update end date
                    if (endDate && newValue && endDate.isBefore(newValue, 'day')) {
                      setEndDate(newValue);
                    }
                  }}
                  format="DD MMM YYYY"
                  maxDate={endDate || undefined}
                  disableFuture
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      inputProps: {
                        readOnly: true,
                        style: { cursor: 'pointer' }
                      },
                      sx: {
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                          cursor: 'pointer',
                        },
                        '& .MuiInputBase-root': {
                          cursor: 'pointer',
                        }
                      }
                    }
                  }}
                />

                {/* End Date */}
                <DatePicker
                  label={t('endDate')}
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                    // If start date is after new end date, update start date
                    if (startDate && newValue && startDate.isAfter(newValue, 'day')) {
                      setStartDate(newValue);
                    }
                  }}
                  format="DD MMM YYYY"
                  minDate={startDate || undefined}
                  disableFuture
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      inputProps: {
                        readOnly: true,
                        style: { cursor: 'pointer' }
                      },
                      sx: {
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                          cursor: 'pointer',
                        },
                        '& .MuiInputBase-root': {
                          cursor: 'pointer',
                        }
                      }
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>

            {/* Date validation alert */}
            {startDate && endDate && endDate.isBefore(startDate, 'day') && (
              <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
                {t('endDateMustBeGreater')}
              </Alert>
            )}

            {/* Interest Rate Period Selection */}
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ 
                fontSize: { xs: '14px', sm: '0.875rem' }, 
                color: '#666', 
                mb: 1 
              }}>
                {t('interestRatePeriod')}
              </FormLabel>
              <RadioGroup
                row
                value={interestPeriod}
                onChange={(e) => setInterestPeriod(e.target.value as 'monthly' | 'yearly')}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '14px', sm: '0.875rem' }
                  }
                }}
              >
                <FormControlLabel 
                  value="yearly" 
                  control={<Radio size="small" />} 
                  label={t('perYear')} 
                />
                <FormControlLabel 
                  value="monthly" 
                  control={<Radio size="small" />} 
                  label={t('perMonth')} 
                />
              </RadioGroup>
            </FormControl>

            {/* Interest Rate */}
            <TextField
              fullWidth
              label={t('interestRate') + ` (${interestPeriod === 'yearly' ? t('perYear') : t('perMonth')})`}
              value={interestRate}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
                  // Allow only 2 decimal places
                  const parts = value.split('.');
                  if (parts.length === 1 || (parts.length === 2 && parts[1].length <= 2)) {
                    setInterestRate(value);
                  }
                }
              }}
              size="small"
              inputProps={{
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*'
              }}
              placeholder="0.00"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                }
              }}
            />
          </Stack>
          
          {/* Reset Button */}
          <Box sx={{ 
            mt: { xs: 3, lg: 4 }, 
            display: 'flex', 
            justifyContent: 'flex-end' 
          }}>
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
                px: { xs: 2, sm: 3 },
                py: 1,
                fontSize: { xs: '14px', sm: '0.875rem' },
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
          mb: { xs: 2, lg: 3 }
        }}>
          {t('results')}
        </Typography>
        <Box sx={{ 
          mt: { xs: 1, lg: 2 }, 
          p: { xs: 2, lg: 4 }, 
          bgcolor: 'rgba(248, 246, 240, 0.8)',
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(200, 117, 51, 0.3)',
          transition: 'all 0.3s ease',
          minHeight: { xs: '250px', lg: '300px' }
        }}>
          {(amount && startDate && endDate && interestRate && isValidDateRange) ? (
            <Stack spacing={{ xs: 2, lg: 3 }}>
              {/* Time Period */}
              {timePeriod && (
                <Box sx={{ 
                  p: { xs: 1.5, lg: 2 }, 
                  bgcolor: 'rgba(33, 150, 243, 0.1)', 
                  borderRadius: 1, 
                  borderLeft: '4px solid #2196F3'
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#1976D2', 
                    mb: 1,
                    fontSize: { xs: '1rem', lg: '1.25rem' }
                  }}>
                    {t('timePeriod')}
                  </Typography>
                  <Typography variant="body1" sx={{
                    fontSize: { xs: '0.875rem', lg: '1rem' }
                  }}>
                    {timePeriod.years > 0 && `${timePeriod.years} ${t('years')} `}
                    {timePeriod.months > 0 && `${timePeriod.months} ${t('months')} `}
                    {timePeriod.days > 0 && `${timePeriod.days} ${t('days')}`}
                  </Typography>
                </Box>
              )}

              {/* Principal Amount */}
              <Box sx={{ 
                p: { xs: 1.5, lg: 2 }, 
                bgcolor: 'rgba(76, 175, 80, 0.1)', 
                borderRadius: 1, 
                borderLeft: '4px solid #4CAF50'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#388E3C', 
                  mb: 1,
                  fontSize: { xs: '1rem', lg: '1.25rem' }
                }}>
                  {t('principalAmount')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontWeight: 'medium',
                  fontSize: { xs: '0.875rem', lg: '1rem' }
                }}>
                  ₹ {principalAmount ? formatIndianNumber(principalAmount) : '0.00'}
                </Typography>
                {principalAmount && (
                  <Typography variant="body2" sx={{ 
                    color: '#666', 
                    mt: 1, 
                    fontStyle: 'italic',
                    fontSize: { xs: '0.75rem', lg: '0.875rem' }
                  }}>
                    {i18n.language === 'ta' ? 
                      numberToWordsTamil(principalAmount) : 
                      numberToWords(principalAmount)
                    }
                  </Typography>
                )}
              </Box>

              {/* Interest Amount */}
              <Box sx={{ 
                p: { xs: 1.5, lg: 2 }, 
                bgcolor: 'rgba(255, 152, 0, 0.1)', 
                borderRadius: 1, 
                borderLeft: '4px solid #FF9800'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#F57C00', 
                  mb: 1,
                  fontSize: { xs: '1rem', lg: '1.25rem' }
                }}>
                  {t('interestAmount')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontWeight: 'medium',
                  fontSize: { xs: '0.875rem', lg: '1rem' }
                }}>
                  ₹ {interestAmount ? formatIndianNumber(interestAmount) : '0.00'}
                </Typography>
                {interestAmount && (
                  <Typography variant="body2" sx={{ 
                    color: '#666', 
                    mt: 1, 
                    fontStyle: 'italic',
                    fontSize: { xs: '0.75rem', lg: '0.875rem' }
                  }}>
                    {i18n.language === 'ta' ? 
                      numberToWordsTamil(interestAmount) : 
                      numberToWords(interestAmount)
                    }
                  </Typography>
                )}
              </Box>

              {/* Total Amount */}
              <Box sx={{ 
                p: { xs: 1.5, lg: 2 }, 
                bgcolor: 'rgba(212, 175, 55, 0.15)',
                borderRadius: 1, 
                borderLeft: '4px solid #D4AF37'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#B8941F', 
                  mb: 1,
                  fontSize: { xs: '1rem', lg: '1.25rem' }
                }}>
                  {t('totalAmount')}
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold', 
                  color: '#9c7c38',
                  fontSize: { xs: '1.25rem', lg: '1.5rem' }
                }}>
                  ₹ {totalAmount ? formatIndianNumber(totalAmount) : '0.00'}
                </Typography>
                {totalAmount && (
                  <Typography variant="body2" sx={{ 
                    color: '#666', 
                    mt: 1, 
                    fontStyle: 'italic',
                    fontSize: { xs: '0.75rem', lg: '0.875rem' }
                  }}>
                    {i18n.language === 'ta' ? 
                      numberToWordsTamil(totalAmount) : 
                      numberToWords(totalAmount)
                    }
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{ 
              textAlign: 'center', 
              mt: { xs: 6, lg: 8 },
              fontSize: { xs: '0.875rem', lg: '1rem' }
            }}>
              {t('enterAllValues')}
            </Typography>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default InterestCalculator;
