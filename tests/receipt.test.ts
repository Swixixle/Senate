// Receipt test: hash excludes receipt field
import { createReceipt } from '../src/lib/receipts';
import { sha256Canonical } from '../src/lib/hash';

const artifact = {
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
  updated_at: '2024-01-01T00:00:00Z',
  receipt: { dummy: true }
};

const hashWithoutReceipt = sha256Canonical({ ...artifact, receipt: undefined });
const receipt = createReceipt(artifact, 'senator', '0.1.0');
if (receipt.artifact_hash !== hashWithoutReceipt) {
  throw new Error('Receipt hash includes receipt field');
}
console.log('Receipt test passed');
