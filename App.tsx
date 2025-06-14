
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSheetData } from './services/sheetService';
import { ProcessedSheetRow, WordFrequency } from './types';
import WordFrequencyList from './components/WordFrequencyList';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingIndicator from './components/ui/LoadingIndicator';
import ErrorMessage from './components/ui/ErrorMessage';

interface SheetOption {
  name: string;
  gid: string;
  displayLabel: string; // Will include row count once loaded
}

const initialSheetOptions: SheetOption[] = [
  { name: "Gscholar - AI and higher ed", gid: '0', displayLabel: "Gscholar - AI and higher ed" },
  { name: "Gscholar - AI and work", gid: '1904865859', displayLabel: "Gscholar - AI and work" },
];

const App: React.FC = () => {
  const [allRows, setAllRows] = useState<ProcessedSheetRow[]>([]);
  const [wordFrequencies, setWordFrequencies] = useState<WordFrequency[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetDisplayOptions, setSheetDisplayOptions] = useState<SheetOption[]>(initialSheetOptions);
  const [selectedSheetGid, setSelectedSheetGid] = useState<string>(initialSheetOptions[0].gid);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setAllRows([]); 
      setWordFrequencies([]);
      setSelectedWords(new Set());

      // Reset label for the currently loading sheet (in case it had a count from a previous load)
      setSheetDisplayOptions(prevOptions => 
        prevOptions.map(opt => 
          opt.gid === selectedSheetGid ? { ...opt, displayLabel: initialSheetOptions.find(initOpt => initOpt.gid === selectedSheetGid)?.name || opt.name } : opt
        )
      );

      try {
        const rows = await fetchSheetData(selectedSheetGid);
        setAllRows(rows);

        // Update display label with row count for the loaded sheet
        setSheetDisplayOptions(prevOptions => 
            prevOptions.map(opt => 
                opt.gid === selectedSheetGid ? { ...opt, displayLabel: `${opt.name} (${rows.length} righe)` } : opt
            )
        );

        const frequencies: { [key: string]: number } = {};
        rows.forEach(row => {
          row.parsedWords.forEach(word => {
            if (word) { 
                frequencies[word] = (frequencies[word] || 0) + 1;
            }
          });
        });
        
        const sortedFrequencies = Object.entries(frequencies)
          .map(([word, frequency]) => ({ word, frequency }))
          .sort((a, b) => {
            if (b.frequency === a.frequency) {
              return a.word.localeCompare(b.word); 
            }
            return b.frequency - a.frequency; 
          });
        setWordFrequencies(sortedFrequencies);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Si è verificato un errore sconosciuto durante il caricamento dei dati.');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSheetGid]); 

  const handleWordToggle = useCallback((word: string) => {
    setSelectedWords(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(word)) {
        newSelected.delete(word);
      } else {
        newSelected.add(word);
      }
      return newSelected;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedWords(new Set());
  }, []);

  const handleSheetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSheetGid(event.target.value);
  };

  const filteredRows = useMemo(() => {
    if (selectedWords.size === 0) {
      return [];
    }
    return allRows.filter(row => 
      row.parsedWords.some(wordInRow => selectedWords.has(wordInRow))
    );
  }, [allRows, selectedWords]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-700">Ricerca di paper segnalati da Google Scholar</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">Cerca una o più parole, visualizza le relative frequenze e filtra i paper che ne contengono almeno una.</p>
        
        <div className="mt-4 max-w-md mx-auto">
          <label htmlFor="sheet-select" className="block text-sm font-medium text-slate-700 mb-1">
            Seleziona fonte dati:
          </label>
          <select
            id="sheet-select"
            value={selectedSheetGid}
            onChange={handleSheetChange}
            disabled={isLoading}
            className="block w-full p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white disabled:opacity-70 disabled:bg-slate-50"
          >
            {sheetDisplayOptions.map(option => (
              <option key={option.gid} value={option.gid}>
                {option.displayLabel}
              </option>
            ))}
          </select>
        </div>
      </header>

      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && (
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto w-full flex-grow">
          <section className="md:col-span-1 h-full flex flex-col">
            <WordFrequencyList
              wordFrequencies={wordFrequencies}
              selectedWords={selectedWords}
              onWordToggle={handleWordToggle}
              onClearSelection={handleClearSelection}
            />
          </section>
          <section className="md:col-span-2 h-full flex flex-col">
            <ResultsDisplay results={filteredRows} hasSelection={selectedWords.size > 0} />
          </section>
        </main>
      )}
       <footer className="text-center mt-12 py-6 border-t border-slate-300">
        <p className="text-sm text-slate-500">
          Realizzato con React, TypeScript, Tailwind CSS e Google Gemini.
        </p>
      </footer>
    </div>
  );
};

export default App;
