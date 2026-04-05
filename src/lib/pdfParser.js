import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 * Preserves line breaks by detecting Y-coordinate changes between text items.
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

    let lastY = null;
    let pageText = '';

    for (const item of content.items) {
      const y = item.transform[5];

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

/** DD-MM-YYYY (report) → YYYY-MM-DD for DB */
export const parseDdMmYyyyToIso = (raw) => {
  const m = String(raw).trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!m) return '';
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return '';
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

/** HISDU "Maternal Health Register / Antenatal Care" PDFs from MNHC reports */
export const isMaternalHealthRegisterPdf = (fullText) =>
  /Maternal Health Register/i.test(fullText) &&
  (/Antenatal Care|\(ANC\)/i.test(fullText) || /SrNo\.\s*Visit Date/i.test(fullText));

/**
 * SrNo + 13-digit CNIC + 11-digit mobile (03…).
 * pdf.js often glues "PM" + serial ("PM1 322…") and phone + MR ("…903025-877…"), so we cannot require
 * a newline before SrNo or a non-digit after the phone — use fixed-length phone (03 + 9 digits).
 */
const MATERNAL_CNIC_ROW = /(?:^|[^\d])(\d{1,3})\s+(\d{13})\s+(03\d{9})/g;

const SKIP_LINE = (line) =>
  /^(Powered By|Electronically system-generated|-- \d+ of \d+ --|Page \d+ of \d+)/i.test(line) ||
  /DateVisit|HB EDDAddress|CNIC Contact No\.?MR|Visit Date & timeCNIC/i.test(line) ||
  (/^(TT-\d|Visit Type|HB EDD|MRNumber|SrNo\.|CNIC Contact)/i.test(line) && !/[a-z]{2,}/i.test(line));

const isHeaderNoise = (line) =>
  /^Primary & Secondary|^Healthcare Department|^MNHC,|^Report Date:|^Maternal Health Register$|^Antenatal Care|^Total Records:/i.test(line) ||
  /^TT-3 Date/i.test(line) ||
  (/^TT-\d/i.test(line) && /Visit Type|HB EDD/i.test(line));

/** MR / footer numeric fragments between CNIC row and next patient */
const isMrOrNumericFragment = (line) => {
  if (/^\d{1,3}$/.test(line)) return true;
  if (/\d{3,}-\d+-\d{4}/.test(line)) return true;
  if (/^\d{2}-\d{2}$/.test(line)) return true;
  return false;
};

const isNameBlockNoise = (line) =>
  /DateVisit|HB EDD|Address Age|Name with Father|^\/?Husband$|^Husband$|MRNumber|CNIC Contact|Visit Date & time|SrNo\./i.test(
    line
  );

/**
 * Parses MNHC / HISDU maternal register text: full name, CNIC, address, contact, EDD.
 * Deduplicates by CNIC (later row wins — typically the latest visit in the export).
 */
export const parseMaternalHealthRegisterPatients = (fullText) => {
  const normalized = fullText.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const matches = [...normalized.matchAll(MATERNAL_CNIC_ROW)];
  if (!matches.length) return [];

  const byCnic = new Map();

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const prevEnd = i === 0 ? 0 : matches[i - 1].index + matches[i - 1][0].length;
    const block = normalized
      .slice(prevEnd, match.index)
      // pdf.js glues "Years" to the next token (e.g. "Yearskts,Layyah")
      .replace(/Years(?=[A-Za-z(])/g, 'Years ');

    const cnic = match[2];
    const phone = match[3];

    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((line) => !SKIP_LINE(line))
      .filter((line) => !isHeaderNoise(line))
      .filter((line) => !isMrOrNumericFragment(line));

    const nameParts = [];
    let afterYears = '';

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];

      const combined = /^(.+?)\s+(\d+\.?\d*)\s*Years\s*(.*)$/i.exec(line);
      if (combined && /[A-Za-z]/.test(combined[1])) {
        nameParts.length = 0;
        nameParts.push(combined[1].trim());
        afterYears = [combined[3], ...lines.slice(li + 1)].join('\n');
        break;
      }

      const yearsOnly = /^(\d+\.?\d*)\s*Years\s*(.*)$/i.exec(line);
      if (yearsOnly) {
        nameParts.length = 0;
        for (let j = 0; j < li; j++) {
          const lj = lines[j];
          if (isNameBlockNoise(lj)) continue;
          nameParts.push(lj);
        }
        afterYears = [yearsOnly[2], ...lines.slice(li + 1)].join('\n');
        break;
      }

      if (/^Primary & Secondary|^Healthcare Department|^Report Date:|^Total Records:/i.test(line)) continue;
      if (isNameBlockNoise(line)) continue;
      nameParts.push(line);
    }

    let name = nameParts.join(' ').replace(/\s+/g, ' ').trim();
    if (name.length > 120) {
      name = name.slice(0, 120).trim();
    }

    if (name.length < 3 || !/[A-Za-z]/.test(name)) continue;

    const lower = name.toLowerCase();
    if (
      lower.includes('patient') ||
      lower.includes('tablet') ||
      lower.includes('syrup') ||
      lower.includes('healthcare department') ||
      lower.includes('maternal health register')
    ) {
      continue;
    }

    // pdf.js glues EDD year to HB: "09-07-202610 ANC" / "10-09-202610.3 ANC" — breaks \b after YYYY.
    const afterYearsSoft = afterYears
      .replace(/(\d{4})(\d{1,2}\.\d+\s+ANC-\d)/gi, '$1 $2')
      .replace(/(\d{4})(\d{1,2}\s+ANC-\d)/gi, '$1 $2')
      .replace(/Layy\s*\n\s*ah/gi, 'Layyah');

    // EDD is the first DD-MM-YYYY that is immediately followed by HB (e.g. 10.3) or ANC-n, not a lone TT date.
    let eddIso = '';
    let eddMatch = null;
    const dateRe = /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/g;
    let dm;
    while ((dm = dateRe.exec(afterYearsSoft)) !== null) {
      const tail = afterYearsSoft.slice(dm.index + dm[0].length, dm.index + dm[0].length + 36);
      // Row tail is usually "… EDD [HB] ANC-n …" — HB may be "10.3" or glued "202610 ANC" → "10 ANC"
      if (
        /\d+\.\d+\s+ANC-\d/i.test(tail) ||
        /\b\d{1,2}\s+ANC-\d/i.test(tail) ||
        /\d+\.?\d*\s+N\/A\s+ANC-\d/i.test(tail)
      ) {
        eddMatch = dm[0];
        eddIso = parseDdMmYyyyToIso(dm[0]);
        break;
      }
    }
    if (!eddIso) {
      const fallback = afterYearsSoft.match(/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/);
      if (fallback) {
        eddMatch = fallback[0];
        eddIso = parseDdMmYyyyToIso(fallback[0]);
      }
    }

    let address = '';
    if (eddMatch) {
      const idx = afterYearsSoft.indexOf(eddMatch);
      address = afterYearsSoft.slice(0, idx).trim();
    } else {
      address = afterYears.split(/\d{1,2}\/\d{1,2}\/\d{4}/)[0].trim();
    }

    address = address
      .replace(/\s+/g, ' ')
      .replace(/,\s*Layyah,\s*Layyah/gi, ', Layyah')
      .trim();

    if (!address || address.length < 2) address = 'Other';
    if (address.length > 200) address = address.slice(0, 200);

    if (!eddIso) continue;

    byCnic.set(cnic, {
      name,
      cnic,
      phone,
      address,
      eddIso,
    });
  }

  return [...byCnic.values()];
};

