import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSheetData } from './services/sheetService';
import { ProcessedSheetRow, WordFrequency } from './types';
import WordFrequencyList from './components/WordFrequencyList';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingIndicator from './components/ui/LoadingIndicator';
import ErrorMessage from './components/ui/ErrorMessage';

const App: React.FC = () => {
  const [allRows, setAllRows] = useState<ProcessedSheetRow[]>([]);
  const [wordFrequencies, setWordFrequencies] = useState<WordFrequency[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const rows = await fetchSheetData();
        setAllRows(rows);

        const frequencies: { [key: string]: number } = {};
        rows.forEach(row => {
          row.parsedWords.forEach(word => {
            if (word) { // Ensure word is not empty
                frequencies[word] = (frequencies[word] || 0) + 1;
            }
          });
        });
        
        const sortedFrequencies = Object.entries(frequencies)
          .map(([word, frequency]) => ({ word, frequency }))
          .sort((a, b) => {
            if (b.frequency === a.frequency) {
              return a.word.localeCompare(b.word); // Alphabetical for ties
            }
            return b.frequency - a.frequency; // Descending frequency
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
  }, []);

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
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-700">Ricerca di paper segnalati da Google Scholar</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">Cerca una o più parole, visualizza le relative frequenze e filtra i paper che ne contengono almeno una</p>
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
