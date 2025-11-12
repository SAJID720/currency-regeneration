import React, { useContext } from 'react';
import { type HistoryItem } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { ClipboardIcon, TrashIcon } from './Icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onDelete }) => {
  const { t } = useContext(LanguageContext)!;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4 text-white">{t('historyTitle')}</h2>
      {history.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-800/20 border border-dashed border-gray-700 rounded-lg p-8">
          <p>{t('historyEmpty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {history.map(item => (
            <div key={item.id} className="group relative bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden transition-all duration-300 hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-900/30">
              <img src={item.imageUrl} alt={`Banknote ${item.details.denomination}`} className="w-full aspect-[16/8] object-cover" />
              <div className="p-3">
                <p className="text-sm font-bold text-white truncate">{item.details.denomination} {item.details.currencySymbol}</p>
                <p className="text-xs text-gray-400 truncate">{item.details.centralMotif}</p>
              </div>
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => onLoad(item)} title={t('historyLoadButton')} className="p-3 bg-emerald-600/80 rounded-full text-white hover:bg-emerald-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <ClipboardIcon />
                </button>
                <button onClick={() => onDelete(item.id)} title={t('historyDeleteButton')} className="p-3 bg-red-600/80 rounded-full text-white hover:bg-red-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
