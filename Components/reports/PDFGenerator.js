
import React from "react";
import { InvokeLLM } from "@/integrations/Core";

export const generatePDFContent = async (reportData, reportType, reportPeriod, sarsCompliance) => {
    const pdfPrompt = `Create a professional ${reportType.replace(/_/g, ' ')} report in HTML format suitable for PDF conversion.

Period: ${reportPeriod}
Data: ${JSON.stringify(reportData)}
SARS Compliance Data (if applicable): ${JSON.stringify(sarsCompliance)}

Requirements:
1. Professional header with "WealthHack Financial Report"
2. Report title and period
3. Executive summary
4. Detailed financial tables with proper formatting
5. Key insights and recommendations
6. Footer with generation date and disclaimer

If SARS Compliance Data is provided, integrate it prominently. For SARS reports, ensure:
- Official SARS header (logo placeholder, document title, tax year).
- Detailed taxpayer information.
- Clear breakdown of income, expenses, and tax calculations (e.g., personal tax, VAT, PAYE).
- Use official SARS terminology and formatting standards (e.g., ZAR currency, decimal places).

Use proper HTML with inline CSS for print-friendly formatting. Include:
- Professional fonts and spacing
- Clear section headers
- Properly formatted currency (ZAR/Rands)
- Tables with borders and alternating row colors
- Page break indicators where appropriate

Return ONLY the HTML content, no markdown code blocks.`;

    const htmlContent = await InvokeLLM({
      prompt: pdfPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          html: { type: "string" },
          title: { type: "string" }
        }
      }
    });
