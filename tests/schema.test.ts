// Schema validation test
import { validateSenator, validateEvent, validateReceipt } from '../src/lib/validate';

const senator = {
  schema_version: 'halo.senator.v1',
  subject_id: 'sen_us_CA_A000360',
  full_name: 'Alex Padilla',
  last_name: 'Padilla',
  first_name: 'Alex',
  middle_name: null,
  state: 'CA',
  party: 'D',
  chamber: 'senate',
  class: 3,
  term_start: '2021-01-20',
  term_end: '2027-01-03',
  salary: 174000,
  dc_office: { address: '112 Hart Senate Office Building', phone: '202-224-3553' },
  committees: ['Judiciary'],
  caucuses: [],
  identifiers: { bioguide_id: 'A000360' },
  sources: [{ kind: 'bioguide', url: 'https://bioguide.congress.gov/A000360', retrieved_at: '2024-01-01T00:00:00Z' }],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

if (!validateSenator(senator)) {
  throw new Error('Senator schema validation failed');
}
console.log('Schema test passed');
