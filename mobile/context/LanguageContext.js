/**
 * Language Context
 * Manages app-wide language state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('language');
            if (savedLang && translations[savedLang]) {
                setLanguage(savedLang);
            }
        } catch (error) {
            console.error('Failed to load language:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const changeLanguage = async (langCode) => {
        if (!translations[langCode]) return;

        try {
            setLanguage(langCode);
            await AsyncStorage.setItem('language', langCode);
        } catch (error) {
            console.error('Failed to save language:', error);
        }
    };

    // Translation function
    const t = (key) => {
        const dictionary = translations[language] || translations['en'];
        return dictionary[key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, isLoaded }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
