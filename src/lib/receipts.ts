import { sha256Canonical } from './hash';
import { validateOrThrow } from './validate';

export function createReceipt(artifact: any, artifactType: 'senator' | 'event', issuerVersion: string): any {
  // Remove receipt field if present
  const artifactCopy = { ...artifact };
  if (artifactCopy.receipt) delete artifactCopy.receipt;

  // Validate artifact
  const schemaId = artifactType === 'senator' ? 'halo.senator.v1' : 'halo.event.v1';
  validateOrThrow(schemaId, artifactCopy);

  const artifactHash = sha256Canonical(artifactCopy);
  const receipt = {
    receipt_id: `rcpt_${artifactCopy.subject_id}_${Date.now()}`,
    schema_version: 'halo.receipt.v1',
    issued_at: new Date().toISOString(),
    issuer: { system: 'senate-accountability-tool', version: issuerVersion },
    subject_id: artifactCopy.subject_id,
    artifact_type: artifactType,
    artifact_hash: artifactHash,
    artifact_schema: artifactType === 'senator' ? 'halo.senator.v1' : 'halo.event.v1',
    evidence_hash: artifactCopy.evidence_hash || undefined,
    signatures: []
  };
  return receipt;
}
