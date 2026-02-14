import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import uk from './uk.json';

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        uk: { translation: uk },
    },
    lng: localStorage.getItem('lang') || 'uk',
    fallbackLng: 'uk',
    interpolation: {
        escapeValue: false,
    },
    saveMissing: false,
    missingKeyHandler: false,
});

export default i18n;
