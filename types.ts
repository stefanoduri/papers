
export interface RawSheetRow {
  [key: string]: string; // Dynamically keyed by header names
}

export interface ProcessedSheetRow {
  id: string; // A unique identifier for React keys, can be row index or an ID from sheet
  titolo: string;
  autoriFonte: string;
  testoSelezionato: string;
  wordsRaw: string; 
  link: string;
  parsedWords: string[]; // Normalized words from the 'Words' column for filtering
}

export interface WordFrequency {
  word: string;
  frequency: number;
}
