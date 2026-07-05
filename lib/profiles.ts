// Client-safe health profile types — no server imports

export type HealthProfile =
  | 'healthy_adult'
  | 'child'
  | 'elderly'
  | 'asthmatic'
  | 'pregnant'
  | 'athlete';

export const PROFILE_LABELS: Record<HealthProfile, string> = {
  healthy_adult: 'Healthy Adult',
  child:         'Child (under 12)',
  elderly:       'Elderly (65+)',
  asthmatic:     'Asthma / Respiratory',
  pregnant:      'Pregnant',
  athlete:       'Athlete / Active',
};

export const PROFILE_ICONS: Record<HealthProfile, string> = {
  healthy_adult: '🧑',
  child:         '👦',
  elderly:       '👴',
  asthmatic:     '💨',
  pregnant:      '🤱',
  athlete:       '🏃',
};
