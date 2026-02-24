

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import receiptSchema from '../schema/receipt.schema.json';
import senatorSchema from '../schema/senator.schema.json';
import senatorSeedSchema from '../schema/senator_seed.schema.json';
import eventSchema from '../schema/event.schema.json';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

// Register schemas in dependency order
ajv.addSchema(receiptSchema);
ajv.addSchema(senatorSchema);
ajv.addSchema(senatorSeedSchema);
ajv.addSchema(eventSchema);

/**
 * Validate data against a registered schema by $id. Throws on failure.
 * @param schemaId - The $id of the schema (e.g. "halo.event.v1")
 * @param data - The data to validate
 */
export function validateOrThrow(schemaId: string, data: unknown): void {
  const validate = ajv.getSchema(schemaId);
  if (!validate) throw new Error(`Schema not registered: ${schemaId}`);
  if (!validate(data)) {
    throw new Error(`Schema validation failed for ${schemaId}: ${ajv.errorsText(validate.errors, { dataVar: 'data' })}`);
  }
}
