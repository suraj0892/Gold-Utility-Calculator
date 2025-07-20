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
import { exportPurityToPNG, exportPurityToPDF, PurityExportData } from '../utils/exportUtils';

interface PurityCalculatorProps {
  onReset?: () => void;
}

const PurityCalculator: React.FC<PurityCalculatorProps> = ({ onReset }) => {
  const { t } = useTranslation();

  // State for input values
  const [weight, setWeight] = useState<number | string>('');
  const [currentPurity, setCurrentPurity] = useState<number | string>(99.5);
  const [targetPurity, setTargetPurity] = useState<number | string | 'custom'>('');
  const [customTargetPurity, setCustomTargetPurity] = useState<number | string>('');
  
  // State for gold purity to add
  const [goldPurityToAdd, setGoldPurityToAdd] = useState<number | string | 'custom'>('custom');
  const [customGoldPurity, setCustomGoldPurity] = useState<number | string>(100);
  
  // State for results
  const [resultType, setResultType] = useState<'equal' | 'copper' | 'gold' | ''>('');
  const [weightToAdd, setWeightToAdd] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState<number | null>(null);

  // Export-related states
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Load values from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('purityCalculator');
    console.log('Loading from localStorage (Purity):', savedData); // Debug log
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('Parsed data (Purity):', parsed); // Debug log
        
        // Only set values if they exist and are not empty
        if (parsed.weight !== undefined && parsed.weight !== '') {
          setWeight(parsed.weight);
        }
        if (parsed.currentPurity !== undefined && parsed.currentPurity !== '') {
          setCurrentPurity(parsed.currentPurity);
        }
        if (parsed.targetPurity !== undefined && parsed.targetPurity !== '') {
          setTargetPurity(parsed.targetPurity);
        }
        if (parsed.customTargetPurity !== undefined && parsed.customTargetPurity !== '') {
          setCustomTargetPurity(parsed.customTargetPurity);
        }
        if (parsed.goldPurityToAdd !== undefined && parsed.goldPurityToAdd !== '') {
          setGoldPurityToAdd(parsed.goldPurityToAdd);
        }
        if (parsed.customGoldPurity !== undefined && parsed.customGoldPurity !== '') {
          setCustomGoldPurity(parsed.customGoldPurity);
        }
        
        // Load results if they exist
        if (parsed.resultType !== undefined && parsed.resultType !== '') {
          setResultType(parsed.resultType);
        }
        if (parsed.weightToAdd !== undefined && parsed.weightToAdd !== null) {
          setWeightToAdd(parsed.weightToAdd);
        }
        if (parsed.totalWeight !== undefined && parsed.totalWeight !== null) {
          setTotalWeight(parsed.totalWeight);
        }
      } catch (error) {
        console.error('Error loading saved data (Purity):', error);
      }
    }
  }, []);

  // Save values to localStorage whenever they change
  const saveToLocalStorage = () => {
    const dataToSave = {
      weight,
      currentPurity,
      targetPurity,
      customTargetPurity,
      goldPurityToAdd,
      customGoldPurity,
      // Include results
      resultType,
      weightToAdd,
      totalWeight
    };
    console.log('Saving to localStorage (Purity):', dataToSave); // Debug log
    localStorage.setItem('purityCalculator', JSON.stringify(dataToSave));
  };

  // Save to localStorage whenever any input or result changes
  useEffect(() => {
    saveToLocalStorage();
  }, [weight, currentPurity, targetPurity, customTargetPurity, goldPurityToAdd, customGoldPurity,
      resultType, weightToAdd, totalWeight]);

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
      setTargetPurity('custom');
    } else {
      setTargetPurity(value);
      setCustomTargetPurity('');
    }
  };

  // Helper functions for weight increment/decrement
  const incrementWeight = () => {
    const current = Number(weight) || 0;
    const newValue = current + 0.1;
    setWeight(newValue.toFixed(1));
  };

  const decrementWeight = () => {
    const current = Number(weight) || 0;
    const newValue = Math.max(current - 0.1, 0);
    setWeight(newValue.toFixed(1));
  };

  // Helper functions for current purity increment/decrement
  const incrementCurrentPurity = () => {
    const current = Number(currentPurity) || 0;
    const newValue = Math.min(current + 0.1, 100);
    setCurrentPurity(newValue.toFixed(1));
  };

  const decrementCurrentPurity = () => {
    const current = Number(currentPurity) || 0;
    const newValue = Math.max(current - 0.1, 0);
    setCurrentPurity(newValue.toFixed(1));
  };

  // Helper functions for custom target purity increment/decrement
  const incrementCustomTargetPurity = () => {
    const current = Number(customTargetPurity) || 0;
    const newValue = Math.min(current + 0.1, 100);
    setCustomTargetPurity(newValue.toFixed(1));
  };

  const decrementCustomTargetPurity = () => {
    const current = Number(customTargetPurity) || 0;
    const newValue = Math.max(current - 0.1, 0);
    setCustomTargetPurity(newValue.toFixed(1));
  };

  // Helper functions for custom gold purity increment/decrement
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

  // Function to calculate results based on formula
  const calculateResults = (
    weightVal: number,
    currentPurityVal: number,
    targetPurityVal: number
  ) => {
    // Calculate pure gold content
    const currentPureGold = weightVal * (currentPurityVal / 100);
    
    // Calculate target total weight needed
    const targetTotalWeight = currentPureGold / (targetPurityVal / 100);
    
    // Calculate weight to add
    const weightAddition = targetTotalWeight - weightVal;
    
    // Set results based on calculation
    if (targetPurityVal === currentPurityVal) {
      setResultType('equal');
      setWeightToAdd(0);
      setTotalWeight(weightVal);
    } else if (targetPurityVal < currentPurityVal) {
      setResultType('copper');
      setWeightToAdd(Math.abs(weightAddition));
      setTotalWeight(weightVal + Math.abs(weightAddition)); // Total metal weight
    } else {
      setResultType('gold');
      // Recalculate based on gold purity to add
      const goldPurityVal = goldPurityToAdd === 'custom' ? 
        (customGoldPurity ? Number(customGoldPurity) : 100) : 
        Number(goldPurityToAdd);
      
      // When increasing purity (adding gold), use this corrected formula
      // We need to calculate how much gold of specified purity to add
      const pureGoldInItem = weightVal * (currentPurityVal / 100); // Pure gold content in original item
      const requiredPureGold = pureGoldInItem / (targetPurityVal / 100); // Total weight needed at target purity
      const weightToAddNeeded = requiredPureGold - weightVal; // Additional weight needed
      
      // If we're adding gold of purity less than 100%, we need to add more
      const goldToAdd = weightToAddNeeded * (100 / goldPurityVal);
      
      setWeightToAdd(Math.abs(goldToAdd)); // Ensure value is always positive
      setTotalWeight(weightVal + Math.abs(goldToAdd)); // Total metal weight
    }
  };

  // Calculate results when inputs change
  useEffect(() => {
    if (weight && currentPurity && targetPurity && 
        !(targetPurity === 'custom' && (!customTargetPurity || customTargetPurity === ''))) {
      const actualTargetPurity = targetPurity === 'custom' ? 
        Number(customTargetPurity) : Number(targetPurity);
      calculateResults(Number(weight), Number(currentPurity), actualTargetPurity);
    } else {
      setResultType('');
      setWeightToAdd(null);
      setTotalWeight(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, currentPurity, targetPurity, customTargetPurity, goldPurityToAdd, customGoldPurity]);

  const handleReset = () => {
    setWeight('');
    setCurrentPurity('');
    setTargetPurity('');
    setCustomTargetPurity('');
    setGoldPurityToAdd('custom');
    setCustomGoldPurity(100);
    setResultType('');
    setWeightToAdd(null);
    setTotalWeight(null);
    
    // Clear localStorage
    localStorage.removeItem('purityCalculator');
    
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
      await exportPurityToPNG('purity-results-section');
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
      const exportData: PurityExportData = {
        title: 'Purity Calculator Results',
        currentWeight: Number(weight),
        currentPurity: Number(currentPurity),
        targetPurity: targetPurity === 'custom' ? Number(customTargetPurity) : Number(targetPurity),
        goldPurityToAdd: goldPurityToAdd === 'custom' ? Number(customGoldPurity) : Number(goldPurityToAdd),
        resultType: resultType as 'equal' | 'copper' | 'gold',
        weightToAdd: weightToAdd || undefined,
        totalWeight: totalWeight || undefined,
        pureGoldContent: Number(weight) * (Number(currentPurity) / 100),
        copperContent: Number(weight) * (1 - Number(currentPurity) / 100)
      };

      await exportPurityToPDF(exportData);
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
    return weight && currentPurity && targetPurity && 
      !(targetPurity === 'custom' && (!customTargetPurity || customTargetPurity === '')) &&
      resultType;
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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
            <TextField
              fullWidth
              label={t('currentWeight')}
              value={weight}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setWeight(value);
                }
              }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="decrease weight"
                      onClick={decrementWeight}
                      edge="end"
                      size="small"
                      disabled={Number(weight) <= 0}
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
                      aria-label="increase weight"
                      onClick={incrementWeight}
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
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                }
              }}
            />
            <TextField
              fullWidth
              label={t('currentPurity')}
              value={currentPurity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                  // Allow only 2 decimal places
                  const parts = value.split('.');
                  if (parts.length === 1 || (parts.length === 2 && parts[1].length <= 2)) {
                    setCurrentPurity(value);
                  }
                }
              }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="decrease current purity"
                      onClick={decrementCurrentPurity}
                      edge="end"
                      size="small"
                      disabled={Number(currentPurity) <= 0}
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
                      aria-label="increase current purity"
                      onClick={incrementCurrentPurity}
                      edge="end"
                      size="small"
                      disabled={Number(currentPurity) >= 100}
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
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                }
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="target-purity-select-label">{t('selectTargetPurity')}</InputLabel>
              <Select
                labelId="target-purity-select-label"
                id="target-purity-select"
                value={targetPurity.toString()}
                label={t('selectTargetPurity')}
                onChange={handlePuritySelect}
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                  }
                }}
              >
                {commonPurities.map((option) => (
                  <MenuItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </MenuItem>
                ))}
                <MenuItem value="custom">{t('customPurity')}</MenuItem>
              </Select>
            </FormControl>
            
            {targetPurity === 'custom' && (
              <TextField
                fullWidth
                label={t('customValue')}
                value={customTargetPurity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                    // Allow only 2 decimal places
                    const parts = value.split('.');
                    if (parts.length === 1 || (parts.length === 2 && parts[1].length <= 2)) {
                      setCustomTargetPurity(value);
                    }
                  }
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="decrease custom target purity"
                        onClick={decrementCustomTargetPurity}
                        edge="end"
                        size="small"
                        disabled={Number(customTargetPurity) <= 0}
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
                        aria-label="increase custom target purity"
                        onClick={incrementCustomTargetPurity}
                        edge="end"
                        size="small"
                        disabled={Number(customTargetPurity) >= 100}
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
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                  }
                }}
              />
            )}
          </Stack>
          
          {resultType === 'gold' && (
            <Box sx={{ 
              mt: { xs: 3, lg: 4 }, 
              pt: { xs: 2, lg: 3 }, 
              pb: { xs: 2, lg: 3 }, 
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderRadius: 2, 
              px: { xs: 2, lg: 3 }, 
              borderLeft: '3px solid #D4AF37',
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="subtitle1" sx={{ 
                mb: 2, 
                fontWeight: 'medium', 
                color: '#9c7c38',
                fontSize: { xs: '1rem', lg: '1.125rem' }
              }}>
                {t('selectGoldPurity')}:
              </Typography>
              <Stack spacing={{ xs: 1.5, lg: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="gold-purity-select-label">{t('goldPurityToAdd')}</InputLabel>
                  <Select
                    labelId="gold-purity-select-label"
                    id="gold-purity-select"
                    value={goldPurityToAdd === 'custom' ? 'custom' : goldPurityToAdd.toString()}
                    label={t('goldPurityToAdd')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'custom') {
                        setGoldPurityToAdd('custom');
                      } else {
                        setGoldPurityToAdd(value);
                      }
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                      }
                    }}
                  >
                    {commonPurities.map((option) => (
                      <MenuItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">{t('customPurity')}</MenuItem>
                  </Select>
                </FormControl>
                
                {goldPurityToAdd === 'custom' && (
                  <TextField
                    fullWidth
                    label={t('customValue')}
                    size="small"
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
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '16px', sm: '14px' }, // Prevent zoom on iOS
                      }
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}
          
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: { xs: 2, lg: 3 }
        }}>
          <Typography variant="h5" sx={{ 
            color: '#8E5924',
            transition: 'color 0.3s ease'
          }}>
            {t('results')}
          </Typography>
          
          {hasValidResults() && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('purityExportToPng')}>
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
              
              <Tooltip title={t('purityExportToPdf')}>
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
        
        <Box id="purity-results-section" sx={{ 
          mt: { xs: 1, lg: 2 }, 
          p: { xs: 2, lg: 4 }, 
          bgcolor: 'rgba(248, 246, 240, 0.8)',
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(200, 117, 51, 0.3)',
          transition: 'all 0.3s ease',
          minHeight: { xs: '250px', lg: '300px' }
        }}>
          {(weight && currentPurity && targetPurity && 
            !(targetPurity === 'custom' && (!customTargetPurity || customTargetPurity === ''))
          ) ? (
            <>
              {resultType === 'equal' && (
                <Box sx={{ 
                  p: { xs: 1.5, lg: 2 }, 
                  bgcolor: 'rgba(0, 150, 136, 0.1)', 
                  borderRadius: 1 
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'success.main',
                    fontSize: { xs: '1rem', lg: '1.25rem' }
                  }}>
                    {t('noAdjustmentNeeded')}
                  </Typography>
                </Box>
              )}
              {resultType === '' && weightToAdd === null && (
                <Box sx={{ 
                  p: { xs: 1.5, lg: 2 }, 
                  bgcolor: 'rgba(255, 152, 0, 0.1)', 
                  borderRadius: 1, 
                  borderLeft: '4px solid #FF9800' 
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#E65100', 
                    mb: 1,
                    fontSize: { xs: '1rem', lg: '1.25rem' }
                  }}>
                    {t('impossibleCalculation')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#BF360C',
                    fontSize: { xs: '0.875rem', lg: '0.875rem' }
                  }}>
                    {(() => {
                      const actualTargetPurity = targetPurity === 'custom' ? 
                        Number(customTargetPurity) : Number(targetPurity);
                      const actualGoldPurityToAdd = goldPurityToAdd === 'custom' ? 
                        (customGoldPurity ? Number(customGoldPurity) : 100) : 
                        Number(goldPurityToAdd);
                      
                      if (actualTargetPurity === 100 && actualGoldPurityToAdd < 100) {
                        return t('cannotReach100Percent', { purity: actualGoldPurityToAdd.toFixed(2) });
                      } else if (actualGoldPurityToAdd <= actualTargetPurity) {
                        return t('cannotIncreaseWithLowerPurity', { 
                          goldPurity: actualGoldPurityToAdd.toFixed(2),
                          targetPurity: actualTargetPurity.toFixed(2)
                        });
                      }
                      return t('calculationNotPossible');
                    })()}
                  </Typography>
                </Box>
              )}
              {resultType === 'copper' && (
                <Box sx={{ 
                  p: { xs: 1.5, lg: 2 }, 
                  bgcolor: 'rgba(200, 117, 51, 0.15)', 
                  borderRadius: 1, 
                  borderLeft: '4px solid #C87533' 
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'secondary.main',
                      fontSize: { xs: '1rem', lg: '1.25rem' }
                    }}
                    dangerouslySetInnerHTML={{ __html: t('addCopper', { weight: weightToAdd?.toFixed(3) }) }}
                  />
                  <Typography 
                    variant="body1" 
                    color="textSecondary" 
                    sx={{ 
                      mt: 1,
                      fontSize: { xs: '0.875rem', lg: '1rem' }
                    }}
                  >
                    {t('toDecreasePurity', { 
                      current: Number(currentPurity).toFixed(2),
                      target: targetPurity === 'custom' ? 
                        Number(customTargetPurity).toFixed(2) : 
                        Number(targetPurity).toFixed(2)
                    })}
                  </Typography>
                </Box>
              )}
              {resultType === 'gold' && (
                <>
                  <Box sx={{ 
                    p: { xs: 1.5, lg: 2 }, 
                    bgcolor: 'rgba(212, 175, 55, 0.15)',
                    borderRadius: 1, 
                    borderLeft: '4px solid #D4AF37',
                    transition: 'all 0.3s ease'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'primary.main',
                        fontSize: { xs: '1rem', lg: '1.25rem' }
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: t('addGold', { 
                          weight: weightToAdd?.toFixed(3),
                          purity: goldPurityToAdd === 'custom' ? 
                            Number(customGoldPurity || 100).toFixed(2) : 
                            Number(goldPurityToAdd).toFixed(2)
                        })
                      }}
                    />
                    <Typography 
                      variant="body1" 
                      color="textSecondary" 
                      sx={{ 
                        mt: 1,
                        fontSize: { xs: '0.875rem', lg: '1rem' }
                      }}
                    >
                      {t('toIncreasePurity', { 
                        current: Number(currentPurity).toFixed(2),
                        target: targetPurity === 'custom' ? 
                          Number(customTargetPurity).toFixed(2) : 
                          Number(targetPurity).toFixed(2)
                      })}
                    </Typography>
                  </Box>
                </>
              )}
              {/* Final Results section */}
              <Box sx={{ 
                mt: { xs: 2, lg: 3 }, 
                pt: 2, 
                pb: 1, 
                borderTop: '1px solid #eaeaea' 
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: '1rem', lg: '1.1rem' }, 
                  mb: 1.5 
                }}>
                  {t('finalResults')}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: { xs: 1, lg: 1.5 }, 
                  ml: 1 
                }}>
                  <Typography 
                    variant="body1"
                    sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}
                    dangerouslySetInnerHTML={{ __html: t('totalWeight', { weight: totalWeight?.toFixed(3) }) }}
                  />
                  <Typography variant="body1" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('pureGoldContent', { 
                        weight: (totalWeight && (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity))) ? 
                          (totalWeight * (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity)) / 100).toFixed(3) : '0.000'
                      })
                    }} />
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>
                    <span dangerouslySetInnerHTML={{ 
                      __html: t('copperContent', { 
                        weight: (totalWeight && (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity))) ? 
                          (totalWeight * (1 - (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity)) / 100)).toFixed(3) : '0.000'
                      })
                    }} />
                  </Typography>
                </Box>
              </Box>
            </>
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

export default PurityCalculator;
