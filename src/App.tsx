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
  SelectChangeEvent
} from '@mui/material';
import './App.css';

// Create a custom theme
const theme = createTheme({
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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
  },
});

function App() {
  // State for input values
  const [weight, setWeight] = useState<number | string>('');
  const [currentPurity, setCurrentPurity] = useState<number | string>('');
  const [targetPurity, setTargetPurity] = useState<number | string | 'custom'>('');
  const [customTargetPurity, setCustomTargetPurity] = useState<number | string>('');
  
  // State for gold purity to add
  const [goldPurityToAdd, setGoldPurityToAdd] = useState<number | string | 'custom'>(100);
  const [customGoldPurity, setCustomGoldPurity] = useState<number | string>('');
  const [showGoldPuritySelect, setShowGoldPuritySelect] = useState<boolean>(false);
  
  // Common gold purity values
  const commonPurities = [
    { value: 91.6, label: '22K (91.6%)' },
    { value: 75, label: '18K (75%)' },
    { value: 58.3, label: '14K (58.3%)' },
    { value: 41.7, label: '10K (41.7%)' },
    { value: 37.5, label: '9K (37.5%)' },
    { value: 33.3, label: '8K (33.3%)' },
    { value: 100, label: 'Pure Gold (100%)' },
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
      setShowGoldPuritySelect(false);
    } else if (targetPurityVal < currentPurityVal) {
      setResultType('copper');
      setWeightToAdd(Math.abs(weightAddition));
      setTotalWeight(weightVal + Math.abs(weightAddition)); // Total metal weight
      setShowGoldPuritySelect(false);
    } else {
      setResultType('gold');
      setShowGoldPuritySelect(true);
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
              Gold Purity Calculator
            </Typography>
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
                  <Typography variant="h5" gutterBottom sx={{ color: '#9c7c38' }}>
                    Input Values
                  </Typography>
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: 'rgba(248, 246, 236, 0.6)', 
                      borderRadius: 2,
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Current Gold Weight (grams)"
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
                      label="Current Gold Purity (%)"
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
                      <InputLabel id="target-purity-select-label">Target Gold Purity</InputLabel>
                      <Select
                        labelId="target-purity-select-label"
                        id="target-purity-select"
                        value={targetPurity.toString()}
                        label="Target Gold Purity"
                        onChange={handlePuritySelect}
                      >
                        {commonPurities.map((option) => (
                          <MenuItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </MenuItem>
                        ))}
                        <MenuItem value="custom">Custom Value</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {targetPurity === 'custom' && (
                      <TextField
                        fullWidth
                        label="Custom Target Purity (%)"
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
                      <Box sx={{ mt: 3, pt: 1, pb: 1, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 1, px: 2, borderLeft: '3px solid #D4AF37' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'medium' }}>
                          Select gold type to add:
                        </Typography>
                        <FormControl size="small" fullWidth>
                          <InputLabel id="gold-purity-select-label">Gold Purity to Add</InputLabel>
                          <Select
                            labelId="gold-purity-select-label"
                            id="gold-purity-select"
                            value={goldPurityToAdd === 'custom' ? 'custom' : goldPurityToAdd.toString()}
                            label="Gold Purity to Add"
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
                            <MenuItem value="custom">Custom Value</MenuItem>
                          </Select>
                        </FormControl>
                        
                        {goldPurityToAdd === 'custom' && (
                          <TextField
                            fullWidth
                            label="Custom Gold Purity (%)"
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
                  <Typography variant="h5" gutterBottom sx={{ color: '#8E5924' }}>
                    Results
                  </Typography>
                  <Box sx={{ 
                    mt: 2, 
                    p: 3, 
                    bgcolor: 'rgba(248, 246, 240, 0.8)', 
                    borderRadius: 2, 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(200, 117, 51, 0.3)'
                  }}>
                    {(weight && currentPurity && targetPurity) ? (
                      <>
                        {resultType === 'equal' && (
                          <Box sx={{ p: 2, bgcolor: 'rgba(0, 150, 136, 0.1)', borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ color: 'success.main' }}>
                              No adjustment needed
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                              The current and target purities are the same.
                            </Typography>
                          </Box>
                        )}
                        {resultType === 'copper' && (
                          <Box sx={{ p: 2, bgcolor: 'rgba(200, 117, 51, 0.15)', borderRadius: 1, borderLeft: '4px solid #C87533' }}>
                            <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                              Add {weightToAdd?.toFixed(3)} grams of copper
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                              To decrease purity from {Number(currentPurity).toFixed(2)}% to {
                                targetPurity === 'custom' ? 
                                Number(customTargetPurity).toFixed(2) : 
                                Number(targetPurity).toFixed(2)
                              }%
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                              Copper weight: <strong>{weightToAdd?.toFixed(3)} grams</strong>
                            </Typography>
                          </Box>
                        )}
                        {resultType === 'gold' && (
                          <>
                            <Box sx={{ p: 2, bgcolor: 'rgba(212, 175, 55, 0.15)', borderRadius: 1, borderLeft: '4px solid #D4AF37' }}>
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                Add {weightToAdd?.toFixed(3)} grams of gold ({goldPurityToAdd === 'custom' ? 
                                  Number(customGoldPurity || 100).toFixed(2) : Number(goldPurityToAdd).toFixed(2)}% purity)
                              </Typography>
                              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                                To increase purity from {Number(currentPurity).toFixed(2)}% to {
                                  targetPurity === 'custom' ? 
                                  Number(customTargetPurity).toFixed(2) : 
                                  Number(targetPurity).toFixed(2)
                                }%
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                                Gold weight: <strong>{weightToAdd?.toFixed(3)} grams</strong>
                              </Typography>
                            </Box>
                          </>
                        )}
                        <Box sx={{ mt: 3, pt: 2, pb: 1, borderTop: '1px solid #eaeaea' }}>
                          <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1.5 }}>
                            Final Results:
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 1 }}>
                            <Typography variant="body1">
                              New total metal weight: <strong>{totalWeight?.toFixed(3)} grams</strong>
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                              Pure gold content: <strong>
                                {(totalWeight && (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity))) ? 
                                  (totalWeight * (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity)) / 100).toFixed(3) : '0.000'} grams
                              </strong>
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                              Copper content: <strong>
                                {(totalWeight && (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity))) ? 
                                  (totalWeight * (1 - (targetPurity !== 'custom' ? Number(targetPurity) : Number(customTargetPurity)) / 100)).toFixed(3) : '0.000'} grams
                              </strong>
                            </Typography>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body1" color="textSecondary">
                        Enter all values to see results
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
