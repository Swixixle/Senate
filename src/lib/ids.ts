// Subject ID normalization rules
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function subjectId(state: string, bioguideId?: string, lastName?: string, firstName?: string): string {
  if (bioguideId) {
    return `sen_us_${state}_${bioguideId}`;
  }
  return `sen_us_${state}_${normalize(lastName || '')}_${normalize(firstName || '')}`;
}
