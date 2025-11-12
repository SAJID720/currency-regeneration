import React, { useContext, useState, useEffect } from 'react';
import { type BanknoteDetails } from '../types';
import { SparklesIcon, SaveIcon, DiceIcon, EyeIcon } from './Icons';
import { LanguageContext } from '../contexts/LanguageContext';

interface CurrencyDesignerProps {
  details: BanknoteDetails;
  setDetails: React.Dispatch<React.SetStateAction<BanknoteDetails>>;
  onGenerate: () => void;
  isLoading: boolean;
  onPreview: () => void;
  isPreviewLoading: boolean;
}

const FONT_OPTIONS = [
  { name: 'Cinzel', style: { fontFamily: 'Cinzel, serif' } },
  { name: 'Orbitron', style: { fontFamily: 'Orbitron, sans-serif' } },
  { name: 'Dancing Script', style: { fontFamily: '"Dancing Script", cursive' } },
  { name: 'UnifrakturMaguntia', style: { fontFamily: 'UnifrakturMaguntia, cursive' } },
];

const PALETTES = [
    { name: 'emerald_gold', description: 'A classic and prestigious palette of deep emerald green, rich cream, and metallic gold highlights.', colors: ['#046307', '#F5F5DC', '#FFD700'] },
    { name: 'sapphire_silver', description: 'A modern and sleek palette of deep sapphire blue, cool gray, and polished silver accents.', colors: ['#0F52BA', '#A9A9A9', '#C0C0C0'] },
    { name: 'ruby_bronze', description: 'A warm and regal palette of deep ruby red, warm beige, and burnished bronze details.', colors: ['#9B111E', '#F5F5DC', '#CD7F32'] },
    { name: 'amethyst_platinum', description: 'An elegant and sophisticated palette of royal amethyst purple, soft lavender, and shimmering platinum.', colors: ['#9966CC', '#E6E6FA', '#E5E4E2'] },
    { name: 'sunset_glow', description: 'A vibrant and energetic palette of sunset orange, bright yellow, and deep magenta.', colors: ['#FD5E53', '#FFC300', '#C71585'] },
];

const QUALITY_OPTIONS = ['Standard', 'High Detail', 'Ultra Realistic'];

const DENOMINATION_PRESETS = ['1', '5', '10', '20', '50', '100', '500'];


