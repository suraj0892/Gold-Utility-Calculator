import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

export interface ExportData {
  title: string;
  principalAmount: number;
  interestRate: number;
  interestPeriod: string;
  startDate: string;
  endDate: string;
  timePeriod: string;
  interestType: string;
  useRounding: boolean;
  interestAmount: number;
  totalAmount: number;
  monthlyBreakdown?: Array<{
    month: string;
    monthNumber: number;
    year: number;
    daysInMonth: number;
    monthlyInterest: number;
    cumulativeInterest: number;
  }>;
}

// Format number in Indian format with currency symbol (safe for PDF)
const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Format number without currency (for better PDF compatibility)
const formatNumber = (amount: number): string => {
  return amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Simple number formatting for PDF (avoiding locale issues)
const formatNumberForPDF = (amount: number): string => {
  // Format number with commas in Indian style
  const parts = amount.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add commas in Indian style (last 3 digits, then every 2 digits)
  let formattedInteger = '';
  if (integerPart.length <= 3) {
    formattedInteger = integerPart;
  } else {
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    const chunks = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      chunks.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    formattedInteger = chunks.join(',') + ',' + lastThree;
  }
  
  return `${formattedInteger}.${decimalPart}`;
};

// Export results section as PNG
export const exportToPNG = async (elementId: string, filename: string = 'interest-calculation'): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found for export');
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: false,
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
    });

    // Convert canvas to blob and save
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}.png`);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw error;
  }
};

// Export results as PDF
export const exportToPDF = async (data: ExportData, filename: string = 'interest-calculation'): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with auto wrap and better encoding
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color[0], color[1], color[2]);
      
      // Clean the text to avoid encoding issues
      const cleanText = text.replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII characters if any
      const safeText = cleanText || text; // Fallback to original if cleaning removes everything
      
      const lines = pdf.splitTextToSize(safeText, contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.4;
      });
      yPosition += 5; // Extra space after text block
    };

    // Header
    addText('Interest Calculator Results', 18, true, [156, 124, 56]);
    yPosition += 5;

    // Add a line separator
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Input Values Section
    addText('Input Values:', 14, true, [142, 89, 36]);
    addText(`Principal Amount: Rs. ${formatNumberForPDF(data.principalAmount)}`);
    addText(`Interest Rate: ${data.interestRate}% ${data.interestPeriod}`);
    addText(`Start Date: ${data.startDate}`);
    addText(`End Date: ${data.endDate}`);
    addText(`Time Period: ${data.timePeriod}`);
    addText(`Interest Type: ${data.interestType}`);
    addText(`Rounding: ${data.useRounding ? 'Yes (Round days to months)' : 'No (Exact calculation)'}`);
    yPosition += 5;

    // Results Section
    addText('Calculation Results:', 14, true, [142, 89, 36]);
    addText(`Interest Amount: Rs. ${formatNumberForPDF(data.interestAmount)}`);
    addText(`Total Amount: Rs. ${formatNumberForPDF(data.totalAmount)}`, 12, true, [156, 124, 56]);
    yPosition += 5;

    // Monthly Breakdown (if available)
    if (data.monthlyBreakdown && data.monthlyBreakdown.length > 0) {
      addText('Monthly Breakdown:', 14, true, [142, 89, 36]);
      yPosition += 5;

      // Table headers
      const headers = ['Month', 'Days', 'Monthly Interest', 'Cumulative Interest'];
      const columnWidths = [40, 20, 50, 50];
      const tableStartX = margin;
      
      // Header row
      pdf.setFillColor(248, 246, 236);
      pdf.rect(tableStartX, yPosition - 5, contentWidth, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      
      let xPosition = tableStartX + 2;
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 10;

      // Data rows
      pdf.setFont('helvetica', 'normal');
      data.monthlyBreakdown.forEach((month, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
          
          // Repeat headers on new page
          pdf.setFillColor(248, 246, 236);
          pdf.rect(tableStartX, yPosition - 5, contentWidth, 10, 'F');
          pdf.setFont('helvetica', 'bold');
          xPosition = tableStartX + 2;
          headers.forEach((header, hIndex) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += columnWidths[hIndex];
          });
          yPosition += 10;
          pdf.setFont('helvetica', 'normal');
        }

        // Alternate row coloring
        if (index % 2 === 1) {
          pdf.setFillColor(252, 252, 252);
          pdf.rect(tableStartX, yPosition - 5, contentWidth, 8, 'F');
        }

        xPosition = tableStartX + 2;
        const rowData = [
          `${month.month} ${month.year}`,
          month.daysInMonth.toString(),
          `Rs. ${formatNumberForPDF(month.monthlyInterest)}`,
          `Rs. ${formatNumberForPDF(month.cumulativeInterest)}`
        ];

        rowData.forEach((data, colIndex) => {
          // Clean text for better PDF compatibility
          const cleanData = data.replace(/[^\x00-\x7F]/g, '') || data;
          pdf.text(cleanData, xPosition, yPosition);
          xPosition += columnWidths[colIndex];
        });
        yPosition += 8;
      });
    }

    // Footer
    yPosition = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, margin, yPosition);
    pdf.text('Gold Utility Calculator - Interest Calculator', pageWidth - margin - 60, yPosition);

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

// Export both PNG and PDF
export const exportBoth = async (elementId: string, data: ExportData, filename: string = 'interest-calculation'): Promise<void> => {
  try {
    await Promise.all([
      exportToPNG(elementId, filename),
      exportToPDF(data, filename)
    ]);
  } catch (error) {
    console.error('Error exporting both formats:', error);
    throw error;
  }
};
