"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Globe, DollarSign } from "lucide-react";
import { updatePreferences, fetchUserProfile } from "@/lib/userApi";
import AuthContext from "@/context/AuthContext";

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

const currencies = [
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
];

export function LanguageCurrencyModal({ open, onOpenChange }) {
  const { user } = useContext(AuthContext);
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [activeTab, setActiveTab] = useState("language");
  const [contentHeight, setContentHeight] = useState(0);
  const languageContentRef = useRef(null);
  const currencyContentRef = useRef(null);

  // Apply change immediately on click
  const handleSelectLanguage = async (code) => {
    setSelectedLanguage(code);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await updatePreferences({ language: code, timezone: tz });
    } catch (e) {
      console.error("Failed to update language", e);
    }
  };

  const handleSelectCurrency = async (code) => {
    setSelectedCurrency(code);
    try {
      await updatePreferences({ currency: code });
    } catch (e) {
      console.error("Failed to update currency", e);
    }
  };

  // Effect to measure and animate height changes
  useEffect(() => {
    if (open) {
      // Initialize selections from latest preferences when modal opens
      (async () => {
        try {
          const profile = await fetchUserProfile();
          const lang = (profile.language || user?.language || selectedLanguage || "fr").toLowerCase();
          const curr = (profile.currency || user?.currency || selectedCurrency || "EUR").toUpperCase();
          // Validate against supported lists
          const supportedLangs = new Set(languages.map(l => l.code));
          const supportedCurrencies = new Set(currencies.map(c => c.code));
          setSelectedLanguage(supportedLangs.has(lang) ? lang : "fr");
          setSelectedCurrency(supportedCurrencies.has(curr) ? curr : "EUR");
        } catch (e) {
          // Fallback to context values if API fails
          if (user?.language) setSelectedLanguage(String(user.language).toLowerCase());
          if (user?.currency) setSelectedCurrency(String(user.currency).toUpperCase());
        }
      })();

      const measureHeight = () => {
        if (activeTab === "language" && languageContentRef.current) {
          setContentHeight(languageContentRef.current.scrollHeight);
        } else if (activeTab === "currency" && currencyContentRef.current) {
          setContentHeight(currencyContentRef.current.scrollHeight);
        }
      };

      // Delay measurement to ensure content is rendered
      setTimeout(measureHeight, 10);
    }
  }, [activeTab, open, user]);

  const handleSave = async () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await updatePreferences({
        language: selectedLanguage,
        currency: selectedCurrency,
        timezone: tz,
      });
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to update preferences", e);
      // Optionally handle UI error state here
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md transition-all duration-300 ease-in-out">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Langue et Devise
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="language" className="flex items-center gap-2 transition-all duration-200">
              <Globe className="h-4 w-4" />
              Langue
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center gap-2 transition-all duration-200">
              <DollarSign className="h-4 w-4" />
              Devise
            </TabsTrigger>
          </TabsList>

          <div 
            className="transition-all duration-300 ease-in-out overflow-hidden"
            style={{ height: contentHeight > 0 ? contentHeight : undefined }}
          >
            <TabsContent 
              value="language" 
              className="mt-4 transition-all duration-300 ease-in-out pb-4"
              ref={languageContentRef}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Choisissez votre langue
                </h3>
                {languages.map((language) => (
                  <div
                    key={language.code}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors duration-200 ease-in-out hover:border-primary/40 ${
                      selectedLanguage === language.code
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border"
                    }`}
                    onClick={() => handleSelectLanguage(language.code)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                    </div>
                    {selectedLanguage === language.code && (
                      <Check className="h-5 w-5 text-primary animate-in fade-in-50 duration-200" />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent 
              value="currency" 
              className="mt-4 transition-all duration-300 ease-in-out pb-4"
              ref={currencyContentRef}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Choisissez votre devise
                </h3>
                {currencies.map((currency) => (
                  <div
                    key={currency.code}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors duration-200 ease-in-out hover:border-primary/40 ${
                      selectedCurrency === currency.code
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border"
                    }`}
                    onClick={() => handleSelectCurrency(currency.code)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currency.flag}</span>
                      <div>
                        <div className="font-medium">{currency.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {currency.code} ({currency.symbol})
                        </div>
                      </div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <Check className="h-5 w-5 text-primary animate-in fade-in-50 duration-200" />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* No action buttons: changes are applied immediately on click */}
      </DialogContent>
    </Dialog>
  );
}
