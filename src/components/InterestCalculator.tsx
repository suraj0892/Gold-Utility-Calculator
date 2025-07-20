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
  FormLabel,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  Add,
  Remove,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatIndianNumber, numberToWords, numberToWordsTamil } from '../utils/numberUtils';
import { exportToPNG, exportToPDF, ExportData } from '../utils/exportUtils';
import { getCalculatorData, setCalculatorData, removeCalculatorData } from '../utils/storageUtils';

interface InterestCalculatorProps {
  onReset?: () => void;
}

interface MonthlyBreakdown {
  month: string;
  monthNumber: number;
  year: number;
  daysInMonth: number;
  monthlyInterest: number;
  cumulativeInterest: number;
  totalAmount: number;
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
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [useRounding, setUseRounding] = useState<boolean>(false);

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');
  const [showExportSnackbar, setShowExportSnackbar] = useState<boolean>(false);

  // Helper function to convert between monthly and yearly rates
  const convertInterestRate = (rate: number, fromPeriod: 'monthly' | 'yearly', toPeriod: 'monthly' | 'yearly') => {
    if (fromPeriod === toPeriod) return rate;
    
    if (fromPeriod === 'monthly' && toPeriod === 'yearly') {
      return rate * 12; // Monthly to yearly (simple conversion)
    } else {
      return rate / 12; // Yearly to monthly (simple conversion)
    }
  };

  // Handle interest period change with rate conversion
  const handleInterestPeriodChange = (newPeriod: 'monthly' | 'yearly') => {
    const currentRate = Number(interestRate);
    
    if (currentRate && !isNaN(currentRate)) {
      const convertedRate = convertInterestRate(currentRate, interestPeriod, newPeriod);
      setInterestRate(convertedRate.toFixed(2));
    }
    
    setInterestPeriod(newPeriod);
  };

