// Utility functions for number formatting and conversion

/**
 * Format number in Indian numbering system (lakhs, crores)
 * Example: 1234567 -> "12,34,567"
 */
export const formatIndianNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  
  const numStr = Math.round(num * 100) / 100; // Round to 2 decimal places
  const [integerPart, decimalPart] = numStr.toString().split('.');
  
  // Handle the integer part with Indian comma formatting
  let formatted = '';
  const length = integerPart.length;
  
  if (length <= 3) {
    formatted = integerPart;
  } else if (length <= 5) {
    formatted = integerPart.slice(0, length - 3) + ',' + integerPart.slice(length - 3);
  } else if (length <= 7) {
    formatted = integerPart.slice(0, length - 5) + ',' + 
               integerPart.slice(length - 5, length - 3) + ',' + 
               integerPart.slice(length - 3);
  } else {
    // For crores and above - simplified approach
    let result = '';
    let remainingDigits = integerPart;
    
    // Handle crores (digits beyond 7)
    if (length > 7) {
      const croresPart = remainingDigits.slice(0, length - 7);
      result += croresPart + ',';
      remainingDigits = remainingDigits.slice(length - 7);
    }
    
    // Handle lakhs (positions 6-7)
    if (remainingDigits.length > 5) {
      result += remainingDigits.slice(0, remainingDigits.length - 5) + ',';
      remainingDigits = remainingDigits.slice(remainingDigits.length - 5);
    }
    
    // Handle thousands (positions 4-5)
    if (remainingDigits.length > 3) {
      result += remainingDigits.slice(0, remainingDigits.length - 3) + ',';
      remainingDigits = remainingDigits.slice(remainingDigits.length - 3);
    }
    
    // Add remaining hundreds
    result += remainingDigits;
    formatted = result;
  }
  
  // Add decimal part if exists
  if (decimalPart) {
    formatted += '.' + decimalPart.slice(0, 2); // Limit to 2 decimal places
  }
  
  return formatted;
};

/**
 * Convert number to words in Indian numbering system
 * Supports up to crores
 */
export const numberToWords = (num: number): string => {
  if (isNaN(num) || num < 0) return 'Zero';
  if (num === 0) return 'Zero';
  
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];
  
  const convertHundreds = (n: number): string => {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result.trim();
  };
  
  // Handle decimal part
  const [integerPart, decimalPart] = num.toFixed(2).split('.');
  const intNum = parseInt(integerPart);
  
  if (intNum === 0) {
    return 'Zero Rupees' + (decimalPart && parseInt(decimalPart) > 0 ? 
           ` and ${convertHundreds(parseInt(decimalPart))} Paise` : '');
  }
  
  let words = '';
  
  // Crores
  if (intNum >= 10000000) {
    words += convertHundreds(Math.floor(intNum / 10000000)) + ' Crore ';
  }
  
  // Lakhs
  const lakhs = Math.floor((intNum % 10000000) / 100000);
  if (lakhs > 0) {
    words += convertHundreds(lakhs) + ' Lakh ';
  }
  
  // Thousands
  const thousands = Math.floor((intNum % 100000) / 1000);
  if (thousands > 0) {
    words += convertHundreds(thousands) + ' Thousand ';
  }
  
  // Hundreds
  const hundreds = intNum % 1000;
  if (hundreds > 0) {
    words += convertHundreds(hundreds);
  }
  
  words = words.trim() + ' Rupees';
  
  // Add paise if decimal part exists and is greater than 0
  if (decimalPart && parseInt(decimalPart) > 0) {
    words += ' and ' + convertHundreds(parseInt(decimalPart)) + ' Paise';
  }
  
  return words.trim();
};

/**
 * Tamil number to words conversion
 */
export const numberToWordsTamil = (num: number): string => {
  if (isNaN(num) || num < 0) return 'பூஜ்யம்';
  if (num === 0) return 'பூஜ்யம்';
  
  const ones = [
    '', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
    'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதின்மூன்று', 'பதினான்கு', 'பதினைந்து', 'பதினாறு',
    'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'
  ];
  
  const tens = [
    '', '', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'
  ];
  
  const convertHundreds = (n: number): string => {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' நூறு ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result.trim();
  };
  
  // Handle decimal part
  const [integerPart, decimalPart] = num.toFixed(2).split('.');
  const intNum = parseInt(integerPart);
  
  if (intNum === 0) {
    return 'பூஜ்யம் ரூபாய்' + (decimalPart && parseInt(decimalPart) > 0 ? 
           ` மற்றும் ${convertHundreds(parseInt(decimalPart))} பைசா` : '');
  }
  
  let words = '';
  
  // Crores (கோடி)
  if (intNum >= 10000000) {
    words += convertHundreds(Math.floor(intNum / 10000000)) + ' கோடி ';
  }
  
  // Lakhs (லட்சம்)
  const lakhs = Math.floor((intNum % 10000000) / 100000);
  if (lakhs > 0) {
    words += convertHundreds(lakhs) + ' லட்சம் ';
  }
  
  // Thousands (ஆயிரம்)
  const thousands = Math.floor((intNum % 100000) / 1000);
  if (thousands > 0) {
    words += convertHundreds(thousands) + ' ஆயிரம் ';
  }
  
  // Hundreds
  const hundreds = intNum % 1000;
  if (hundreds > 0) {
    words += convertHundreds(hundreds);
  }
  
  words = words.trim() + ' ரூபாய்';
  
  // Add paise if decimal part exists and is greater than 0
  if (decimalPart && parseInt(decimalPart) > 0) {
    words += ' மற்றும் ' + convertHundreds(parseInt(decimalPart)) + ' பைசா';
  }
  
  return words.trim();
};
