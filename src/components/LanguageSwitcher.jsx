import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('lang', lng);
    };

    return (
        <div className="lang-switcher">
            <button
                className={`lang-btn ${i18n.language === 'uk' ? 'active' : ''}`}
                onClick={() => changeLanguage('uk')}
            >
                UA
            </button>
            <button
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
            >
                EN
            </button>
        </div>
    );
}
