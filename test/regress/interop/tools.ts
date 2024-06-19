const countryAuthorities = {
  countries: [
    'SA', 'VN', 'CN', 'TR', 'MY', 'RU', 'ID', 'TH', 'NG', 'AE', 'GB', 'EG', 'KE', 'UA', 'BR', 'IN', 'AR', 'JP', 'SG', 'OM', 'EC', 'DE', 'NA', 'FR', 'MX',
    'PK', 'IT', 'CO', 'KR', 'ES', 'TW', 'MA', 'BH', 'UG', 'KZ', 'CY', 'SA', 'HK', 'BY', 'UZ', 'JM', 'AU', 'GR', 'PL', 'GT', 'PE', 'BW', 'KW', 'AZ', 'QA', 'LT',
  ],
  authorities: [
    'AU',
    'CYSEC',
    'FCA',
    'FSCM',
    'GM',
    'KNN',
    'MENA',
  ],
} as const;

export const platformAndVersions = [
  { platform: '', version: '' },
  { platform: 'web', version: '6.2.3.0' },
  { platform: 'ios', version: '4.51.0' },
  { platform: 'ios', version: '4.50.60' },
  { platform: 'ios', version: '4.50.70' },
  { platform: 'ios', version: '4.50.80' },
  { platform: 'android', version: '4.49.3' },
  { platform: 'android', version: '4.50.4' },
  { platform: 'android', version: '4.50.5' },
  { platform: 'android', version: '6.2.3.0' },
];

export function getCountryAuthorities(): { country: string; authority: string }[] {
  const { countries, authorities } = countryAuthorities;
  const data: {country: string; authority: string}[] = [];

  for (const country of countries) {
    for (const authority of authorities) {
      data.push({ country, authority });
    }
  }

  return data;
}
