import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button
} from '@mui/material';
import { Translate } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  
  // Create dynamic theme based on language
  const theme = createTheme({
    palette: {
      primary: {
        main: '#D4AF37', // Always gold color for both languages
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
  
  // State for input values
  const [weight, setWeight] = useState<number | string>('');
  const [currentPurity, setCurrentPurity] = useState<number | string>('');
  const [targetPurity, setTargetPurity] = useState<number | string | 'custom'>('');
  const [customTargetPurity, setCustomTargetPurity] = useState<number | string>('');
  
  // State for gold purity to add
  const [goldPurityToAdd, setGoldPurityToAdd] = useState<number | string | 'custom'>(100);
  const [customGoldPurity, setCustomGoldPurity] = useState<number | string>('');
  
  // Common gold purity values
  const commonPurities = [
    { value: 91.6, label: t('22k') },
    { value: 75, label: t('18k') },
    { value: 58.3, label: t('14k') },
    { value: 41.7, label: t('10k') },
    { value: 37.5, label: t('9k') },
    { value: 33.3, label: t('8k') },
    { value: 100, label: t('pureGold') },
  ];
  
  // State for calculated results
  const [resultType, setResultType] = useState<string>('');
  const [weightToAdd, setWeightToAdd] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState<number | null>(null);

  // Calculate results when any input changes
  useEffect(() => {
    const actualTargetPurity = targetPurity === 'custom' ? customTargetPurity : targetPurity;
    const actualGoldPurityToAdd = goldPurityToAdd === 'custom' ? 
      (customGoldPurity ? Number(customGoldPurity) : 100) : 
      Number(goldPurityToAdd);
    
    // Don't show results if custom target purity is selected but empty
    if (targetPurity === 'custom' && (!customTargetPurity || customTargetPurity === '')) {
      setResultType('');
      setWeightToAdd(null);
      setTotalWeight(null);
      return;
    }
    
    if (weight && currentPurity && actualTargetPurity && actualTargetPurity !== '') {
      calculateResults(Number(weight), Number(currentPurity), Number(actualTargetPurity));
    } else {
      // Reset results if any input is empty
      setResultType('');
      setWeightToAdd(null);
      setTotalWeight(null);
    }
  }, [weight, currentPurity, targetPurity, customTargetPurity, goldPurityToAdd, customGoldPurity]);

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
  
  // Handle common purity selection
  const handlePuritySelect = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value !== 'custom') {
      setTargetPurity(value);
    } else {
      // Just mark as custom, don't clear the value
      setTargetPurity('custom');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {t('title')}
            </Typography>
            
            {/* Fancy Language Toggle Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '25px',
                  padding: '4px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Sliding Background */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '4px',
                    left: i18n.language === 'en' ? '4px' : 'calc(50% - 2px)',
                    width: 'calc(50% - 2px)',
                    height: 'calc(100% - 8px)',
                    bgcolor: '#FFD700', // Always gold color
                    borderRadius: '20px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1,
                  }}
                />
                
                {/* English Button */}
                <Button
                  onClick={() => i18n.changeLanguage('en')}
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    minWidth: '60px',
                    height: '36px',
                    color: i18n.language === 'en' ? '#000' : '#000', // Black for both
                    fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#000',
                    },
                  }}
                >
                  EN
                </Button>
                
                {/* Tamil Button */}
                <Button
                  onClick={() => i18n.changeLanguage('ta')}
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    minWidth: '60px',
                    height: '36px',
                    color: i18n.language === 'ta' ? '#000' : '#000', // Black for both
                    fontWeight: i18n.language === 'ta' ? 'bold' : 'normal',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    fontFamily: '"Roboto", "Noto Sans Tamil", sans-serif',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#000',
                    },
                  }}
                >
                  தமிழ்
                </Button>
              </Box>
              
              {/* Animated Language Icon */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Translate 
                  sx={{ 
                    color: '#FFD700', // Always gold color
                    transition: 'all 0.3s ease',
                    animation: i18n.language === 'ta' ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                      },
                      '50%': {
                        transform: 'scale(1.1)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                      },
                    },
                  }} 
                />
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ p: 2 }}>
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={4} 
                sx={{ width: '100%' }}
              >
                {/* Input Section */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#9c7c38', // Always gold color
                    transition: 'color 0.3s ease' 
                  }}>
                    {t('inputValues')}
                  </Typography>
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: 'rgba(248, 246, 236, 0.6)', // Always gold background
                      borderRadius: 2,
                      border: '1px solid rgba(212, 175, 55, 0.3)', // Always gold border
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t('currentWeight')}
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      margin="dense"
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, step: 0.001 }
                      }}
                    />
                    <TextField
                      fullWidth
                      label={t('currentPurity')}
                      type="number"
                      value={currentPurity}
                      onChange={(e) => setCurrentPurity(e.target.value)}
                      margin="dense"
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, max: 100, step: 0.01 }
                      }}
                    />
                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel id="target-purity-select-label">{t('selectTargetPurity')}</InputLabel>
                      <Select
                        labelId="target-purity-select-label"
                        id="target-purity-select"
                        value={targetPurity.toString()}
                        label={t('selectTargetPurity')}
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
                    
                    {targetPurity === 'custom' && (
                      <TextField
                        fullWidth
                        label={t('customValue')}
                        type="number"
                        value={customTargetPurity}
                        onChange={(e) => setCustomTargetPurity(e.target.value)}
                        margin="dense"
                        size="small"
                        InputProps={{
                          inputProps: { min: 0, max: 100, step: 0.01 }
                        }}
                      />
                    )}
                    
                    {resultType === 'gold' && (
                      <Box sx={{ 
                        mt: 3, 
                        pt: 1, 
                        pb: 1, 
                        backgroundColor: 'rgba(212, 175, 55, 0.1)', // Always gold background
                        borderRadius: 1, 
                        px: 2, 
                        borderLeft: '3px solid #D4AF37', // Always gold border
                        transition: 'all 0.3s ease'
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'medium' }}>
                          {t('selectGoldPurity')}:
                        </Typography>
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
                            type="number"
                            size="small"
                            sx={{ mt: 2 }}
                            value={customGoldPurity}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCustomGoldPurity(value);
                            }}
                            InputProps={{
                              inputProps: { min: 0.1, max: 100, step: 0.01 }
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Results Section */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#8E5924', // Always gold color
                    transition: 'color 0.3s ease'
                  }}>
                    {t('results')}
                  </Typography>
                  <Box sx={{ 
                    mt: 2, 
                    p: 3, 
                    bgcolor: 'rgba(248, 246, 240, 0.8)', // Always gold background
                    borderRadius: 2, 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(200, 117, 51, 0.3)', // Always gold border
                    transition: 'all 0.3s ease'
                  }}>
                    {(weight && currentPurity && targetPurity && 
                      !(targetPurity === 'custom' && (!customTargetPurity || customTargetPurity === ''))
                    ) ? (
                      <>
                        {resultType === 'equal' && (
                          <Box sx={{ p: 2, bgcolor: 'rgba(0, 150, 136, 0.1)', borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ color: 'success.main' }}>
                              {t('noAdjustmentNeeded')}
                            </Typography>
                          </Box>
                        )}
                        {resultType === 'copper' && (
                          <Box sx={{ p: 2, bgcolor: 'rgba(200, 117, 51, 0.15)', borderRadius: 1, borderLeft: '4px solid #C87533' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ color: 'secondary.main' }}
                              dangerouslySetInnerHTML={{ __html: t('addCopper', { weight: weightToAdd?.toFixed(3) }) }}
                            />
                            <Typography 
                              variant="body1" 
                              color="textSecondary" 
                              sx={{ mt: 1 }}
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
                              p: 2, 
                              bgcolor: 'rgba(212, 175, 55, 0.15)', // Always gold background
                              borderRadius: 1, 
                              borderLeft: '4px solid #D4AF37', // Always gold border
                              transition: 'all 0.3s ease'
                            }}>
                              <Typography 
                                variant="h6" 
                                sx={{ color: 'primary.main' }}
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
                                sx={{ mt: 1 }}
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
                        <Box sx={{ mt: 3, pt: 2, pb: 1, borderTop: '1px solid #eaeaea' }}>
                          <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1.5 }}>
                            {t('finalResults')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 1 }}>
                            <Typography 
                              variant="body1"
                              dangerouslySetInnerHTML={{ __html: t('totalWeight', { weight: totalWeight?.toFixed(3) }) }}
                            />
                            <Typography variant="body1" color="textSecondary">
                              <span dangerouslySetInnerHTML={{ 
                                __html: t('pureGoldContent', { 
                                  weight: (totalWeight && (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity))) ? 
                                    (totalWeight * (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity)) / 100).toFixed(3) : '0.000'
                                })
                              }} />
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
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
                      <Typography variant="body1" color="textSecondary">
                        {t('enterAllValues')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default App;
