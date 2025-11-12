import React, { useContext } from 'react';
import { ImageIcon, AlertTriangleIcon, DownloadIcon, RefreshIcon } from './Icons';
import { LanguageContext } from '../contexts/LanguageContext';

interface BanknoteDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  animatedHologram: boolean;
  onRegenerate: () => void;
}

const BanknoteDisplay: React.FC<BanknoteDisplayProps> = ({ imageUrl, isLoading, error, animatedHologram, onRegenerate }) => {
  const { t } = useContext(LanguageContext)!;

  const loadingMessages = React.useMemo(() => [
    t('displayLoading1'),
    t('displayLoading2'),
    t('displayLoading3'),
    t('displayLoading4'),
    t('displayLoading5'),
  ], [t]);

  const [loadingMessage, setLoadingMessage] = React.useState(loadingMessages[0]);

  React.useEffect(() => {
    // FIX: `setInterval` in the browser returns a `number`, not a `NodeJS.Timeout`.
    let interval: number;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0])
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingMessages]);
  
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `khan-banknote-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 h-full">
          <svg className="animate-spin h-12 w-12 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold">{loadingMessage}</p>
          <p className="text-sm">{t('displayLoadingSubtext')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-red-400 bg-red-900/20 p-6 rounded-lg h-full">
          <AlertTriangleIcon />
          <h3 className="text-lg font-bold mt-4 mb-2 text-red-300">{t('displayErrorTitle')}</h3>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (imageUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <div className={`${animatedHologram ? 'holographic-effect' : ''} rounded-lg shadow-2xl shadow-black/50 max-h-[calc(100%-60px)]`}>
            <img
              src={imageUrl}
              alt="Generated Khan banknote"
              className="block w-full h-auto object-contain rounded-lg banknote-image"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500"
            >
              <DownloadIcon />
              {t('downloadButton')}
            </button>
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500"
            >
              <RefreshIcon />
              {t('regenerateButton')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
        <ImageIcon />
        <h3 className="text-lg font-semibold mt-4">{t('displayInitialTitle')}</h3>
        <p className="max-w-xs">{t('displayInitialSubtext')}</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-lg p-4 min-h-[300px] lg:min-h-full flex items-center justify-center aspect-[16/9] lg:aspect-auto">
      {renderContent()}
    </div>
  );
};

export default BanknoteDisplay;