import React from 'react';
import { ProcessedSheetRow } from '../types';

interface ResultsDisplayProps {
  results: ProcessedSheetRow[];
  hasSelection: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, hasSelection }) => {
  if (!hasSelection) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 shadow-lg rounded-xl border border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        <p className="text-slate-500 text-lg text-center">Seleziona una o più parole chiave dalla lista a sinistra per visualizzare i testi correlati.</p>
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 shadow-lg rounded-xl border border-slate-200">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-slate-500 text-lg text-center">Nessun risultato trovato per le parole selezionate.</p>
        <p className="text-sm text-slate-400 mt-1">Prova a modificare la tua selezione.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl border border-slate-200 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-sky-700 mb-4">Risultati Filtrati ({results.length})</h2>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {results.map((row) => (
          <article key={row.id} className="bg-white p-5 shadow-md rounded-lg border border-slate-200 hover:shadow-lg transition-shadow duration-150 ease-in-out">
            <h3 className="text-lg font-semibold text-sky-700 mb-1">{row.titolo}</h3>
            <p className="text-sm text-slate-600 mb-1">
              <strong className="font-medium">Autori/Fonte:</strong> {row.autoriFonte}
            </p>
            {row.testoSelezionato && row.testoSelezionato !== "N/A" && (
                <details className="mt-2 mb-2 group">
                    <summary className="text-sm font-medium text-sky-600 hover:text-sky-800 cursor-pointer list-none group-open:mb-1">
                        Mostra/Nascondi Testo Selezionato
                        <span className="ml-1 group-open:hidden">&darr;</span>
                        <span className="ml-1 hidden group-open:inline">&uarr;</span>
                    </summary>
                    <div className="bg-slate-50 p-3 mt-1 rounded-md border border-slate-200 max-h-48 overflow-y-auto">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{row.testoSelezionato}</p>
                    </div>
                </details>
            )}
            {row.link && row.link !== "#" && (
              <a
                href={row.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-sky-600 hover:text-sky-800 hover:underline transition-colors"
                aria-label={`Maggiori informazioni su ${row.titolo}`}
              >
                Vai al link &rarr;
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;
