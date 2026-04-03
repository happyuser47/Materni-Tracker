import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 * Preserves line breaks by detecting Y-coordinate changes between text items.
 * This replicates the output of pdf-parse which the parser depends on.
 */
export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  const maxPages = pdf.numPages;
  let fullText = '';

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Build text with line breaks by tracking Y position changes
    let lastY = null;
    let pageText = '';

    for (const item of content.items) {
      const y = item.transform[5]; // Y position

      // If the Y position changed significantly, insert a newline
      if (lastY !== null && Math.abs(lastY - y) > 2) {
        pageText += '\n';
      }

      pageText += item.str;
      lastY = y;
    }

    fullText += pageText + '\n';
  }

  return fullText;
};

/**
 * Parses OPD report text and extracts patient records.
 * 
 * The OPD PDF has this multi-line structure per patient:
 *   [Age]Years[Female/Male][Phone][Address]
 *   [,Layyah,Layyah]
 *   [13-digit CNIC][MR Number]
 *   [MR continued]
 *   [Patient Name] [SrNo]
 *
 * This parser anchors on the (Female|Male)(03xxxxxxxxx) pattern,
 * then looks ahead for the 13-digit CNIC and the patient name.
 */
export const parseOPDPatients = (fullText) => {
  const patients = [];
  const seen = new Set();

  // Anchor: find every occurrence of Gender+Phone
  const genderPhoneRegex = /(Female|Male)(03\d{9})/g;

  let match;
  while ((match = genderPhoneRegex.exec(fullText)) !== null) {
    const phone = match[2];

    // Look at up to 500 chars after this match for CNIC and Name
    const afterText = fullText.substring(
      match.index + match[0].length,
      Math.min(fullText.length, match.index + match[0].length + 500)
    );

    // Flatten newlines for CNIC search (CNIC may straddle a line break)
    const flat = afterText.replace(/\r?\n/g, ' ');

    // Find the first 13 consecutive digits = CNIC
    const cnicMatch = flat.match(/(\d{13})/);
    if (!cnicMatch) continue;

    const cnic = cnicMatch[1];
    if (seen.has(cnic)) continue;

    // Address = text between the phone and the CNIC
    const cnicIdx = flat.indexOf(cnic);
    let address = flat.substring(0, cnicIdx).trim();
    address = address.replace(/,\s*Layyah.*/i, '').trim();
    if (!address || address.length < 2) address = 'Other';

    // Find the Name: appears on a line AFTER the CNIC+MR block
    const afterCnicText = afterText.substring(afterText.indexOf(cnic) || 0);
    const lines = afterCnicText.split(/\r?\n/);
    let name = 'Unknown';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Skip lines that are part of CNIC/MR number (start with digits or dashes)
      if (trimmed.match(/^\d/) || trimmed.match(/^-/)) continue;

      // This should be the name line: "Balqees Bibi 1   Cetirizine..."
      const nameMatch = trimmed.match(/^([A-Za-z][A-Za-z\s\.]+?)(?:\s+\d|\s{2,})/);
      if (nameMatch) {
        name = nameMatch[1].trim();
      } else if (trimmed.match(/^[A-Za-z]/)) {
        const parts = trimmed.match(/^([A-Za-z][A-Za-z\s\.]+)/);
        if (parts) name = parts[1].trim();
      }
      break;
    }

    if (name === 'Unknown' || name.length < 2) continue;

    // Skip non-patient lines (medicine names, headers, etc.)
    const lower = name.toLowerCase();
    if (lower.includes('patient') || lower.includes('action') ||
        lower.includes('powered') || lower.includes('tablet') ||
        lower.includes('syrup') || lower.includes('capsule') ||
        lower.includes('injection') || lower.includes('infusion')) continue;

    seen.add(cnic);
    patients.push({ name, cnic, phone, address: address.substring(0, 50) });
  }

  return patients;
};
