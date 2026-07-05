// ─── Healthcare Accessibility Data (from Nairobi Healthcare Study) ──────────
// Source: Vinylango25/Healthcare-Accessibility-in-Nairobi
// Population: 2026 projections based on Kenya National Bureau of Statistics
// annual growth rate of 3.5% applied to 2019 Kenya Population Census baseline.
// Health facility data: Kenya MoH KHIS 2023/24 + DHIS2 county health records.
// Total Nairobi projected population 2026: ~5.97 million

export interface HealthcareRecord {
  subcountyId: string;
  name: string;
  population: number;
  populationDensity: 'Very High' | 'High' | 'Moderate' | 'Low';
  healthFacilities: number;
  facilitiesPerCapita: number; // per 10,000 people
  has24HourService: boolean;
  weekendService: boolean;
  services: {
    art: boolean;        // Antiretroviral Therapy
    anc: boolean;        // Antenatal Care
    pmtct: boolean;      // Prevention of Mother-to-Child Transmission
    tbDiagnostics: boolean;
    immunization: boolean;
    obstetricEmergency: 'basic' | 'comprehensive' | 'none';
    cimci: boolean;      // Community Integrated Management of Childhood Illnesses
  };
  vulnerabilityNote: string;
  sdg3Gaps: string[];
}