const InputField: React.FC<{
  id: keyof BanknoteDetails;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  as?: 'textarea';
  type?: string;
  tooltipText?: string;
}> = ({ id, label, value, onChange, placeholder, as = 'input', type = 'text', tooltipText }) => {
  const commonProps = {
    id,
    name: id,
    value,
    onChange,
    placeholder,
    className: "w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200",
  };

  return (
    <div data-tooltip={tooltipText}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea {...commonProps} rows={2} />
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
};

const SelectField: React.FC<{
  id: keyof BanknoteDetails;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { name: string; style: React.CSSProperties }[];
  tooltipText?: string;
}> = ({ id, label, value, onChange, options, tooltipText }) => {
  return (
    <div data-tooltip={tooltipText}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 appearance-none"
        style={options.find(opt => opt.name === value)?.style || {}}
      >
        {options.map(option => (
          <option key={option.name} value={option.name} style={option.style}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const ToggleSwitch: React.FC<{
  id: keyof BanknoteDetails;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltipText?: string;
}> = ({ id, label, checked, onChange, tooltipText }) => {
  return (
    <div data-tooltip={tooltipText} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-md">
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label}
      </label>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          name={id}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  );
};

const ColorPaletteSelector: React.FC<{
    currentValue: string;
    onSelect: (value: string) => void;
    tooltipText?: string;
}> = ({ currentValue, onSelect, tooltipText }) => {
    const { t } = useContext(LanguageContext)!;
    return (
        <div data-tooltip={tooltipText}>
            <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('colorPaletteTitle')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {PALETTES.map(palette => (
                    <button
                        key={palette.name}
                        type="button"
                        onClick={() => onSelect(palette.description)}
                        className={`p-2 rounded-md text-left transition-all duration-200 border-2 ${currentValue === palette.description ? 'border-emerald-500 bg-emerald-900/50' : 'border-gray-600 bg-gray-800 hover:border-gray-500'}`}
                    >
                        <div className="flex space-x-1 mb-1">
                            {palette.colors.map((color, index) => (
                                <div key={index} className="h-2 w-full rounded-full" style={{ backgroundColor: color }} />
                            ))}
                        </div>
                        <span className="text-xs text-gray-200">{t(`palette_${palette.name}`)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const generateRandomSerialNumber = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
    const randomNum = () => Math.floor(Math.random() * 10);

    const part1 = randomChar() + randomChar();
    const part2 = Array(8).fill(0).map(randomNum).join('');
    const part3 = randomChar();

    return `${part1}${part2}${part3}`;
};


const CurrencyDesigner: React.FC<CurrencyDesignerProps> = ({ details, setDetails, onGenerate, isLoading, onPreview, isPreviewLoading }) => {
  const { t } = useContext(LanguageContext)!;
  const [saveButtonText, setSaveButtonText] = useState(t('saveButton'));
  
  useEffect(() => {
    setSaveButtonText(t('saveButton'));
  }, [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setDetails(prev => ({ ...prev, [name]: checked }));
    } else {
      setDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePaletteSelect = (value: string) => {
    setDetails(prev => ({ ...prev, mainColor: value }));
  };
  
  const handleSaveDesign = () => {
    try {
      localStorage.setItem('savedBanknoteDesign', JSON.stringify(details));
      setSaveButtonText(t('savedButton'));
      setTimeout(() => {
        setSaveButtonText(t('saveButton'));
      }, 2000);
    } catch (error) {
      console.error('Failed to save design to localStorage', error);
      // You could add user-facing error feedback here if needed
    }
  };

  const handleGenerateSerialNumber = () => {
    setDetails(prev => ({ ...prev, serialNumber: generateRandomSerialNumber() }));
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-1 text-white">{t('designerTitle')}</h2>
      <p className="text-gray-400 mb-6">{t('designerDescription')}</p>
      
      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <InputField id="currencySymbol" label={t('symbolLabel')} value={details.currencySymbol} onChange={handleChange} placeholder="e.g., $" tooltipText={t('tooltip_symbolLabel')} />
                </div>
                <div className="col-span-3">
                  <InputField id="denomination" label={t('denominationLabel')} value={details.denomination} onChange={handleChange} placeholder="e.g., 50" tooltipText={t('tooltip_denominationLabel')} />
                </div>
              </div>
              <div className="mt-3" data-tooltip={t('tooltip_denominationPresetsTitle')}>
                  <div className="flex items-center gap-2 flex-wrap">
                      {DENOMINATION_PRESETS.map(preset => (
                          <button
                              key={preset}
                              type="button"
                              onClick={() => setDetails(prev => ({ ...prev, denomination: preset }))}
                              className={`py-1 px-3 rounded-full text-center transition-colors duration-200 border text-xs ${details.denomination === preset ? 'border-emerald-600 bg-emerald-900/50 font-semibold text-emerald-300' : 'border-gray-600 bg-gray-800 hover:border-gray-500 text-gray-300'}`}
                          >
                              {preset}
                          </button>
                      ))}
                  </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <ColorPaletteSelector currentValue={details.mainColor} onSelect={handlePaletteSelect} tooltipText={t('tooltip_colorPaletteTitle')} />
              <InputField id="mainColor" label={t('mainColorLabel')} value={details.mainColor} onChange={handleChange} placeholder="e.g., Royal Blue and Silver" as="textarea" tooltipText={t('tooltip_mainColorLabel')} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField id="width" label={t('widthLabel')} value={details.width} onChange={handleChange} placeholder="e.g., 156" type="number" tooltipText={t('tooltip_widthLabel')} />
          <InputField id="height" label={t('heightLabel')} value={details.height} onChange={handleChange} placeholder="e.g., 67" type="number" tooltipText={t('tooltip_heightLabel')} />
          <div data-tooltip={t('tooltip_printQualityLabel')}>
            <label htmlFor="printQuality" className="block text-sm font-medium text-gray-400 mb-1">
                {t('printQualityLabel')}
            </label>
            <select
                id="printQuality"
                name="printQuality"
                value={details.printQuality}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
            >
                {QUALITY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                        {t(`quality_${option.toLowerCase().replace(' ', '_')}`)}
                    </option>
                ))}
            </select>
          </div>
        </div>

        <InputField id="centralMotif" label={t('centralMotifLabel')} value={details.centralMotif} onChange={handleChange} placeholder="e.g., A wise owl holding a key" as="textarea" tooltipText={t('tooltip_centralMotifLabel')} />
        <InputField id="backgroundPattern" label={t('backgroundPatternLabel')} value={details.backgroundPattern} onChange={handleChange} placeholder="e.g., Renaissance-inspired filigree" as="textarea" tooltipText={t('tooltip_backgroundPatternLabel')} />
        <InputField id="symbols" label={t('symbolsLabel')} value={details.symbols} onChange={handleChange} placeholder="e.g., Laurel wreaths, digital circuits" as="textarea" tooltipText={t('tooltip_symbolsLabel')} />
        <InputField id="edgeDetail" label={t('edgeDetailLabel')} value={details.edgeDetail} onChange={handleChange} placeholder="e.g., Ornate floral border, coin-edge pattern" as="textarea" tooltipText={t('tooltip_edgeDetailLabel')} />
        
        <div className="border-t border-gray-700 pt-4">
            <div data-tooltip={t('tooltip_securityFeaturesTitle')} className="inline-block">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">{t('securityFeaturesTitle')}</h3>
            </div>
            <div className="space-y-4">
                <InputField id="watermark" label={t('watermarkLabel')} value={details.watermark} onChange={handleChange} placeholder="e.g., Portrait of an eagle" as="textarea" tooltipText={t('tooltip_watermarkLabel')} />
                <InputField id="microprinting" label={t('microprintingLabel')} value={details.microprinting} onChange={handleChange} placeholder="e.g., The nation's motto in tiny letters" as="textarea" tooltipText={t('tooltip_microprintingLabel')} />
                <InputField id="holographicElement" label={t('holographicElementLabel')} value={details.holographicElement} onChange={handleChange} placeholder="e.g., A color-shifting national flower" as="textarea" tooltipText={t('tooltip_holographicElementLabel')} />
                <ToggleSwitch id="animatedHologram" label={t('animatedHologramLabel')} checked={details.animatedHologram} onChange={handleChange} tooltipText={t('tooltip_animatedHologramLabel')} />
                <InputField id="foilEffect" label={t('foilEffectLabel')} value={details.foilEffect} onChange={handleChange} placeholder="e.g., Gold foil on the denomination" as="textarea" tooltipText={t('tooltip_foilEffectLabel')} />
                <InputField id="metallicGlintEffect" label={t('metallicGlintEffectLabel')} value={details.metallicGlintEffect} onChange={handleChange} placeholder="e.g., Bright highlights on gold foil" as="textarea" tooltipText={t('tooltip_metallicGlintEffectLabel')} />
                <InputField id="uvInkElement" label={t('uvInkElementLabel')} value={details.uvInkElement} onChange={handleChange} placeholder="e.g., Hidden patterns visible under UV light" as="textarea" tooltipText={t('tooltip_uvInkElementLabel')} />
                <InputField id="intaglioPrinting" label={t('intaglioPrintingLabel')} value={details.intaglioPrinting} onChange={handleChange} placeholder="e.g., Raised ink on the denomination and portrait" as="textarea" tooltipText={t('tooltip_intaglioPrintingLabel')} />
            </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
             <div data-tooltip={t('tooltip_textElementsTitle')} className="inline-block">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">{t('textElementsTitle')}</h3>
             </div>
             <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <InputField id="serialNumber" label={t('serialNumberLabel')} value={details.serialNumber} onChange={handleChange} placeholder="e.g., AB12345678CD" tooltipText={t('tooltip_serialNumberLabel')} />
                </div>
                <button
                    type="button"
                    onClick={handleGenerateSerialNumber}
                    data-tooltip={t('tooltip_autoGenerateSerial')}
                    aria-label={t('tooltip_autoGenerateSerial')}
                    className="p-2 h-[42px] bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500"
                >
                    <DiceIcon />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputField id="issuingAuthority" label={t('issuingAuthorityLabel')} value={details.issuingAuthority} onChange={handleChange} placeholder="e.g., The Sovereign Mint" tooltipText={t('tooltip_issuingAuthorityLabel')} />
                <InputField id="issuingLocation" label={t('issuingLocationLabel')} value={details.issuingLocation} onChange={handleChange} placeholder="e.g., Capital City" tooltipText={t('tooltip_issuingLocationLabel')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputField id="banknoteSeries" label={t('banknoteSeriesLabel')} value={details.banknoteSeries} onChange={handleChange} placeholder="e.g., Series 2024" tooltipText={t('tooltip_banknoteSeriesLabel')} />
                <InputField id="motto" label={t('mottoLabel')} value={details.motto} onChange={handleChange} placeholder="e.g., Knowledge is Wealth" tooltipText={t('tooltip_mottoLabel')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <SelectField id="issuingAuthorityFont" label={t('authorityFontLabel')} value={details.issuingAuthorityFont} onChange={handleChange} options={FONT_OPTIONS} tooltipText={t('tooltip_authorityFontLabel')} />
                <SelectField id="mottoFont" label={t('mottoFontLabel')} value={details.mottoFont} onChange={handleChange} options={FONT_OPTIONS} tooltipText={t('tooltip_mottoFontLabel')} />
            </div>
        </div>
        
        <div className="pt-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSaveDesign}
              data-tooltip={t('tooltip_saveButton')}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500"
            >
              <SaveIcon />
              {saveButtonText}
            </button>
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={onPreview}
                    disabled={isLoading || isPreviewLoading}
                    data-tooltip={t('tooltip_previewButton')}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500"
                >
                    {isPreviewLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('previewingButton')}
                    </>
                    ) : (
                    <>
                        <EyeIcon />
                        {t('previewButton')}
                    </>
                    )}
                </button>
                <button
                    type="submit"
                    disabled={isLoading || isPreviewLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('generatingButton')}
                    </>
                    ) : (
                    <>
                        <SparklesIcon />
                        {t('generateButton')}
                    </>
                    )}
                </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CurrencyDesigner;