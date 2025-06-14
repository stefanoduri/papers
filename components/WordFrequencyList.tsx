import React, { useState, useMemo } from 'react';
import { WordFrequency } from '../types';

interface WordFrequencyListProps {
  wordFrequencies: WordFrequency[];
  selectedWords: Set<string>;
  onWordToggle: (word: string) => void;
  onClearSelection: () => void;
}

const WordFrequencyList: React.FC<WordFrequencyListProps> = ({
  wordFrequencies,
  selectedWords,
  onWordToggle,
  onClearSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSuggestionClick = (word: string) => {
    onWordToggle(word);
    // Non resettare searchTerm per permettere selezioni multiple dalla stessa lista
    // setSearchTerm(''); 
  };

  const handleClear = () => {
    onClearSelection();
    setSearchTerm('');
  };

  const suggestions = useMemo(() => {
    if (searchTerm.length < 3) {
      return [];
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return wordFrequencies
      .filter(({ word }) => word.toLowerCase().startsWith(lowerSearchTerm))
      .sort((a, b) => a.word.localeCompare(b.word)) // Sort suggestions alphabetically
      .slice(0, 100); // Limit suggestions for performance
  }, [searchTerm, wordFrequencies]);

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl flex flex-col h-full">
      <h2 className="text-xl font-semibold text-sky-700 mb-4">Seleziona Parole Chiave</h2>

      {selectedWords.size > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Parole selezionate:</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedWords).map(word => (
              <span
                key={word}
                className="flex items-center bg-sky-100 text-sky-700 text-sm font-medium px-2.5 py-1 rounded-full"
              >
                <span className="capitalize">{word}</span>
                <button
                  onClick={() => onWordToggle(word)}
                  className="ml-1.5 text-sky-500 hover:text-sky-700 focus:outline-none"
                  aria-label={`Rimuovi ${word}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Cerca parola (min. 3 caratteri)..."
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow text-orange-600"
          aria-label="Cerca parola chiave"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
        />
        {searchTerm.length > 0 && searchTerm.length < 3 && (
            <div className="absolute z-10 w-full mt-1 text-sm text-slate-500 p-2 bg-white border border-slate-200 rounded-md shadow-sm">
                Digita almeno 3 caratteri...
            </div>
        )}
        {searchTerm.length >= 3 && (
          <ul
            id="suggestions-list"
            className="absolute z-10 w-full bg-white border border-slate-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
          >
            {suggestions.length > 0 ? (
              suggestions.map(({ word, frequency }) => (
                <li
                  key={word}
                  onClick={() => handleSuggestionClick(word)}
                  className={`px-4 py-2.5 hover:bg-sky-50 cursor-pointer capitalize text-slate-700 flex justify-between items-center ${selectedWords.has(word) ? 'bg-sky-100 font-medium' : ''}`}
                  role="option"
                  aria-selected={selectedWords.has(word)} 
                >
                  <span>{word}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedWords.has(word) ? 'text-sky-700 bg-sky-200' : 'text-slate-500 bg-slate-200'}`}>{frequency}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-2.5 text-slate-500">Nessuna parola trovata.</li>
            )}
          </ul>
        )}
      </div>
      
      <div className="mt-auto"> {/* Pushes button to the bottom */}
        <button
          onClick={handleClear}
          disabled={selectedWords.size === 0 && searchTerm === ''}
          className="w-full px-4 py-2.5 text-sm font-medium text-sky-600 bg-sky-100 rounded-lg hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Pulisci Selezione e Ricerca
        </button>
      </div>

       {wordFrequencies.length === 0 && !searchTerm && (
         <p className="text-slate-500 mt-4 text-center">Nessuna parola da analizzare nel dataset.</p>
       )}
    </div>
  );
};

export default WordFrequencyList;