import { useState, useCallback } from 'react';
import { t, getLang, setLang, Lang, getAvailableLanguages } from './index';

export function useTranslation() {
  const [, setTick] = useState(0);

  const changeLang = useCallback((lang: Lang) => {
    setLang(lang);
    setTick(t => t + 1); // force re-render
  }, []);

  return { t, lang: getLang(), changeLang, languages: getAvailableLanguages() };
}
