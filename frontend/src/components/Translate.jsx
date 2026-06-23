import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// Simple text normalization helper to strip common symbols and match text
const normalizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
};

export const Translate = ({ children }) => {
  const { language } = useContext(AppContext);

  // If language is English, just return the content unmodified
  if (language === 'en') {
    return children;
  }

  const dict = {
    // Status and Header Info
    "System Online": { te: "సిస్టమ్ ఆన్‌లైన్", hi: "सिस्टम ऑनलाइन" },
    "API Connected": { te: "API అనుసంధానించబడింది", hi: "एपीआई कनेक्टेड" },
    "Secured": { te: "సురక్షితమైనది", hi: "सुरक्षित" },
    "FARM SIZE": { te: "పొలం పరిమాణం", hi: "खेत का आकार" },
    "Acres": { te: "ఎకరాలు", hi: "एकड़" },
    "WATER": { te: "నీటి వనరు", hi: "जल स्रोत" },
    "Soil": { te: "నేల రకం", hi: "मिट्टी" },

    // Dashboard Page
    "Active Crop Tracks": { te: "సక్రియ పంట ట్రాక్‌లు", hi: "सक्रिय फसल ट्रैक" },
    "Manage Crops": { te: "పంటలను నిర్వహించండి", hi: "फसलें प्रबंधित करें" },
    "Loading your crops...": { te: "మీ పంటల వివరాలను లోడ్ చేస్తోంది...", hi: "आपकी फसलें लोड हो रही हैं..." },
    "Progress": { te: "ప్రగతి", hi: "प्रगति" },
    "Sown": { te: "నాటిన తేదీ", hi: "बोया गया" },
    "No active crops.": { te: "సక్రియ పంటలు లేవు.", hi: "कोई सक्रिय फसल नहीं।" },
    "Add your first crop →": { te: "మీ మొదటి పంటను జోడించండి →", hi: "अपनी पहली फसल जोड़ें →" },
    "Weather Forecast": { te: "వాతావరణ సూచన", hi: "मौसम पूर्वानुमान" },
    "Tomorrow": { te: "రేపు", hi: "कल" },
    "Wind": { te: "గాలి వేగం", hi: "हवा" },
    "Humidity": { te: "తేమ", hi: "आर्द्रता" },
    "Rain Probability": { te: "వర్షం పడే అవకాశం", hi: "वर्षा की संभावना" },
    "Smart Alerts": { te: "స్మార్ట్ హెచ్చరికలు", hi: "स्मार्ट अलर्ट" },
    "Dynamic Farm Tasks": { te: "వ్యవసాయ పనులు", hi: "कृषि कार्य" },
    "due": { te: "గడువు", hi: "समय" },
    "Due": { te: "గడువు", hi: "समय" },
    "Today": { te: "ఈరోజు", hi: "आज" },

    // Crop Management Page
    "AI Crop Management": { te: "AI పంటల నిర్వహణ", hi: "एआई फसल प्रबंधन" },
    "Track your crop lifecycles and use specialized Random Forest, XGBoost, and Decision Tree models for expert advisory.": {
      te: "మీ పంటల దశలను ట్రాక్ చేయండి మరియు నిపుణుల సలహా కోసం అధునాతన Random Forest, XGBoost మరియు Decision Tree మోడల్స్ ఉపయోగించండి.",
      hi: "अपने फसल चक्र को ट्रैक करें और विशेषज्ञ सलाह के लिए विशिष्ट रैंडम फॉरेस्ट, एक्सजीबूस्ट और डिसीजन ट्री मॉडल का उपयोग करें।"
    },
    "Active Trackers": { te: "సక్రియ ట్రాకర్లు", hi: "सक्रिय ट्रैकर्स" },
    "AI Crop Recommendation": { te: "AI పంట సిఫార్సు", hi: "एआई फसल सिफारिश" },
    "AI Yield Predictor": { te: "AI దిగుబడి అంచనా", hi: "एิ उपज पूर्वानुमान" },
    "AI Fertilizer Advisor": { te: "AI ఎరువుల సలహాదారు", hi: "एआई उर्वरक सलाहकार" },
    "Active Crop Logs": { te: "సక్రియ పంట లాగ్‌లు", hi: "सक्रिय फसल लॉग" },
    "Sow New Crop Track": { te: "కొత్త పంట ట్రాక్ ప్రారంభించండి", hi: "नया फसल ट्रैक शुरू करें" },
    "CROP NAME": { te: "పంట పేరు", hi: "फसल का नाम" },
    "e.g. Rice, Cotton, Chilli": { te: "ఉదా. వరి, పత్తి, మిరప", hi: "जैसे: धान, कपास, मिर्च" },
    "SOWN DATE": { te: "నాటిన తేదీ", hi: "बुवाई की तारीख" },
    "DURATION (DAYS)": { te: "వ్యవధి (రోజులు)", hi: "अवधि (दिन)" },
    "Initiate Lifecycle Tracker": { te: "లైఫ్‌సైకిల్ ట్రాకర్ ప్రారంభించండి", hi: "लाइफसाइकिल ट्रैकर शुरू करें" },
    "Initiate Crop Track": { te: "పంట ట్రాక్ ప్రారంభించండి", hi: "फसल ट्रैक शुरू करें" },
    "Sowing": { te: "విత్తడం", hi: "बुवाई" },
    "Germination": { te: "మొలకెత్తడం", hi: "अंकुरण" },
    "Vegetative": { te: "శాకీయ దశ", hi: "वानस्पतिक अवस्था" },
    "Flowering": { te: "పూత దశ", hi: "फूल आना" },
    "Grain Filling": { te: "గింజ నిండే దశ", hi: "दाना भरना" },
    "Harvesting": { te: "కోత దశ", hi: "कटाई" },
    "Harvested": { te: "కోసిన పంట", hi: "फसल कट चुकी है" },
    "Days elapsed": { te: "గడిచిన రోజులు", hi: "बीते दिन" },
    "Est. Duration": { te: "అంచనా వ్యవధి", hi: "अनुमानित अवधि" },
    "Update Stage": { te: "దశను నవీకరించు", hi: "अवस्था बदलें" },

    // Crop Recommender Tab
    "Recommended Crop": { te: "సిఫార్సు చేయబడిన పంట", hi: "अनुशंसित फसल" },
    "Nitrogen (N)": { te: "నత్రజని (N)", hi: "नाइट्रोजन (N)" },
    "Phosphorus (P)": { te: "భాస్వరం (P)", hi: "फास्फोरस (P)" },
    "Potassium (K)": { te: "పొటాషియం (K)", hi: "पोटेशियम (K)" },
    "Soil pH": { te: "నేల pH విలువ", hi: "मिट्टी का pH" },
    "Rainfall (mm)": { te: "వర్షపాతం (మి.మీ)", hi: "वर्षा (मिमी)" },
    "Auto-fill with localized Weather metrics": { te: "స్థానిక వాతావరణ వివరాలతో ఆటో-ఫిల్ చేయండి", hi: "स्थानीय मौसम विवरणों से ऑटो-फिल करें" },
    "Generate Crop Recommendation": { te: "పంట సిఫార్సును రూపొందించండి", hi: "फसल सिफारिश प्राप्त करें" },
    "Run Recommendation Model": { te: "సిఫార్సు మోడల్ రన్ చేయండి", hi: "सिफारिश मॉडल चलाएं" },

    // Yield Predictor Tab
    "Predict Yield": { te: "దిగుబడిని అంచనా వేయండి", hi: "उपज का अनुमान लगाएं" },
    "Predicted Yield": { te: "అంచనా వేసిన దిగుబడి", hi: "अनुमानित उपज" },
    "predicted yield": { te: "అంచనా వేసిన దిగుబడి", hi: "अनुमानित उपज" },
    "Farm Area (Acres)": { te: "పొలం వైశాల్యం (ఎకరాలు)", hi: "खेत का क्षेत्रफल (एकड़)" },
    "Soil Type": { te: "నేల రకం", hi: "मिट्टी का प्रकार" },
    "Run Yield Predictor Model": { te: "దిగుబడి అంచనా మోడల్ రన్ చేయండి", hi: "उपज पूर्वानुमान मॉडल चलाएं" },
    "Predicted Output": { te: "అంచనా వేసిన ఫలితం", hi: "अनुमानित परिणाम" },

    // Fertilizer Advisor Tab
    "Fertilizer Advisor": { te: "ఎరువుల సలహాదారు", hi: "उर्वरक सलाहकार" },
    "Crop Stage": { te: "పంట దశ", hi: "फसल की अवस्था" },
    "Run Fertilizer Advisor Model": { te: "ఎరువుల సలహా మోడల్ రన్ చేయండి", hi: "उर्वरक सलाह मॉडल चलाएं" },
    "Fertilizer recommendation": { te: "ఎరువుల సిఫార్సు", hi: "उर्वरक सिफारिश" },
    "Recommended Fertilizer": { te: "సిఫార్సు చేసిన ఎరువులు", hi: "अनुशंसित उर्वरक" },

    // Disease Scanner Page
    "AI Plant Disease Scanner": { te: "AI పంట తెగుళ్ళ స్కానర్", hi: "एआई पौधा रोग स्कैनर" },
    "Upload leaf photo to run real-time deep learning visual classifier models for instant pathogen diagnosis.": {
      te: "తక్షణ వ్యాధి నిర్ధారణ కోసం నిజ-సమయ డీప్ లెర్నింగ్ విజువల్ క్లాసిఫైయర్ మోడల్స్ రన్ చేయుటకు ఆకు ఫోటోను అప్‌లోడ్ చేయండి.",
      hi: "तत्काल रोग निदान के लिए वास्तविक समय गहन शिक्षण दृश्य वर्गीकरण मॉडल चलाने के लिए पत्ती की फोटो अपलोड करें।"
    },
    "Select Image Source": { te: "చిత్ర వనరును ఎంచుకోండి", hi: "छवि का स्रोत चुनें" },
    "Drop leaf image here or click to upload": { te: "ఆకు చిత్రాన్ని ఇక్కడ వేయండి లేదా అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి", hi: "पत्ती की छवि यहाँ डालें या अपलोड करने के लिए क्लिक करें" },
    "Supported formats: JPG, PNG. Max 5MB.": { te: "మద్దతు ఫార్మాట్లు: JPG, PNG. గరిష్టంగా 5MB.", hi: "समर्थित प्रारूप: JPG, PNG। अधिकतम 5MB।" },
    "Analyze Plant Image": { te: "పంట చిత్రాన్ని విశ్లేషించండి", hi: "पौधे की छवि का विश्लेषण करें" },
    "Diagnostic Result": { te: "వ్యాధి నిర్ధారణ ఫలితం", hi: "निदान परिणाम" },
    "Match Confidence": { te: "ఖచ్చితత్వ శాతం", hi: "सटीकता दर" },
    "Remedy & Action Guidelines": { te: "నివారణ మరియు నివారణ మార్గదర్శకాలు", hi: "उपचार और निवारक उपाय" },
    "Pathogen Diagnosis": { te: "రోగ కారక నిర్ధారణ", hi: "रोगज़नक़ निदान" },

    // Weather Page
    "Localized Weather Analytics": { te: "స్థానిక వాతావరణ విశ్లేషణ", hi: "स्थानीय मौसम विश्लेषण" },
    "View 7-day outlook forecasts and AI-generated dynamic voice broadcasts tailored for your crops.": {
      te: "మీ పంటలకు తగినట్లుగా 7 రోజుల వాతావరణ సూచనలు మరియు AI-రూపొందించిన వాయిస్ బ్రాడ్‌కాస్ట్‌లను చూడండి.",
      hi: "अपनी फसलों के लिए अनुकूलित 7-दिवसीय पूर्वानुमान और एआई-जनित वॉयस ब्रॉडकास्ट देखें।"
    },
    "Temperature": { te: "ఉష్ణోగ్రత", hi: "तापमान" },
    "Wind Speed": { te: "గాలి వేగం", hi: "हवा की गति" },
    "Soil Moisture": { te: "నేల తేమ", hi: "मिट्टी की नमी" },
    "AI Voice Advisory Broadcast": { te: "AI వాయిస్ సలహా బ్రాడ్‌కాస్ట్", hi: "एआई वॉयस सलाह ब्रॉडकास्ट" },
    "Advisory Broadcast Details": { te: "సలహా బ్రాడ్‌కాస్ట్ వివరాలు", hi: "सलाह ब्रॉडकास्ट विवरण" },
    "7-Day Meteorological Outlook": { te: "7 రోజుల వాతావరణ సూచన", hi: "7-दिवसीय मौसम आउटलुक" },
    "Max Temp": { te: "గరిష్ట ఉష్ణోగ్రత", hi: "अधिकतम तापमान" },
    "Min Temp": { te: "కనిష్ట ఉష్ణోగ్రత", hi: "न्यूनतम तापमान" },

    // Market Page
    "Market Intelligence & mandis": { te: "మార్కెట్ ధరలు & మార్కెట్ యార్డులు", hi: "बाजार मूल्य और मंडियां" },
    "Track real-time APMC mandi prices and get ML commodity forecasts to identify the best selling times.": {
      te: "నిజ-సమయ APMC మార్కెట్ ధరలను ట్రాక్ చేయండి మరియు విక్రయించడానికి ఉత్తమ సమయాలను కనుగొనడానికి ML ధరల అంచనాలను పొందండి.",
      hi: "वास्तविक समय एपीएमसी मंडी कीमतें ट्रैक करें और सर्वोत्तम बिक्री समय की पहचान के लिए एमएल मूल्य पूर्वानुमान प्राप्त करें।"
    },
    "Select Commodity": { te: "పంటను ఎంచుకోండి", hi: "वस्तु चुनें" },
    "Warangal Mandi Yard Spot Price": { te: "వరంగల్ మార్కెట్ యార్డ్ ప్రస్తుత ధర", hi: "वारंगल मंडी स्पॉट मूल्य" },
    "Spot Price": { te: "ప్రస్తుత ధర", hi: "स्पॉट मूल्य" },
    "7-Day Price Curve": { te: "7 రోజుల ధరల వ్యత్యాసం", hi: "7-दिवसीय मूल्य वक्र" },
    "ML Forecast Action": { te: "ML విక్రయ సలహా", hi: "एमएल पूर्वानुमान सलाह" },

    // Schemes Page
    "Government Schemes Directory": { te: "ప్రభుత్వ పథకాల వివరాలు", hi: "सरकारी योजनाएं निर्देशिका" },
    "Browse eligible central and state schemes, verify documents needed, and start application processes.": {
      te: "అర్హత కలిగిన కేంద్ర మరియు రాష్ట్ర పథకాలను బ్రౌజ్ చేయండి, అవసరమైన పత్రాలను ధృవీకరించండి మరియు దరఖాస్తు ప్రక్రియను ప్రారంభించండి.",
      hi: "पात्र केंद्रीय और राज्य योजनाओं को ब्राउज़ करें, आवश्यक दस्तावेजों को सत्यापित करें और आवेदन शुरू करें।"
    },
    "Central Schemes": { te: "కేంద్ర పథకాలు", hi: "केंद्रीय योजनाएं" },
    "State Schemes": { te: "రాష్ట్ర పథకాలు", hi: "राज्य योजनाएं" },
    "Verify Eligibility": { te: "అర్హత ధృవీకరించు", hi: "पात्रता सत्यापित करें" },
    "Required Documents": { te: "అవసరమైన పత్రాలు", hi: "आवश्यक दस्तावेज" },

    // Chat Page
    "Telugu AI Chatbot Advisor": { te: "తెలుగు AI చాట్‌బాట్ సహాయకుడు", hi: "एआई चैटबॉट सलाहकार" },
    "Ask agronomy questions in Telugu, Hindi, or English and receive 24/7 expert recommendations.": {
      te: "తెలుగు, హిందీ లేదా ఇంగ్లీషులో వ్యవసాయ ప్రశ్నలను అడగండి మరియు 24/7 నిపుణుల సలహాలను పొందండి.",
      hi: "तेलुगु, हिंदी या अंग्रेजी में कृषि प्रश्न पूछें और 24/7 विशेषज्ञ सलाह प्राप्त करें।"
    },
    "Type your farming question here...": { te: "మీ వ్యవసాయ ప్రశ్నను ఇక్కడ టైప్ చేయండి...", hi: "अपनी खेती से संबंधित प्रश्न यहाँ लिखें..." },
    "Send Message": { te: "సందేశం పంపండి", hi: "संदेश भेजें" },

    // Pest Risk Page
    "Pest Risk Forecast & Prevention": { te: "తెగుళ్ళ ముప్పు అంచనా & నివారణ", hi: "कीट जोखिम पूर्वानुमान और रोकथाम" },
    "Get localized predictions on insect, pest, and disease outbreaks based on weather patterns.": {
      te: "వాతావరణ మార్పుల ఆధారంగా కీటకాలు, పురుగులు మరియు తెగుళ్ళ వ్యాప్తికి సంబంధించిన స్థానిక అంచనాలను పొందండి.",
      hi: "मौसम के पैटर्न के आधार पर कीट और रोगों के प्रकोप का स्थानीय पूर्वानुमान प्राप्त करें।"
    },
    "Outbreak Risk": { te: "వ్యాప్తి చెందే ముప్పు", hi: "प्रकोप का जोखिम" },
    "Pest Name": { te: "తెగులు పేరు", hi: "कीट का नाम" },
    "Risk Level": { te: "ముప్పు స్థాయి", hi: "जोखिम स्तर" },
    "Prevention Action": { te: "నివారణ చర్య", hi: "रोकथाम के उपाय" },
    "High Risk": { te: "అధిక ముప్పు", hi: "उच्च जोखिम" },
    "Medium Risk": { te: "మధ్యస్థ ముప్పు", hi: "मध्यम जोखिम" },
    "Low Risk": { te: "తక్కువ ముప్పు", hi: "कम जोखिम" },

    // Profile Settings
    "Farmer Profile Settings": { te: "రైతు ప్రొఫైల్ సెట్టింగ్స్", hi: "किसान प्रोफ़ाइल सेटिंग्स" },
    "Configure your farm coordinates, soil properties, water sources, and personal preferences.": {
      te: "మీ పొలం అక్షాంశ రేఖాంశాలు, నేల లక్షణాలు, నీటి వనరులు మరియు వ్యక్తిగత వివరాలను ఇక్కడ సవరించండి.",
      hi: "अपने खेत के निर्देशांक, मिट्टी के गुण, जल स्रोत और व्यक्तिगत प्राथमिकताएं सेट करें।"
    },
    "Save Settings": { te: "సెట్టింగ్స్ సేవ్ చేయి", hi: "सेटिंग्स सहेजें" },
    "FARM DETAILS": { te: "పొలం వివరాలు", hi: "खेत का विवरण" },
    "PERSONAL INFORMATION": { te: "వ్యక్తిగత సమాచారం", hi: "व्यक्तिगत जानकारी" },

    // Notifications Page
    "Alert Notifications": { te: "సమాచారం & హెచ్చరికలు", hi: "सूचनाएं और चेतावनी" },
    "Critical agricultural notifications, weather alerts, and crop advisories for your district.": {
      te: "మీ జిల్లాకు సంబంధించిన ముఖ్యమైన వ్యవసాయ ప్రకటనలు, వాతావరణ హెచ్చరికలు మరియు పంట సలహాలు.",
      hi: "आपके जिले के लिए महत्वपूर्ण कृषि सूचनाएं, मौसम अलर्ट और फसल सलाह।"
    },

    // My Farm Page
    "My Farm Overview": { te: "నా పొలం వివరాలు", hi: "मेरा खेत अवलोकन" },
    "Explore soil diagnostics, water retention analytics, and crop history summaries for your land.": {
      te: "మీ భూమికి సంబంధించిన నేల పరీక్షలు, నీటి నిల్వ సామర్థ్య విశ్లేషణ మరియు పంటల చరిత్రను చూడండి.",
      hi: "अपनी भूमि के लिए मिट्टी के निदान, जल प्रतिधारण विश्लेषण और फसल इतिहास के विवरण देखें।"
    },

    // Buttons and Helpers
    "Back": { te: "వెనుకకు", hi: "पीछे" },
    "Update": { te: "నవీకరించు", hi: "अपडेट करें" },
    "Submit": { te: "సమర్పించు", hi: "जमा करें" },
    "Cancel": { te: "రద్దు చేయి", hi: "రद्द करें" },
    "Add Crop": { te: "పంటను జోడించండి", hi: "फसल जोड़ें" },
    "Delete": { te: "తొలగించు", hi: "हटाएं" }
  };

  const translateText = (text) => {
    if (typeof text !== 'string') return text;
    const normalized = normalizeText(text);
    if (!normalized) return text;

    // Direct match lookup
    const translated = dict[normalized]?.[language];
    if (translated) {
      const startSpace = text.match(/^\s*/)[0];
      const endSpace = text.match(/\s*$/)[0];
      return `${startSpace}${translated}${endSpace}`;
    }

    return text;
  };

  const traverse = (node) => {
    if (!node) return node;
    if (typeof node === 'string') {
      return translateText(node);
    }
    if (typeof node === 'number' || typeof node === 'boolean') {
      return node;
    }
    if (typeof node === 'function') {
      return node;
    }
    if (React.isValidElement(node)) {
      const newProps = { ...node.props };
      let changed = false;

      // Translate attributes that contain user-facing texts
      ['placeholder', 'title', 'label'].forEach(propName => {
        if (typeof newProps[propName] === 'string') {
          const trans = translateText(newProps[propName]);
          if (trans !== newProps[propName]) {
            newProps[propName] = trans;
            changed = true;
          }
        }
      });

      if (node.props.children) {
        newProps.children = React.Children.map(node.props.children, traverse);
        changed = true;
      }

      return changed ? React.cloneElement(node, newProps) : node;
    }
    if (Array.isArray(node)) {
      return node.map(traverse);
    }
    return node;
  };

  return traverse(children);
};
