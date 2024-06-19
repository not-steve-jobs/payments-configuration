/**
 * Represents country details with linked authority full codes as a string, e.g. 'fca,cy,gm'
 */
export interface CountryWithAuthoritiesDto {
  iso2: string;
  name: string;
  group: string;
  authorities: string | null;
}
