import React, { useState, useCallback, useContext, useEffect } from 'react';
import CurrencyDesigner from './components/CurrencyDesigner';
import BanknoteDisplay from './components/BanknoteDisplay';
import { generateBanknoteImage } from './services/geminiService';
import { type BanknoteDetails, type HistoryItem } from './types';
import { LogoIcon } from './components/Icons';
import { LanguageProvider, LanguageContext } from './contexts/LanguageContext';
import { translations } from './i18n/translations';
import HistoryPanel from './components/HistoryPanel';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useContext(LanguageContext)!;

    return (
        <div className="relative">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as keyof typeof translations)}
                className="bg-gray-800 border border-gray-600 rounded-md py-1 pl-3 pr-8 text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 appearance-none cursor-pointer"
            >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

const defaultBanknoteDetails: BanknoteDetails = {
  denomination: '100',
  currencySymbol: '₭',
  mainColor: 'Deep Emerald Green',
  centralMotif: 'A majestic snow leopard on a mountain peak',
  backgroundPattern: 'Subtle guilloche and micro-text security patterns',
  symbols: 'Geometric patterns, mountain ranges',
  edgeDetail: 'Intricate guilloche pattern border',
  issuingAuthority: 'Central Bank of Khan',
  issuingLocation: 'Capital City',
  issuingAuthorityFont: 'Cinzel',
  motto: 'Vision & Strength',
  mottoFont: 'Cinzel',
  watermark: 'Subtle portrait of a snow leopard',
  microprinting: 'Fine line text repeating "Central Bank of Khan 100"',
  holographicElement: 'A shimmering mountain peak that changes color with light',
  animatedHologram: true,
  width: '156',
  height: '67',
  serialNumber: 'KHAN0012024A',
  banknoteSeries: 'Series 2024',
  uvInkElement: 'A hidden constellation pattern that glows bright cyan',
  intaglioPrinting: 'The denomination "100" and the central snow leopard have a raised, tactile feel',
  printQuality: 'High Detail',
  metallicGlintEffect: 'Subtle, realistic light reflections on metallic foil areas and gold ink, creating a sense of depth and quality.',
  foilEffect: 'Elegant gold foil applied to the denomination number and the issuing authority\'s seal.',
};


const AppContent: React.FC = () => {
  const { t } = useContext(LanguageContext)!;
  const [banknoteDetails, setBanknoteDetails] = useState<BanknoteDetails>(() => {
    try {
      const savedDesign = localStorage.getItem('savedBanknoteDesign');
      return savedDesign ? JSON.parse(savedDesign) : defaultBanknoteDetails;
    } catch (error) {
      console.error('Failed to parse saved design from localStorage', error);
      return defaultBanknoteDetails;
    }
  });

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('banknoteHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('banknoteHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage', error);
    }
  }, [history]);

  const handleGenerateBanknote = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateBanknoteImage(banknoteDetails, false);
      setGeneratedImage(imageUrl);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        details: banknoteDetails,
        imageUrl,
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
    } catch (err) {
      const errorMessageKey = err instanceof Error ? err.message : 'unknown_error';
      setError(t(errorMessageKey));
    } finally {
      setIsLoading(false);
    }
  }, [banknoteDetails, t]);

  const handlePreviewBanknote = useCallback(async () => {
    setIsPreviewLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateBanknoteImage(banknoteDetails, true);
      setGeneratedImage(imageUrl);
    } catch (err) {
      const errorMessageKey = err instanceof Error ? err.message : 'unknown_error';
      setError(t(errorMessageKey));
    } finally {
      setIsPreviewLoading(false);
    }
  }, [banknoteDetails, t]);

  const handleLoadFromHistory = (item: HistoryItem) => {
    setBanknoteDetails(item.details);
    setGeneratedImage(item.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon />
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {t('appTitle')}
              </h1>
            </div>
            <LanguageSelector />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <CurrencyDesigner
            details={banknoteDetails}
            setDetails={setBanknoteDetails}
            onGenerate={handleGenerateBanknote}
            isLoading={isLoading}
            onPreview={handlePreviewBanknote}
            isPreviewLoading={isPreviewLoading}
          />
          <BanknoteDisplay
            imageUrl={generatedImage}
            isLoading={isLoading || isPreviewLoading}
            error={error}
            animatedHologram={banknoteDetails.animatedHologram}
            onRegenerate={handleGenerateBanknote}
          />
        </div>
        <HistoryPanel
          history={history}
          onLoad={handleLoadFromHistory}
          onDelete={handleDeleteFromHistory}
        />
      </main>
      
      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;