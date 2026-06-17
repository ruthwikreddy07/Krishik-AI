/**
 * Krishi AI — Centralized API Service Layer
 * All backend calls go through this file.
 * Vite proxy forwards /api/* → http://localhost:8000/api/*
 */
import axios from 'axios';

// ── Axios instance ──────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler: auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('farmer_token');
      localStorage.removeItem('farmer_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth API ────────────────────────────────────────────────

/**
 * Send OTP to a mobile number.
 * Returns { message, otp_dev_only } (dev mode exposes OTP).
 */
export const sendOtp = async (mobileNumber) => {
  const res = await api.post('/auth/send-otp', { mobile_number: mobileNumber });
  return res.data;
};

/**
 * Verify OTP and get JWT access token.
 * Returns { access_token, token_type, farmer_id, name }
 */
export const verifyOtp = async (mobileNumber, otp) => {
  const res = await api.post('/auth/verify-otp', {
    mobile_number: mobileNumber,
    otp,
  });
  return res.data;
};

/**
 * Register a new farmer profile.
 * Returns full FarmerProfile object.
 */
export const registerFarmer = async (farmerData) => {
  const res = await api.post('/auth/register', farmerData);
  return res.data;
};

/**
 * Get farmer profile by ID.
 */
export const getFarmerProfile = async (farmerId) => {
  const res = await api.get(`/auth/profile/${farmerId}`);
  return res.data;
};

// ── Weather API ─────────────────────────────────────────────

/**
 * Get hyperlocal weather for a registered farmer (uses their GPS coords).
 * Returns WeatherResponse with current + 7-day forecast + advisories.
 */
export const getWeatherByFarmer = async (farmerId) => {
  const res = await api.get(`/weather/${farmerId}`);
  return res.data;
};

/**
 * Get weather by lat/lon (no farmer ID needed).
 * Useful as fallback using browser geolocation.
 */
export const getWeatherByLocation = async (lat, lon) => {
  const res = await api.get('/weather/by-location/', { params: { lat, lon } });
  return res.data;
};

// ── Crop API ────────────────────────────────────────────────

/**
 * Get all crops for a farmer.
 */
export const getCrops = async (farmerId) => {
  const res = await api.get(`/crops/${farmerId}`);
  return res.data;
};

/**
 * Add a new crop entry.
 */
export const addCrop = async (cropData) => {
  const res = await api.post('/crops/', cropData);
  return res.data;
};

/**
 * Update crop stage.
 */
export const updateCropStage = async (cropId, stage) => {
  const res = await api.put(`/crops/${cropId}`, { crop_stage: stage });
  return res.data;
};

/**
 * ML crop recommendation based on soil parameters.
 */
export const getCropRecommendation = async (params) => {
  const res = await api.post('/crops/recommend', params);
  return res.data;
};

// ── Disease API ─────────────────────────────────────────────

/**
 * Upload a crop leaf image for CNN disease detection.
 * Returns { disease_name, confidence, treatment, image_path }
 */
export const detectDisease = async (farmerId, imageFile, cropId = null) => {
  const formData = new FormData();
  formData.append('farmer_id', farmerId);
  formData.append('image', imageFile);
  if (cropId) formData.append('crop_id', cropId);

  const res = await api.post('/disease/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // CNN inference can be slow
  });
  return res.data;
};

/**
 * Get disease detection history for a farmer.
 */
export const getDiseaseHistory = async (farmerId) => {
  const res = await api.get(`/disease/history/${farmerId}`);
  return res.data;
};

// ── Market API ──────────────────────────────────────────────

/**
 * Get recent market prices for a crop.
 */
export const getMarketPrices = async (cropName, mandi = null, limit = 30) => {
  const params = { limit };
  if (mandi) params.mandi = mandi;
  const res = await api.get(`/market/prices/${encodeURIComponent(cropName)}`, { params });
  return res.data;
};

/**
 * Get LSTM-based price prediction for a crop.
 */
export const getPricePrediction = async (cropName, daysAhead = 7) => {
  const res = await api.get(`/market/predict/${encodeURIComponent(cropName)}`, {
    params: { days_ahead: daysAhead },
  });
  return res.data;
};

// ── Government Schemes API ──────────────────────────────────

/**
 * Get all government schemes, optionally filtered by type.
 * @param {'State'|'Central'|null} schemeType
 */
export const getSchemes = async (schemeType = null) => {
  const params = schemeType ? { scheme_type: schemeType } : {};
  const res = await api.get('/schemes/', { params });
  return res.data;
};

/**
 * Get a single scheme by ID.
 */
export const getScheme = async (schemeId) => {
  const res = await api.get(`/schemes/${schemeId}`);
  return res.data;
};

// ── Yield & Fertilizer API ──────────────────────────────────

/**
 * XGBoost yield prediction.
 */
export const predictYield = async (params) => {
  const res = await api.post('/yield/predict', params);
  return res.data;
};

/**
 * Decision Tree fertilizer recommendation.
 */
export const recommendFertilizer = async (params) => {
  const res = await api.post('/fertilizer/recommend', params);
  return res.data;
};

export default api;
