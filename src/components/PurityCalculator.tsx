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
  SelectChangeEvent
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PurityCalculatorProps {
  onReset?: () => void;
}

const PurityCalculator: React.FC<PurityCalculatorProps> = ({ onReset }) => {
  const { t } = useTranslation();

  // State for input values
  const [weight, setWeight] = useState<number | string>('');
  const [currentPurity, setCurrentPurity] = useState<number | string>('');
  const [targetPurity, setTargetPurity] = useState<number | string | 'custom'>('');
  const [customTargetPurity, setCustomTargetPurity] = useState<number | string>('');
  
  // State for gold purity to add
  const [goldPurityToAdd, setGoldPurityToAdd] = useState<number | string | 'custom'>(100);
  const [customGoldPurity, setCustomGoldPurity] = useState<number | string>('');
  
  // State for results
  const [resultType, setResultType] = useState<'equal' | 'copper' | 'gold' | ''>('');
  const [weightToAdd, setWeightToAdd] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState<number | null>(null);

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

  // Function to calculate results based on formula
  const calculateResults = (
    weightVal: number,
    currentPurityVal: number,
    targetPurityVal: number
  ) => {
    const currentPureGold = weightVal * (currentPurityVal / 100);
    
    if (Math.abs(currentPurityVal - targetPurityVal) < 0.01) {
      setResultType('equal');
      setWeightToAdd(0);
      setTotalWeight(weightVal);
    } else if (targetPurityVal < currentPurityVal) {
      // Need to add copper
      const targetTotalWeight = currentPureGold / (targetPurityVal / 100);
      const copperToAdd = targetTotalWeight - weightVal;
      setResultType('copper');
      setWeightToAdd(copperToAdd);
      setTotalWeight(targetTotalWeight);
    } else {
      // Need to add gold
      const actualGoldPurityToAdd = goldPurityToAdd === 'custom' ? 
        (customGoldPurity ? Number(customGoldPurity) : 100) : 
        Number(goldPurityToAdd);
      
      const goldToAdd = (currentPureGold * (targetPurityVal - currentPurityVal)) / 
        (actualGoldPurityToAdd - targetPurityVal);
      const newTotalWeight = weightVal + goldToAdd;
      setResultType('gold');
      setWeightToAdd(goldToAdd);
      setTotalWeight(newTotalWeight);
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
    setGoldPurityToAdd(100);
    setCustomGoldPurity('');
    setResultType('');
    setWeightToAdd(null);
    setTotalWeight(null);
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
            <TextField
              fullWidth
              label={t('currentWeight')}
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
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
                inputProps: { min: 0, max: 100, step: 0.01 }
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
                  inputProps: { min: 0, max: 100, step: 0.01 }
                }}
              />
            )}
          </Stack>
          
          {resultType === 'gold' && (
            <Box sx={{ 
              mt: 4, 
              pt: 3, 
              pb: 3, 
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderRadius: 2, 
              px: 3, 
              borderLeft: '3px solid #D4AF37',
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: '#9c7c38' }}>
                {t('selectGoldPurity')}:
              </Typography>
              <Stack spacing={2}>
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
                      inputProps: { min: 0.1, max: 100, step: 0.01 }
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}
          
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
                    bgcolor: 'rgba(212, 175, 55, 0.15)',
                    borderRadius: 1, 
                    borderLeft: '4px solid #D4AF37',
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
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mt: 8 }}>
              {t('enterAllValues')}
            </Typography>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default PurityCalculator;
