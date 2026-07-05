// SERVER ONLY — do not import in client components
import type { AIRecommendation, SubcountyData } from './types';
import { aqiCategory } from './aqi';
import { type HealthProfile, PROFILE_LABELS } from './profiles';

export type { HealthProfile };
export { PROFILE_LABELS };

function ruleBasedRecommendation(sc: SubcountyData, profile: HealthProfile): AIRecommendation {
  const aqi = sc.aqi;
  const isSensitive = ['asthmatic', 'elderly', 'child', 'pregnant'].includes(profile);
  const isAthlete = profile === 'athlete';
  const hour = new Date().getHours();
  const isRushHour = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20);
  const pm25 = sc.pollutants.find(p => p.key === 'pm25');
  const no2  = sc.pollutants.find(p => p.key === 'no2');
  const dom  = sc.dominantPollutant?.toUpperCase() ?? 'PM2.5';

  let summary = '';
  if (aqi <= 50) {
    summary = `Air quality in ${sc.name} is excellent. ${dom} levels are well within safe limits. ${isSensitive ? 'Even sensitive individuals can safely enjoy outdoor activities.' : 'Ideal for all outdoor activities.'}`;
  } else if (aqi <= 100) {
    summary = `Air quality in ${sc.name} is moderate. The main concern is ${dom}${isSensitive ? ', which may affect sensitive groups' : ''}. Most healthy adults can go about normal activities with minimal precaution.`;
  } else if (aqi <= 150) {
    summary = `Air quality in ${sc.name} is unhealthy for sensitive groups, driven primarily by ${dom}. ${isSensitive ? `As a ${PROFILE_LABELS[profile]}, you should take precautions.` : 'Reduce prolonged outdoor exertion.'}`;
  } else if (aqi <= 200) {
    summary = `Air quality in ${sc.name} is unhealthy (AQI ${aqi}). Everyone — especially ${PROFILE_LABELS[profile]}s — should reduce outdoor exposure. ${dom} is the dominant pollutant.`;
  } else {
    summary = `Air quality in ${sc.name} is very poor (AQI ${aqi}). This poses serious health risks${isSensitive ? ` — especially for a ${PROFILE_LABELS[profile]}` : ''}. Avoid outdoor activities and stay indoors.`;
  }

  let outdoorAdvice = '';
  if (aqi <= 50) {
    outdoorAdvice = isAthlete
      ? 'Perfect training conditions. Go for that long run or outdoor workout.'
      : 'Great day to be outside. No restrictions — enjoy parks, walks, or any outdoor activity.';
  } else if (aqi <= 100) {
    outdoorAdvice = isSensitive
      ? 'You can go outdoors but limit strenuous activity to under 2 hours. Monitor symptoms closely.'
      : isAthlete ? 'Good for moderate training. Avoid peak traffic hours (6–9am, 5–8pm).'
      : 'Generally safe. Sensitive individuals should limit prolonged exertion.';
  } else if (aqi <= 150) {
    outdoorAdvice = isSensitive
      ? `Limit outdoor time to 30–60 minutes.${isRushHour ? ' Especially avoid going out during rush hour.' : ''} Wear an N95 mask if you must go out.`
      : isAthlete ? 'Move workouts indoors or reduce intensity. If outside, keep it under 45 minutes.'
      : 'Reduce prolonged outdoor exertion. Wear a mask if outdoors for extended periods.';
  } else {
    outdoorAdvice = `Avoid unnecessary outdoor exposure. If you must go out, wear a well-fitted N95/KN95 mask${isSensitive ? ' — essential for your health profile' : ''}. Keep trips short (under 20 minutes).`;
  }

  const indoorAdvice = aqi <= 100
    ? 'Indoor air quality is fine. Normal ventilation is adequate. Opening windows is safe.'
    : aqi <= 150
    ? 'Keep windows closed during peak pollution hours (7–9am, 6–8pm). Run air purifier on medium. Avoid indoor burning.'
    : 'Keep all windows and doors closed. Run HEPA air purifier on high. Avoid charcoal or wood cooking indoors. Create a "clean room" with a purifier.';

  const sensitiveNote = isSensitive
    ? `As a ${PROFILE_LABELS[profile]}, your exposure threshold is lower than average. ${
        aqi > 100 ? 'Have your rescue inhaler/medication readily accessible. If symptoms worsen, seek medical attention immediately.'
        : aqi > 50 ? 'Monitor symptoms closely during outdoor activity. Carry prescribed medication.'
        : 'Current air quality is within safe limits for your health profile.'
      }`
    : `People most at risk: children, elderly, and those with asthma or heart disease. AQI ${aqi} poses ${aqi <= 100 ? 'minimal' : aqi <= 150 ? 'moderate' : 'significant'} risk to these groups.`;

  const activities = [
    { activity: 'Morning jog / running', safe: aqi <= (isSensitive ? 50 : 100), note: aqi <= 50 ? 'Safe — great conditions' : aqi <= 100 ? (isSensitive ? 'Limit to 30 min' : 'Safe for healthy adults') : 'Not recommended — exercise increases pollutant intake 3–5×' },
    { activity: 'Children playing outdoors', safe: aqi <= 100, note: aqi <= 50 ? 'Perfectly safe' : aqi <= 100 ? 'Safe, limit to 2 hours' : 'Keep children indoors' },
    { activity: 'Commuting by matatu/boda', safe: aqi <= 150, note: aqi <= 100 ? 'Normal commute' : aqi <= 150 ? 'Wear a mask on open vehicles' : 'Use enclosed vehicles; wear N95 mask' },
    { activity: 'Outdoor market / hawking', safe: aqi <= 100, note: aqi <= 100 ? 'Normal activity' : 'Consider a mask; take indoor breaks every hour' },
    { activity: 'Cycling to work/school', safe: aqi <= (isSensitive ? 50 : 100), note: aqi <= 50 ? 'Ideal cycling conditions' : aqi <= 100 ? 'Safe for most; avoid main roads' : 'High exertion + high pollution — use indoor transport' },
    { activity: 'Elderly outdoor walks', safe: aqi <= 100, note: aqi <= 50 ? 'Excellent for walks' : aqi <= 100 ? 'Short walks (30 min) are fine' : 'Stay indoors; gentle indoor exercises instead' },
  ];

  const forecastHour = isRushHour ? 'Pollution is currently elevated due to rush hour traffic.'
    : hour < 12 ? 'Morning traffic pollution is dissipating.'
    : hour < 17 ? 'Midday conditions are relatively stable.'
    : 'Evening rush hour approaching — expect AQI to rise slightly.';

  const forecast = `${forecastHour} ${pm25?.value ? `PM2.5 is ${pm25.value} µg/m³` : ''} — ${
    pm25?.value && pm25.value > 35 ? 'above the WHO 24h guideline of 15 µg/m³.' : 'within manageable levels.'
  } ${no2?.value && no2.value > 50 ? 'Elevated NO₂ from vehicle traffic is also a concern. ' : ''}Expect conditions to ${
    isRushHour ? 'improve after 9pm as traffic subsides' : hour < 17 ? 'worsen slightly during evening rush (5–8pm)' : 'gradually improve overnight'}.`;

  return { subcounty: sc.name, aqi, healthProfile: PROFILE_LABELS[profile], summary, outdoorAdvice, indoorAdvice, sensitiveGroupNote: sensitiveNote, activities, forecast };
}

export async function getAIRecommendation(sc: SubcountyData, profile: HealthProfile): Promise<AIRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-1.5-flash' });
      const pm25 = sc.pollutants.find(p => p.key === 'pm25');
      const prompt = `You are an expert environmental health advisor for Nairobi, Kenya.
Air quality data for ${sc.name}: AQI ${sc.aqi} (${aqiCategory(sc.aqi)}), PM2.5: ${pm25?.value ?? 'N/A'} µg/m³, dominant: ${sc.dominantPollutant}, time: ${new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi' })} EAT, profile: ${PROFILE_LABELS[profile]}.
Respond JSON only: {"summary":"...","outdoorAdvice":"...","indoorAdvice":"...","sensitiveGroupNote":"...","forecast":"..."}
Be specific to Nairobi (matatus, jua kali, cooking fires, JKIA). Use Kenyan English.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { const llm = JSON.parse(m[0]); return { ...ruleBasedRecommendation(sc, profile), ...llm }; }
    } catch { /* fall through */ }
  }
  return ruleBasedRecommendation(sc, profile);
}
