
import Ajv from 'ajv';
import senatorSchema from '../schema/senator.schema.json';
import eventSchema from '../schema/event.schema.json';
import receiptSchema from '../schema/receipt.schema.json';
import senatorSeedSchema from '../schema/senator_seed.schema.json';

const ajv = new Ajv({ allErrors: true });
export const validateSenator = ajv.compile(senatorSchema);
export const validateEvent = ajv.compile(eventSchema);
export const validateReceipt = ajv.compile(receiptSchema);
export const validateSenatorSeed = ajv.compile(senatorSeedSchema);

export function validateOrThrow(type: 'senator' | 'event' | 'receipt' | 'senator_seed', obj: any) {
	let valid = false;
	switch (type) {
		case 'senator':
			valid = validateSenator(obj);
			if (!valid) throw new Error('Senator schema validation failed: ' + JSON.stringify(validateSenator.errors));
			break;
		case 'event':
			valid = validateEvent(obj);
			if (!valid) throw new Error('Event schema validation failed: ' + JSON.stringify(validateEvent.errors));
			break;
		case 'receipt':
			valid = validateReceipt(obj);
			if (!valid) throw new Error('Receipt schema validation failed: ' + JSON.stringify(validateReceipt.errors));
			break;
		case 'senator_seed':
			valid = validateSenatorSeed(obj);
			if (!valid) throw new Error('Senator seed schema validation failed: ' + JSON.stringify(validateSenatorSeed.errors));
			break;
		default:
			throw new Error('Unknown schema type: ' + type);
	}
}