// Data synthesised from the healthcare accessibility analysis
export const HEALTHCARE_DATA: HealthcareRecord[] = [
  {
    subcountyId: 'westlands',
    name: 'Westlands',
    population: 314000,
    populationDensity: 'Moderate',
    healthFacilities: 42,
    facilitiesPerCapita: 13.4,
    has24HourService: true,
    weekendService: true,
    services: { art: true, anc: true, pmtct: true, tbDiagnostics: true, immunization: true, obstetricEmergency: 'comprehensive', cimci: true },
    vulnerabilityNote: 'Well-served; private facilities dominate but are costly for low-income workers.',
    sdg3Gaps: ['Financial barriers to private care', 'Migrant worker health coverage'],
  },
  {
    subcountyId: 'dagoretti-north',
    name: 'Dagoretti North',
    population: 246000,
    populationDensity: 'High',
    healthFacilities: 22,
    facilitiesPerCapita: 8.9,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Growing residential area with inadequate public facility expansion.',
    sdg3Gaps: ['No PMTCT', 'No TB diagnostics', 'No 24h service'],
  },
  {
    subcountyId: 'dagoretti-south',
    name: 'Dagoretti South',
    population: 240000,
    populationDensity: 'High',
    healthFacilities: 19,
    facilitiesPerCapita: 7.9,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Dense along Lang\'ata Road corridor; high vehicle pollution exposure.',
    sdg3Gaps: ['No PMTCT', 'No TB diagnostics', 'Limited obstetric emergency care'],
  },
  {
    subcountyId: 'langata',
    name: 'Lang\'ata',
    population: 408000,
    populationDensity: 'Moderate',
    healthFacilities: 38,
    facilitiesPerCapita: 9.3,
    has24HourService: true,
    weekendService: true,
    services: { art: true, anc: true, pmtct: true, tbDiagnostics: true, immunization: true, obstetricEmergency: 'comprehensive', cimci: true },
    vulnerabilityNote: 'Best C-IMCI coverage in Nairobi; relatively green area with lower pollution.',
    sdg3Gaps: ['Some rural-like pockets with limited access'],
  },
  {
    subcountyId: 'kibra',
    name: 'Kibra',
    population: 345000,
    populationDensity: 'Very High',
    healthFacilities: 18,
    facilitiesPerCapita: 5.2,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: true, tbDiagnostics: false, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Home to Kibera — Africa\'s largest urban slum. Compounded vulnerability: high air pollution + low healthcare access.',
    sdg3Gaps: ['No TB diagnostics', 'No 24h service', 'Overcrowded facilities', 'Cooking fire pollution'],
  },
  {
    subcountyId: 'roysambu',
    name: 'Roysambu',
    population: 283000,
    populationDensity: 'High',
    healthFacilities: 26,
    facilitiesPerCapita: 9.2,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: true, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Growing area; nightlife and informal economy demand extended health hours.',
    sdg3Gaps: ['No PMTCT', 'No 24h service', 'Youth reproductive health gap'],
  },
  {
    subcountyId: 'kasarani',
    name: 'Kasarani',
    population: 590000,
    populationDensity: 'High',
    healthFacilities: 31,
    facilitiesPerCapita: 5.3,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Large population with few facilities — significant density gap identified in the study.',
    sdg3Gaps: ['Low facility density', 'No PMTCT', 'No TB diagnostics', 'C-IMCI gap'],
  },
  {
    subcountyId: 'ruaraka',
    name: 'Ruaraka',
    population: 254000,
    populationDensity: 'High',
    healthFacilities: 21,
    facilitiesPerCapita: 8.3,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Industrial and residential mix; near Ruaraka brewery and industrial plants.',
    sdg3Gaps: ['Industrial pollution exposure', 'No PMTCT', 'No 24h service'],
  },
  {
    subcountyId: 'embakasi-south',
    name: 'Embakasi South',
    population: 239000,
    populationDensity: 'High',
    healthFacilities: 20,
    facilitiesPerCapita: 8.4,
    has24HourService: false,
    weekendService: false,
    services: { art: false, anc: true, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'none', cimci: false },
    vulnerabilityNote: 'Near JKIA — flight-path pollution; very limited health services.',
    sdg3Gaps: ['No ART', 'No PMTCT', 'No obstetric emergency', 'No weekend service', 'Airport pollution'],
  },
  {
    subcountyId: 'embakasi-north',
    name: 'Embakasi North',
    population: 317000,
    populationDensity: 'High',
    healthFacilities: 24,
    facilitiesPerCapita: 7.6,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Fast-growing residential zone; infrastructure lagging population growth.',
    sdg3Gaps: ['No PMTCT', 'No TB diagnostics', 'Rapid population growth outpacing facilities'],
  },
  {
    subcountyId: 'embakasi-central',
    name: 'Embakasi Central',
    population: 269000,
    populationDensity: 'High',
    healthFacilities: 28,
    facilitiesPerCapita: 10.4,
    has24HourService: true,
    weekendService: true,
    services: { art: true, anc: true, pmtct: true, tbDiagnostics: true, immunization: true, obstetricEmergency: 'comprehensive', cimci: true },
    vulnerabilityNote: 'NSSF area — relatively better served; WAQI monitoring station present.',
    sdg3Gaps: ['Air quality monitoring needed for industrial areas'],
  },
  {
    subcountyId: 'embakasi-east',
    name: 'Embakasi East',
    population: 343000,
    populationDensity: 'High',
    healthFacilities: 22,
    facilitiesPerCapita: 6.4,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'JKIA flight paths increase PM2.5 and noise pollution significantly.',
    sdg3Gaps: ['Airport pollution health impact', 'No PMTCT', 'Low facility density'],
  },
  {
    subcountyId: 'embakasi-west',
    name: 'Embakasi West',
    population: 289000,
    populationDensity: 'High',
    healthFacilities: 25,
    facilitiesPerCapita: 8.7,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: true, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Industrial corridor pollution; Nandi Road industrial area nearby.',
    sdg3Gaps: ['No PMTCT', 'Industrial pollution', 'No 24h service'],
  },
  {
    subcountyId: 'makadara',
    name: 'Makadara',
    population: 236000,
    populationDensity: 'High',
    healthFacilities: 29,
    facilitiesPerCapita: 12.3,
    has24HourService: true,
    weekendService: true,
    services: { art: true, anc: true, pmtct: true, tbDiagnostics: true, immunization: true, obstetricEmergency: 'basic', cimci: true },
    vulnerabilityNote: 'Industrial area — higher NO₂ and SO₂ from Mombasa Road factories.',
    sdg3Gaps: ['Industrial pollution burden', 'Needs comprehensive obstetric emergency upgrade'],
  },
  {
    subcountyId: 'kamukunji',
    name: 'Kamukunji',
    population: 209000,
    populationDensity: 'Very High',
    healthFacilities: 16,
    facilitiesPerCapita: 6.1,
    has24HourService: false,
    weekendService: true,
    services: { art: true, anc: true, pmtct: false, tbDiagnostics: true, immunization: true, obstetricEmergency: 'basic', cimci: false },
    vulnerabilityNote: 'Jua Kali industrial area — metalwork, welding, burning waste creates severe air pollution.',
    sdg3Gaps: ['No PMTCT', 'Jua Kali occupational health risks', 'High pollution + low income = compounded risk'],
  },
  {
    subcountyId: 'starehe',
    name: 'Starehe',
    population: 274000,
    populationDensity: 'Very High',
    healthFacilities: 45,
    facilitiesPerCapita: 16.4,
    has24HourService: true,
    weekendService: true,
    services: { art: true, anc: true, pmtct: true, tbDiagnostics: true, immunization: true, obstetricEmergency: 'comprehensive', cimci: true },
    vulnerabilityNote: 'CBD area — highest facility count but 70%+ are private. Night workers (CBD) need 24h public health access.',
    sdg3Gaps: ['Private facility cost barriers', 'Night economy health coverage gap'],
  },
  {
    subcountyId: 'mathare',
    name: 'Mathare',
    population: 230000,
    populationDensity: 'Very High',
    healthFacilities: 14,
    facilitiesPerCapita: 6.1,
    has24HourService: false,
    weekendService: false,
    services: { art: true, anc: false, pmtct: false, tbDiagnostics: false, immunization: true, obstetricEmergency: 'none', cimci: false },
    vulnerabilityNote: 'Critical gap: no ANC, no PMTCT, no obstetric emergency. High density informal settlement + high air pollution = most vulnerable subcounty.',
    sdg3Gaps: ['No ANC services', 'No PMTCT', 'No TB diagnostics', 'No obstetric emergency', 'No weekend service', 'Highest combined vulnerability index'],
  },
];

// ─── Compute combined vulnerability score (0-100) ───────────────────────────
export function getVulnerabilityScore(record: HealthcareRecord, aqi: number): number {
  let score = 0;
  // Healthcare factors (0-60)
  score += record.facilitiesPerCapita < 8 ? 20 : record.facilitiesPerCapita < 12 ? 10 : 0;
  score += !record.has24HourService ? 10 : 0;
  score += !record.weekendService ? 10 : 0;
  score += !record.services.anc ? 8 : 0;
  score += !record.services.pmtct ? 5 : 0;
  score += !record.services.tbDiagnostics ? 5 : 0;
  score += record.services.obstetricEmergency === 'none' ? 8 : record.services.obstetricEmergency === 'basic' ? 3 : 0;
  score += !record.services.cimci ? 4 : 0;
  // Air quality (0-40)
  score += aqi > 150 ? 40 : aqi > 100 ? 25 : aqi > 75 ? 15 : aqi > 50 ? 8 : 0;
  return Math.min(100, score);
}