/**
 * Legacy OPD report (Female + 03 phone + CNIC layout).
 */
export const parseOPDPatients = (fullText) => {
  const patients = [];
  const seen = new Set();

  const genderPhoneRegex = /(Female)(03\d{9})/g;

  let match;
  while ((match = genderPhoneRegex.exec(fullText)) !== null) {
    const phone = match[2];

    const afterText = fullText.substring(
      match.index + match[0].length,
      Math.min(fullText.length, match.index + match[0].length + 500)
    );

    const flat = afterText.replace(/\r?\n/g, ' ');

    const cnicMatch = flat.match(/(\d{13})/);
    if (!cnicMatch) continue;

    const cnic = cnicMatch[1];
    if (seen.has(cnic)) continue;

    const cnicIdx = flat.indexOf(cnic);
    let address = flat.substring(0, cnicIdx).trim();
    address = address.replace(/,\s*Layyah.*/i, '').trim();
    if (!address || address.length < 2) address = 'Other';

    const afterCnicText = afterText.substring(afterText.indexOf(cnic) || 0);
    const lines = afterCnicText.split(/\r?\n/);
    let name = 'Unknown';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.match(/^\d/) || trimmed.match(/^-/)) continue;

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

    const lower = name.toLowerCase();
    if (
      lower.includes('patient') ||
      lower.includes('action') ||
      lower.includes('powered') ||
      lower.includes('tablet') ||
      lower.includes('syrup') ||
      lower.includes('capsule') ||
      lower.includes('injection') ||
      lower.includes('infusion')
    ) {
      continue;
    }

    seen.add(cnic);
    patients.push({ name, cnic, phone, address: address.substring(0, 50), eddIso: '' });
  }

  return patients;
};

/**
 * Choose parser: MNHC maternal register first, then legacy OPD.
 */
export const parsePdfPatientsForImport = (fullText) => {
  if (isMaternalHealthRegisterPdf(fullText)) {
    const maternal = parseMaternalHealthRegisterPatients(fullText);
    if (maternal.length) return { format: 'maternal', patients: maternal };
    return { format: 'maternal', patients: [], parseError: 'maternal_marker_but_no_rows' };
  }

  const opd = parseOPDPatients(fullText);
  if (opd.length) return { format: 'opd', patients: opd };
  return { format: null, patients: [] };
};
