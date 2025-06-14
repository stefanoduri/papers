
import { RawSheetRow, ProcessedSheetRow } from '../types';

const SHEET_ID = '1YBJk78fDNCZW6ev839_JRS57T4nZi90zLFtomK0qnt4';

// Basic CSV line parser that handles quoted fields (simple version)
function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i+1] === '"') { // Escaped quote ""
                currentField += '"';
                i++; 
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(currentField);
            currentField = "";
        } else {
            currentField += char;
        }
    }
    fields.push(currentField); // Add the last field

    return fields.map(field => {
      let f = field; // Do not trim here, trim after unquoting
      if (f.startsWith('"') && f.endsWith('"')) {
        f = f.substring(1, f.length - 1).replace(/""/g, '"');
      }
      return f.trim(); // Trim after handling quotes
    });
}


export async function fetchSheetData(gid: string): Promise<ProcessedSheetRow[]> {
  const csvExportUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  try {
    const response = await fetch(csvExportUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data (GID: ${gid}): ${response.statusText}`);
    }
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== ''); // Split by newline and remove empty lines

    if (lines.length < 2) {
      throw new Error("CSV data is empty or missing headers.");
    }

    const headerStrings = parseCsvLine(lines[0]);
    const requiredHeaders = {
      titolo: "Titolo",
      autoriFonte: "Autori/Fonte",
      testoSelezionato: "Testo Selezionato",
      words: "Words", 
      link: "Link"
    };

    const columnIndexMap: { [key: string]: number } = {};
    headerStrings.forEach((header, index) => {
      columnIndexMap[header.trim()] = index;
    });

    for (const key in requiredHeaders) {
      const headerName = requiredHeaders[key as keyof typeof requiredHeaders];
      if (columnIndexMap[headerName] === undefined) {
        console.warn(`Required header "${headerName}" not found. Trying to find similar headers. Found:`, headerStrings);
        const foundKey = Object.keys(columnIndexMap).find(h => h.toLowerCase() === headerName.toLowerCase());
        if (foundKey) {
            columnIndexMap[headerName] = columnIndexMap[foundKey];
             console.log(`Found similar header: "${foundKey}" for "${headerName}"`);
        } else {
            throw new Error(`Required header "${headerName}" not found in CSV. Headers found: ${headerStrings.join(', ')}`);
        }
      }
    }
    
    const rawRows: RawSheetRow[] = lines.slice(1).map(line => {
      const values = parseCsvLine(line);
      const row: RawSheetRow = {};
      headerStrings.forEach((header, index) => {
        row[header.trim()] = values[index] || ""; 
      });
      return row;
    });

    return rawRows.map((row, index) => {
      const wordsRaw = row[requiredHeaders.words] || ""; 
      const parsedWords = wordsRaw
        .split(',') 
        .flatMap(phrase => phrase.trim().split(/\s+/)) 
        .map(word => word.toLowerCase())
        .filter(word => word.length > 0);

      return {
        id: row['ID'] || `row-${index}`, 
        titolo: row[requiredHeaders.titolo] || "N/A",
        autoriFonte: row[requiredHeaders.autoriFonte] || "N/A",
        testoSelezionato: row[requiredHeaders.testoSelezionato] || "N/A",
        wordsRaw: wordsRaw,
        link: row[requiredHeaders.link] || "#",
        parsedWords: parsedWords,
      };
    });

  } catch (error) {
    console.error("Error in fetchSheetData:", error);
    throw error; 
  }
}