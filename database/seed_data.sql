-- Seed data for the Farmer Assistant database
-- Government Schemes (Telangana State + Central)

USE farmer_assistant;

INSERT INTO government_schemes (title, description, eligibility_criteria, benefits, scheme_type) VALUES

-- Telangana State Schemes
('Rythu Bandhu (రైతుబంధు)',
 'Investment support scheme providing financial assistance to farmers for crop cultivation. The government deposits money directly into farmer bank accounts before every crop season.',
 'Must own agricultural land in Telangana. Land records must be updated in the Dharani portal. Both tenant and owner farmers are eligible.',
 'Rs. 10,000 per acre per crop season (Rs. 5,000 per acre per season × 2 seasons/year). Direct bank transfer before Kharif and Rabi seasons.',
 'State'),

('Rythu Bima (రైతుబీమా)',
 'Life insurance scheme for Telangana farmers. Provides Rs. 5 lakh insurance coverage to farmers aged 18-59 years in case of death due to any reason.',
 'Must be a farmer aged 18-59 years registered in Telangana. Enrolled Rythu Bandhu beneficiaries are automatically covered.',
 'Rs. 5,00,000 life insurance coverage. Premium paid entirely by the Telangana government. Claim settlement within 10 days.',
 'State'),

('Rythu Vedika (రైతు వేదిక)',
 'Community meeting halls built in every village cluster for farmers to gather, share knowledge, and receive training from agricultural officers.',
 'All farmers in Telangana. No specific eligibility — open community facility.',
 'Free venue for farmer meetings, training programs, and agricultural awareness sessions. Access to agricultural officers and experts.',
 'State'),

('Telangana Micro Irrigation Project',
 'Subsidized drip and sprinkler irrigation systems to promote water conservation and improve crop yields.',
 'Farmers with minimum 0.5 acres of agricultural land. Priority for SC/ST/small/marginal farmers.',
 'Up to 90% subsidy on drip irrigation systems. Up to 75% subsidy on sprinkler systems. Free technical guidance for installation.',
 'State'),

-- Central Government Schemes
('PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
 'Income support to all landholding farmer families across the country to supplement financial needs for crop cultivation.',
 'All landholding farmer families with cultivable land. Must have Aadhaar-linked bank account. Excludes institutional landholders and high-income farmers.',
 'Rs. 6,000 per year in three equal installments of Rs. 2,000 each. Direct bank transfer.',
 'Central'),

('Pradhan Mantri Fasal Bima Yojana (PMFBY)',
 'Crop insurance scheme to provide comprehensive insurance coverage against crop loss due to natural calamities, pests, and diseases.',
 'All farmers including sharecroppers and tenant farmers. Both loanee and non-loanee farmers are eligible.',
 'Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticulture crops. Full sum insured for crop damage. Post-harvest loss coverage for 14 days.',
 'Central'),

('Kisan Credit Card (KCC)',
 'Provides timely and adequate credit to farmers for their crop production, post-harvest needs, and farm maintenance requirements.',
 'All farmers, tenant farmers, sharecroppers, and self-help groups. Must have agricultural land or allied activities (dairy, fisheries, etc.).',
 'Credit limit up to Rs. 3 lakh at 4% interest rate (after government subsidy). Flexible repayment. Covers crop cultivation, post-harvest, and farm equipment.',
 'Central'),

('Soil Health Card Scheme',
 'Provides soil health cards to farmers every 2 years with information on nutrient status and recommendations for fertilizer application.',
 'All farmers across India. Free of cost.',
 'Free soil testing. Detailed soil health report with nutrient levels (N, P, K, pH, organic carbon). Customized fertilizer recommendations to improve soil fertility.',
 'Central'),

('e-NAM (National Agriculture Market)',
 'Online trading portal connecting APMC mandis across India to create a unified national market for agricultural commodities.',
 'All farmers, traders, commission agents. Registration through local APMC mandi.',
 'Real-time price discovery across mandis. Direct payment to farmer bank account. Reduced intermediary costs. Better price realization.',
 'Central'),

('Paramparagat Krishi Vikas Yojana (PKVY)',
 'Promotes organic farming through cluster approach and PGS (Participatory Guarantee System) certification.',
 'Farmer groups (clusters of 50+ farmers with 50 acres). Priority for tribal and northeastern regions.',
 'Rs. 50,000 per hectare over 3 years for organic inputs, certification, and marketing. Free PGS organic certification.',
 'Central');
