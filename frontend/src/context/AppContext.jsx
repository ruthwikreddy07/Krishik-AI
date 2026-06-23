import React, { createContext, useState, useEffect } from 'react';
import { getFarmerProfile } from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('farmer_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('farmer_token') || null);
  const [language, setLanguageState] = useState(() => localStorage.getItem('farmer_lang') || 'en'); // Default to English
  const [theme, setThemeState] = useState(() => localStorage.getItem('farmer_theme') || 'dark');

  // Handle language updates
  const setLanguage = (lang) => {
    localStorage.setItem('farmer_lang', lang);
    setLanguageState(lang);
  };

  // Handle theme updates
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('farmer_theme', newTheme);
    setThemeState(newTheme);
  };

  const login = (userData, authToken) => {
    localStorage.setItem('farmer_user', JSON.stringify(userData));
    localStorage.setItem('farmer_token', authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('farmer_user');
    localStorage.removeItem('farmer_token');
    setUser(null);
    setToken(null);
  };

  // Enrich user profile from backend after login to get GPS coords and DB fields
  useEffect(() => {
    if (user?.id && user.id !== 0 && token) {
      getFarmerProfile(user.id)
        .then((profile) => {
          const enriched = {
            ...user,
            name: profile.name,
            village: profile.village,
            mandal: profile.mandal,
            district: profile.district,
            landSize: String(profile.land_size_acres),
            soilType: profile.soil_type,
            waterSource: profile.water_source,
            latitude: profile.latitude,
            longitude: profile.longitude,
            isVerified: profile.is_verified,
          };
          // Update localStorage so it persists across refreshes
          localStorage.setItem('farmer_user', JSON.stringify(enriched));
          setUser(enriched);
        })
        .catch(() => {
          // If profile fetch fails (e.g. backend down), keep existing data
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  // Translations object
  const t = {
    en: {
      appName: "Krishik AI",
      tagline: "24/7 AI-Powered Personal Farming Assistant",
      dashboard: "Dashboard",
      myFarm: "My Farm",
      cropManagement: "Crop Management",
      diseaseScanner: "Disease Scanner",
      weather: "Weather Analytics",
      marketIntelligence: "Market Intel",
      govSchemes: "Gov Schemes",
      aiChatbot: "AI Chatbot",
      notifications: "Notifications",
      pestRisk: "Pest Risk Forecast",
      profile: "Profile Settings",
      logout: "Logout",
      loginTitle: "Farmer Registration & Login",
      enterMobile: "Enter Mobile Number",
      sendOtp: "Send OTP Verification",
      enterOtp: "Enter Verification Code",
      verifyOtp: "Verify Code",
      welcomeBack: "Welcome back, Farmer!",
      home: "Home",
      loading: "Processing..."
    },
    te: {
      appName: "కృషిక్ AI",
      tagline: "తెలంగాణ రైతుకు 24/7 వ్యక్తిగత AI వ్యవసాయ సహాయకుడు",
      dashboard: "డ్యాష్‌బోర్డ్",
      myFarm: "నా పొలం",
      cropManagement: "పంటల నిర్వహణ",
      diseaseScanner: "తెగుళ్ళ స్కానర్",
      weather: "వాతావరణ విశ్లేషణ",
      marketIntelligence: "మార్కెట్ ధరలు",
      govSchemes: "ప్రభుత్వ పథకాలు",
      aiChatbot: "AI చాట్‌బాట్",
      notifications: "సమాచారం & హెచ్చరికలు",
      pestRisk: "తెగుళ్ళ ముప్పు అంచనా",
      profile: "ప్రొఫైల్ సెట్టింగ్స్",
      logout: "లాగ్ అవుట్",
      loginTitle: "రైతు నమోదు & లాగిన్",
      enterMobile: "మొబైల్ నంబర్ నమోదు చేయండి",
      sendOtp: "OTP కోడ్ పంపండి",
      enterOtp: "ధృవీకరణ కోడ్ నమోదు చేయండి",
      verifyOtp: "కోడ్ ధృవీకరించు",
      welcomeBack: "స్వాగతం, రైతు సోదరులారా!",
      home: "హోమ్",
      loading: "ప్రక్రియ జరుగుతోంది..."
    },
    hi: {
      appName: "कृषिक AI",
      tagline: "24/7 एआई-संचालित व्यक्तिगत कृषि सहायक",
      dashboard: "डैशबोर्ड",
      myFarm: "मेरा खेत",
      cropManagement: "फसल प्रबंधन",
      diseaseScanner: "रोग स्कैनर",
      weather: "मौसम विश्लेषण",
      marketIntelligence: "बाजार मूल्य",
      govSchemes: "सरकारी योजनाएं",
      aiChatbot: "एआई चैटबॉट",
      notifications: "सूचनाएं",
      pestRisk: "कीट जोखिम पूर्वानुमान",
      profile: "प्रोफ़ाइल सेटिंग्स",
      logout: "लॉग आउट",
      loginTitle: "किसान पंजीकरण और लॉगिन",
      enterMobile: "मोबाइल नंबर दर्ज करें",
      sendOtp: "ओटीपी भेजें",
      enterOtp: "सत्यापन कोड दर्ज करें",
      verifyOtp: "कोड सत्यापित करें",
      welcomeBack: "स्वागत है, किसान भाइयों!",
      home: "होम",
      loading: "प्रक्रिया जारी है..."
    }
  };

  const getTranslation = (key) => {
    return t[language]?.[key] || t['en']?.[key] || key;
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      language,
      theme,
      setLanguage,
      toggleTheme,
      login,
      logout,
      t: getTranslation
    }}>
      {children}
    </AppContext.Provider>
  );
};