  // State for results
  const [principalAmount, setPrincipalAmount] = useState<number | null>(null);
  const [interestAmount, setInterestAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<{ years: number; months: number; days: number } | null>(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>([]);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Load values from sessionStorage on component mount
  useEffect(() => {
    const savedData = getCalculatorData('interestCalculator');
    console.log('Loading from sessionStorage (Interest):', savedData); // Debug log
    if (savedData) {
      try {
        console.log('Parsed data (Interest):', savedData); // Debug log
        
        // Only set values if they exist and are not empty
        if (savedData.amount !== undefined && savedData.amount !== '') {
          setAmount(savedData.amount);
        }
        if (savedData.amountDisplay !== undefined && savedData.amountDisplay !== '') {
          setAmountDisplay(savedData.amountDisplay);
        }
        if (savedData.startDate !== undefined && savedData.startDate !== null) {
          const startDateObj = dayjs(savedData.startDate);
          if (startDateObj.isValid()) {
            setStartDate(startDateObj);
          }
        }
        if (savedData.endDate !== undefined && savedData.endDate !== null) {
          const endDateObj = dayjs(savedData.endDate);
          if (endDateObj.isValid()) {
            setEndDate(endDateObj);
          }
        }
        if (savedData.interestRate !== undefined && savedData.interestRate !== '') {
          setInterestRate(savedData.interestRate);
        }
        if (savedData.interestPeriod !== undefined && savedData.interestPeriod !== '') {
          setInterestPeriod(savedData.interestPeriod);
        }
        if (savedData.interestType !== undefined && savedData.interestType !== '') {
          setInterestType(savedData.interestType);
        }
        if (savedData.useRounding !== undefined) {
          setUseRounding(savedData.useRounding);
        }
        
        // Load results if they exist
        if (savedData.principalAmount !== undefined && savedData.principalAmount !== null) {
          setPrincipalAmount(savedData.principalAmount);
        }
        if (savedData.interestAmount !== undefined && savedData.interestAmount !== null) {
          setInterestAmount(savedData.interestAmount);
        }
        if (savedData.totalAmount !== undefined && savedData.totalAmount !== null) {
          setTotalAmount(savedData.totalAmount);
        }
        if (savedData.timePeriod !== undefined && savedData.timePeriod !== null) {
          setTimePeriod(savedData.timePeriod);
        }
        if (savedData.monthlyBreakdown !== undefined && Array.isArray(savedData.monthlyBreakdown)) {
          setMonthlyBreakdown(savedData.monthlyBreakdown);
        }
        if (savedData.showBreakdown !== undefined) {
          setShowBreakdown(savedData.showBreakdown);
        }
      } catch (error) {
        console.error('Error loading saved data (Interest):', error);
      }
    }
  }, []);

  // Save values to sessionStorage whenever they change
  const saveToSessionStorage = () => {
    try {
      // Helper function to safely convert date to ISO string
      const safeDateToISO = (date: Dayjs | null): string | null => {
        try {
          return date && date.isValid() && !isNaN(date.valueOf()) ? date.toISOString() : null;
        } catch (error) {
          console.warn('Error converting date to ISO:', error);
          return null;
        }
      };

      const dataToSave = {
        amount,
        amountDisplay,
        startDate: safeDateToISO(startDate),
        endDate: safeDateToISO(endDate),
        interestRate,
        interestPeriod,
        interestType,
        useRounding,
        // Include results
        principalAmount,
        interestAmount,
        totalAmount,
        timePeriod,
        monthlyBreakdown,
        showBreakdown
      };
      console.log('Saving to sessionStorage (Interest):', dataToSave); // Debug log
      setCalculatorData('interestCalculator', dataToSave);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  };

  // Save to sessionStorage whenever any input or result changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToSessionStorage();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [amount, amountDisplay, startDate, endDate, interestRate, interestPeriod, interestType, useRounding,
      principalAmount, interestAmount, totalAmount, timePeriod, monthlyBreakdown, showBreakdown]);

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

  // Helper functions for increment/decrement
  const incrementInterestRate = () => {
    const current = Number(interestRate) || 0;
    const newValue = Math.min(current + 0.1, 100);
    setInterestRate(newValue.toFixed(1));
  };

  const decrementInterestRate = () => {
    const current = Number(interestRate) || 0;
    const newValue = Math.max(current - 0.1, 0);
    setInterestRate(newValue.toFixed(1));
  };

  // Calculate time difference with optional rounding logic
  const calculateTimeDifference = (start: Dayjs | null, end: Dayjs | null, applyRounding: boolean = false) => {
    if (!start || !end) return null;
    
    if (end.isBefore(start)) {
      return null;
    }
    
    // Add 1 day to end date to include both start and end dates in calculation
    const adjustedEnd = end.add(1, 'day');
    
    // Use dayjs for more accurate date calculations
    let years = 0;
    let months = 0;
    let days = 0;
    
    // Calculate years
    let current = start.clone();
    while (current.add(1, 'year').isBefore(adjustedEnd) || current.add(1, 'year').isSame(adjustedEnd, 'day')) {
      years++;
      current = current.add(1, 'year');
    }
    
    // Calculate months
    while (current.add(1, 'month').isBefore(adjustedEnd) || current.add(1, 'month').isSame(adjustedEnd, 'day')) {
      months++;
      current = current.add(1, 'month');
    }
    
    // Calculate remaining days
    days = adjustedEnd.diff(current, 'day');
    
    // Apply rounding logic only if requested
    if (applyRounding && days >= 15) {
      months += 1;
      days = 0;
    }
    
    return { years, months, days };
  };

  // Calculate monthly breakdown for both simple and compound interest
  const calculateMonthlyBreakdown = (
    principal: number,
    rate: number,
    start: Dayjs,
    end: Dayjs,
    period: 'monthly' | 'yearly',
    type: 'simple' | 'compound',
    applyRounding: boolean = false
  ): MonthlyBreakdown[] => {
    // Validate inputs
    if (!isValidDate(start) || !isValidDate(end) || !principal || !rate || principal <= 0 || rate < 0) {
      return [];
    }

    try {
      const breakdown: MonthlyBreakdown[] = [];
      let current = start.clone();
      let cumulativeInterest = 0;
      let currentPrincipal = principal;
    
    while (current.isBefore(end, 'month') || current.isSame(end, 'month')) {
      const monthStart = current.startOf('month');
      const monthEnd = current.endOf('month');
      
      // Determine the actual start and end dates for this month
      const actualStart = current.isSame(start, 'month') ? start : monthStart;
      const actualEnd = current.isSame(end, 'month') ? end : monthEnd;
      
      // Calculate days in this month for the interest period
      let daysInMonth = actualEnd.diff(actualStart, 'day') + 1;
      
      // Apply rounding logic if enabled
      let timeMultiplier: number;
      if (applyRounding) {
        if (daysInMonth >= 15) {
          daysInMonth = current.daysInMonth(); // Consider full month
        } else if (daysInMonth > 0) {
          daysInMonth = current.daysInMonth() / 2; // Consider half month
        }
      }
      
      // Calculate time multiplier and effective rate for monthly calculation
      const totalDaysInMonth = current.daysInMonth();
      timeMultiplier = daysInMonth / totalDaysInMonth;
      
      // Convert rate to monthly equivalent if needed
      const effectiveRate = period === 'yearly' ? rate / 12 : rate;
      
      let monthlyInterest: number;
      if (type === 'simple') {
        // Simple interest: always calculated on original principal
        monthlyInterest = (principal * effectiveRate * timeMultiplier) / 100;
      } else {
        // Compound interest: calculated on current principal (principal + accumulated interest)
        monthlyInterest = (currentPrincipal * effectiveRate * timeMultiplier) / 100;
        currentPrincipal += monthlyInterest; // Add interest to principal for next calculation
      }
      
      cumulativeInterest += monthlyInterest;
      
      breakdown.push({
        month: current.format('MMM'),
        monthNumber: current.month() + 1,
        year: current.year(),
        daysInMonth: Math.round(daysInMonth),
        monthlyInterest,
        cumulativeInterest,
        totalAmount: principal + cumulativeInterest
      });
      
      current = current.add(1, 'month');
    }
    
    return breakdown;
    } catch (error) {
      console.error('Error calculating monthly breakdown:', error);
      return [];
    }
  };

  // Helper function to check if a date is valid and complete
  const isValidDate = (date: Dayjs | null): boolean => {
    if (!date) return false;
    try {
      // Check if date is valid, not NaN, and has a reasonable year (not just partial input)
      return date.isValid() && 
             !isNaN(date.valueOf()) && 
             date.year() > 1900 && 
             date.year() < 2100 &&
             date.month() >= 0 && 
             date.month() <= 11 &&
             date.date() >= 1 && 
             date.date() <= 31;
    } catch (error) {
      return false;
    }
  };

  const isValidDateRange = isValidDate(startDate) && isValidDate(endDate) && 
    startDate && endDate && (endDate.isAfter(startDate, 'day') || endDate.isSame(startDate, 'day'));

  // Calculate interest (simple or compound)
  const calculateInterest = () => {
    // Enhanced validation with proper date checking
    if (!amount || !isValidDate(startDate) || !isValidDate(endDate) || !interestRate || !isValidDateRange) {
      setPrincipalAmount(null);
      setInterestAmount(null);
      setTotalAmount(null);
      setTimePeriod(null);
      setMonthlyBreakdown([]);
      return;
    }

    try {
      const principal = Number(amount);
      const rate = Number(interestRate);
    
    const timeDiff = calculateTimeDifference(startDate, endDate, useRounding);
    if (!timeDiff) {
      setPrincipalAmount(null);
      setInterestAmount(null);
      setTotalAmount(null);
      setTimePeriod(null);
      setMonthlyBreakdown([]);
      return;
    }

    setTimePeriod(timeDiff);
    setPrincipalAmount(principal);

    // Convert time to the selected period with optional rounding logic
    let timeInSelectedPeriod: number;
    if (interestPeriod === 'yearly') {
      if (useRounding) {
        // Apply rounding logic: days < 15 = 0.5 month, days >= 15 already rounded up to full month
        const adjustedDays = timeDiff.days > 0 && timeDiff.days < 15 ? 0.5 : 0;
        timeInSelectedPeriod = timeDiff.years + ((timeDiff.months + adjustedDays) / 12);
      } else {
        // Use exact calculation without rounding
        timeInSelectedPeriod = timeDiff.years + (timeDiff.months / 12) + (timeDiff.days / 365);
      }
    } else {
      if (useRounding) {
        // For monthly period with rounding
        const adjustedDays = timeDiff.days > 0 && timeDiff.days < 15 ? 0.5 : 0;
        timeInSelectedPeriod = (timeDiff.years * 12) + timeDiff.months + adjustedDays;
      } else {
        // Use exact calculation without rounding
        timeInSelectedPeriod = (timeDiff.years * 12) + timeDiff.months + (timeDiff.days / 30);
      }
    }

    let interest: number;
    let total: number;

    if (interestType === 'simple') {
      // Simple Interest Formula: SI = (P * R * T) / 100
      interest = (principal * rate * timeInSelectedPeriod) / 100;
      total = principal + interest;
    } else {
      // Compound Interest Formula: CI = P * (1 + R/100)^T - P
      const compoundFactor = Math.pow(1 + (rate / 100), timeInSelectedPeriod);
      total = principal * compoundFactor;
      interest = total - principal;
    }

    setInterestAmount(interest);
    setTotalAmount(total);
    
    // Calculate monthly breakdown
    const breakdown = calculateMonthlyBreakdown(principal, rate, startDate, endDate, interestPeriod, interestType, useRounding);
    setMonthlyBreakdown(breakdown);
    } catch (error) {
      console.error('Error calculating interest:', error);
      setPrincipalAmount(null);
      setInterestAmount(null);
      setTotalAmount(null);
      setTimePeriod(null);
      setMonthlyBreakdown([]);
    }
  };

  // Calculate interest when inputs change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateInterest();
    }, 500); // 500ms debounce for calculations

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, startDate, endDate, interestRate, interestPeriod, interestType, useRounding]);

  const handleReset = () => {
    setAmount('');
    setAmountDisplay('');
    setStartDate(null);
    setEndDate(dayjs());
    setInterestRate('');
    setInterestPeriod('yearly');
    setInterestType('simple');
    setUseRounding(false);
    setPrincipalAmount(null);
    setInterestAmount(null);
    setTotalAmount(null);
    setTimePeriod(null);
    setMonthlyBreakdown([]);
    setShowBreakdown(false);
    
    // Clear sessionStorage
    removeCalculatorData('interestCalculator');
    
    onReset?.();
  };

  // Export functions
  const handleExportPNG = async () => {
    if (!totalAmount || !principalAmount || !interestAmount) {
      setExportMessage(t('noDataToExport'));
      setShowExportSnackbar(true);
      return;
    }

    setIsExporting(true);
    setExportMessage(t('exportingPng'));
    setShowExportSnackbar(true);

    try {
      await exportToPNG('interest-results-section', 'interest-calculation-results');
      setExportMessage(t('exportSuccess'));
    } catch (error) {
      console.error('PNG Export error:', error);
      setExportMessage(t('exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!totalAmount || !principalAmount || !interestAmount || !startDate || !endDate || !timePeriod) {
      setExportMessage(t('noDataToExport'));
      setShowExportSnackbar(true);
      return;
    }

    setIsExporting(true);
    setExportMessage(t('exportingPdf'));
    setShowExportSnackbar(true);

    try {
      const exportData: ExportData = {
        title: t('interestCalculator'),
        principalAmount: Number(amount),
        interestRate: Number(interestRate),
        interestPeriod: interestPeriod === 'yearly' ? t('perYear') : t('perMonth'),
        startDate: startDate.format('DD/MM/YYYY'),
        endDate: endDate.format('DD/MM/YYYY'),
        timePeriod: `${timePeriod.years} ${t('years')}, ${timePeriod.months} ${t('months')}, ${timePeriod.days} ${t('days')}`,
        interestType: interestType === 'simple' ? t('simpleInterest') : t('compoundInterest'),
        useRounding: useRounding,
        interestAmount: interestAmount,
        totalAmount: totalAmount,
        monthlyBreakdown: monthlyBreakdown.length > 0 ? monthlyBreakdown : undefined
      };

      await exportToPDF(exportData, 'interest-calculation-report');
      setExportMessage(t('exportSuccess'));
    } catch (error) {
      console.error('PDF Export error:', error);
      setExportMessage(t('exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setShowExportSnackbar(false);
  };

  return (
    <>
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
                    // Always set the value for UI, but validate before any logic
                    setStartDate(newValue);
                  }}
                  onAccept={(newValue) => {
                    // Only run validation logic when date is accepted (user finishes input)
                    if (newValue && newValue.isValid()) {
                      // If end date is before new start date, update end date
                      if (endDate && endDate.isValid() && endDate.isBefore(newValue, 'day')) {
                        setEndDate(newValue);
                      }
                    }
                  }}
                  onError={(error) => {
                    // Handle date picker errors gracefully
                    console.log('Start date error:', error);
                  }}
                  format="DD-MM-YYYY"
                  maxDate={endDate || undefined}
                  disableFuture
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      placeholder: "DD-MM-YYYY",
                      error: startDate !== null && !isValidDate(startDate),
                      inputProps: {
                        inputMode: 'numeric',
                        pattern: '[0-9-]*',
                        maxLength: 10,
                        style: { cursor: 'pointer' }
                      },
                      sx: {
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                          cursor: 'pointer',
                        },
                        '& .MuiInputBase-root': {
                          cursor: 'pointer',
                        },
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#9c7c38',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#9c7c38',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#9c7c38',
                        },
                      }
                    },
                    openPickerButton: {
                      sx: {
                        color: '#9c7c38',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.1)',
                        },
                      },
                    },
                  }}
                  sx={{
                    '& .MuiPickersDay-root': {
                      '&:hover': {
                        backgroundColor: 'rgba(156, 124, 56, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#9c7c38 !important',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.8) !important',
                        },
                      },
                    },
                    '& .MuiPickersYear-yearButton': {
                      '&:hover': {
                        backgroundColor: 'rgba(156, 124, 56, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#9c7c38 !important',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.8) !important',
                        },
                      },
                    },
                    '& .MuiPickersMonth-monthButton': {
                      '&:hover': {
                        backgroundColor: 'rgba(156, 124, 56, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#9c7c38 !important',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.8) !important',
                        },
                      },
                    },
                  }}
                />

                {/* End Date */}
                <DatePicker
                  label={t('endDate')}
                  value={endDate}
                  onChange={(newValue) => {
                    // Always set the value for UI, but validate before any logic
                    setEndDate(newValue);
                  }}
                  onAccept={(newValue) => {
                    // Only run validation logic when date is accepted (user finishes input)
                    if (newValue && newValue.isValid()) {
                      // If start date is after new end date, update start date
                      if (startDate && startDate.isValid() && startDate.isAfter(newValue, 'day')) {
                        setStartDate(newValue);
                      }
                    }
                  }}
                  onError={(error) => {
                    // Handle date picker errors gracefully
                    console.log('End date error:', error);
                  }}
                  format="DD-MM-YYYY"
                  minDate={startDate || undefined}
                  disableFuture
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      placeholder: "DD-MM-YYYY",
                      error: endDate !== null && !isValidDate(endDate),
                      inputProps: {
                        inputMode: 'numeric',
                        pattern: '[0-9-]*',
                        maxLength: 10,
                        style: { cursor: 'pointer' }
                      },
                      sx: {
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                          cursor: 'pointer',
                        },
                        '& .MuiInputBase-root': {
                          cursor: 'pointer',
                        },
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#9c7c38',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#9c7c38',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#9c7c38',
                        },
                      }
                    },
                    openPickerButton: {
                      sx: {
                        color: '#9c7c38',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.1)',
                        },
                      },
                    },
                  }}
                  sx={{
                    '& .MuiPickersDay-root': {
                      '&:hover': {
                        backgroundColor: 'rgba(156, 124, 56, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#9c7c38 !important',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.8) !important',
                        },
                      },
                    },
                    '& .MuiPickersYear-yearButton': {
                      '&:hover': {
                        backgroundColor: 'rgba(156, 124, 56, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#9c7c38 !important',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.8) !important',
                        },
                      },
                    },
                    '& .MuiPickersMonth-monthButton': {
                      '&:hover': {
                        backgroundColor: 'rgba(156, 124, 56, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#9c7c38 !important',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 124, 56, 0.8) !important',
                        },
                      },
                    },
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
                onChange={(e) => handleInterestPeriodChange(e.target.value as 'monthly' | 'yearly')}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="decrease interest rate"
                      onClick={decrementInterestRate}
                      edge="end"
                      size="small"
                      disabled={Number(interestRate) <= 0}
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
                      aria-label="increase interest rate"
                      onClick={incrementInterestRate}
                      edge="end"
                      size="small"
                      disabled={Number(interestRate) >= 100}
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
              placeholder="0.00"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                }
              }}
            />

            {/* Interest Rate Conversion Helper */}
            {interestRate && !isNaN(Number(interestRate)) && Number(interestRate) > 0 && (
              <Box sx={{ 
                p: 1.5, 
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderRadius: 1,
                borderLeft: '3px solid #D4AF37'
              }}>
                <Typography variant="body2" sx={{ 
                  color: '#B8941F', 
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  fontWeight: 'medium'
                }}>
                  💡 Equivalent rate: {
                    interestPeriod === 'yearly' 
                      ? `${(Number(interestRate) / 12).toFixed(2)}% ${t('perMonth')}`
                      : `${(Number(interestRate) * 12).toFixed(2)}% ${t('perYear')}`
                  }
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  mt: 0.5,
                  fontStyle: 'italic'
                }}>
                  {interestPeriod === 'yearly' 
                    ? 'Yearly rate ÷ 12 = Monthly rate (simple conversion)'
                    : 'Monthly rate × 12 = Yearly rate (simple conversion)'
                  }
                </Typography>
              </Box>
            )}

            {/* Interest Type Selection */}
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ 
                fontSize: { xs: '14px', sm: '0.875rem' }, 
                color: '#666', 
                mb: 1 
              }}>
                {t('interestType')}
              </FormLabel>
              <RadioGroup
                row
                value={interestType}
                onChange={(e) => setInterestType(e.target.value as 'simple' | 'compound')}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '14px', sm: '0.875rem' }
                  }
                }}
              >
                <FormControlLabel 
                  value="simple" 
                  control={<Radio size="small" />} 
                  label={t('simpleInterest')} 
                />
                <FormControlLabel 
                  value="compound" 
                  control={<Radio size="small" />} 
                  label={t('compoundInterest')} 
                />
              </RadioGroup>
            </FormControl>

            {/* Rounding Option */}
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ 
                fontSize: { xs: '14px', sm: '0.875rem' }, 
                color: '#666', 
                mb: 1 
              }}>
                {t('timePeriodRounding')}
              </FormLabel>
              <RadioGroup
                row
                value={useRounding ? 'yes' : 'no'}
                onChange={(e) => setUseRounding(e.target.value === 'yes')}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '14px', sm: '0.875rem' }
                  }
                }}
              >
                <FormControlLabel 
                  value="no" 
                  control={<Radio size="small" />} 
                  label={t('noExactCalculation')} 
                />
                <FormControlLabel 
                  value="yes" 
                  control={<Radio size="small" />} 
                  label={t('yesRoundDaysToMonths')} 
                />
              </RadioGroup>
            </FormControl>
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
        {/* Results Header with Export Icons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: { xs: 2, lg: 3 }
        }}>
          <Typography variant="h5" sx={{ 
            color: '#8E5924',
            transition: 'color 0.3s ease',
          }}>
            {t('results')}
          </Typography>
          
          {/* Export Icons */}
          {totalAmount && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('exportToPng')}>
                <span>
                  <IconButton
                    onClick={handleExportPNG}
                    disabled={isExporting}
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
                    {isExporting ? <CircularProgress size={20} /> : <ImageIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title={t('exportToPdf')}>
                <span>
                  <IconButton
                    onClick={handleExportPDF}
                    disabled={isExporting}
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
                    {isExporting ? <CircularProgress size={20} /> : <PdfIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>
        <Box 
          id="interest-results-section"
          sx={{ 
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
                    {timePeriod.days > 0 && !useRounding && `${timePeriod.days} ${t('days')}`}
                    {timePeriod.days > 0 && useRounding && timePeriod.days < 15 && `${timePeriod.days} ${t('days')} (${t('countedAsHalfMonth')})`}
                  </Typography>
                  {useRounding && (
                    <Typography variant="body2" sx={{ 
                      color: '#666', 
                      mt: 0.5, 
                      fontStyle: 'italic',
                      fontSize: { xs: '0.75rem', lg: '0.8rem' }
                    }}>
                      * {t('roundingEnabled')}
                    </Typography>
                  )}
                  {!useRounding && (
                    <Typography variant="body2" sx={{ 
                      color: '#666', 
                      mt: 0.5, 
                      fontStyle: 'italic',
                      fontSize: { xs: '0.75rem', lg: '0.8rem' }
                    }}>
                      * {t('exactCalculation')}
                    </Typography>
                  )}
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
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: monthlyBreakdown.length > 0 ? 'pointer' : 'default',
                    '&:hover': monthlyBreakdown.length > 0 ? {
                      '& .breakdown-icon': {
                        transform: 'scale(1.1)',
                        color: '#E65100',
                      }
                    } : {}
                  }}
                  onClick={() => {
                    if (monthlyBreakdown.length > 0) {
                      setShowBreakdown(!showBreakdown);
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ 
                    color: '#F57C00', 
                    mb: 1,
                    fontSize: { xs: '1rem', lg: '1.25rem' }
                  }}>
                    {t('interestAmount')}
                  </Typography>
                  {monthlyBreakdown.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon 
                        className="breakdown-icon"
                        sx={{ 
                          fontSize: '1.2rem', 
                          color: '#F57C00',
                          transition: 'all 0.2s ease'
                        }} 
                      />
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: '#F57C00',
                          '&:hover': { backgroundColor: 'rgba(245, 124, 0, 0.1)' }
                        }}
                      >
                        {showBreakdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  )}
                </Box>
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
                
                {/* Monthly Breakdown */}
                <Collapse in={showBreakdown}>
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2, backgroundColor: 'rgba(245, 124, 0, 0.3)' }} />
                    <Typography variant="h6" sx={{ 
                      color: '#E65100', 
                      mb: 2,
                      fontSize: { xs: '0.9rem', lg: '1rem' },
                      fontWeight: 'bold'
                    }}>
                      Monthly {interestType === 'simple' ? t('simpleInterest') : t('compoundInterest')} Breakdown
                      {useRounding && ` (${t('yesRoundDaysToMonths').toLowerCase()})`}
                      {!useRounding && ` (${t('noExactCalculation').toLowerCase()})`}
                    </Typography>
                    <TableContainer 
                      component={Paper} 
                      sx={{ 
                        maxHeight: 300, 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(245, 124, 0, 0.2)'
                      }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#FFF3E0' }}>
                              Month
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#FFF3E0' }}>
                              Days
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#FFF3E0' }}>
                              Monthly Interest
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#FFF3E0' }}>
                              Total Interest
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {monthlyBreakdown.map((month, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:nth-of-type(odd)': { 
                                  backgroundColor: 'rgba(255, 152, 0, 0.02)' 
                                },
                                '&:hover': { 
                                  backgroundColor: 'rgba(255, 152, 0, 0.05)' 
                                }
                              }}
                            >
                              <TableCell sx={{ fontSize: '0.8rem' }}>
                                {month.month} {month.year}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                                {month.daysInMonth}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                                ₹ {formatIndianNumber(month.monthlyInterest)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 'medium' }}>
                                ₹ {formatIndianNumber(month.cumulativeInterest)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Collapse>
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

    {/* Export Snackbar */}
    <Snackbar
      open={showExportSnackbar}
      autoHideDuration={4000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleCloseSnackbar} 
        severity={exportMessage.includes('Error') ? 'error' : 'success'}
        sx={{ width: '100%' }}
      >
        {exportMessage}
      </Alert>
    </Snackbar>
    </>
  );
};

export default InterestCalculator;
