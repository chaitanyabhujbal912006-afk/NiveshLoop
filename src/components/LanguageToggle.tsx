"use client";

import { useState, useEffect } from "react";
import { Language, getStoredLanguage, setStoredLanguage } from "@/lib/i18n";

interface LanguageToggleProps {
  onLanguageChange?: (lang: Language) => void;
  className?: string;
}

export function LanguageToggle({ onLanguageChange, className = "" }: LanguageToggleProps) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getStoredLanguage());
  }, []);

  function handleToggle(newLang: Language) {
    setLang(newLang);
    setStoredLanguage(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
    // Dispatch custom event so other components update synchronously
    window.dispatchEvent(new CustomEvent("niveshloop_lang_changed", { detail: newLang }));
  }

  return (
    <div
      className={`inline-flex items-center border border-rule/30 bg-paper p-0.5 rounded-sm font-mono text-[10px] uppercase select-none ${className}`}
    >
      <button
        onClick={() => handleToggle("en")}
        className={`px-2 py-0.5 rounded-xs transition-all ${
          lang === "en" ? "bg-ink text-paper font-semibold shadow-xs" : "text-muted hover:text-ink"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleToggle("hi")}
        className={`px-2 py-0.5 rounded-xs transition-all ${
          lang === "hi" ? "bg-stamp text-paper font-semibold shadow-xs" : "text-muted hover:text-ink"
        }`}
      >
        HI (हिंदी)
      </button>
    </div>
  );
}
