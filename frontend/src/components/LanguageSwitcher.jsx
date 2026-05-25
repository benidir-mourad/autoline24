import { useTranslation } from "react-i18next";

const LANGS = [
    { code: "fr", label: "FR" },
    { code: "nl", label: "NL" },
    { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const current = i18n.language?.slice(0, 2) ?? "fr";

    return (
        <div className="lang-switcher" aria-label="Language">
            {LANGS.map(({ code, label }) => (
                <button
                    key={code}
                    type="button"
                    className={`lang-switcher__btn${current === code ? " is-active" : ""}`}
                    onClick={() => i18n.changeLanguage(code)}
                    aria-pressed={current === code}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
