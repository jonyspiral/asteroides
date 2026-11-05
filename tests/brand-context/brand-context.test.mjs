import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build, canonicalBytes, loadCatalog, validateRequest, verifyArtifact, verifyWorktreeBytes } from '../../scripts/brand-context/brand-context.mjs';

const asOf = '2026-11-05T12:00:00Z';
const fixtures = [
  ['dorso-brand', 'brand://dorso', null, 'sha256:da5938f3f648e3faf5f8de848be47bfab943605f46fd6b048e528ad3481a5ae8'],
  ['spiral-brand-general', 'brand://spiral', null, 'sha256:62fea2f0c3c3c20fe83c694a5887043bc346e353de5132e06c744d8a45bf1790'],
  ['spiral-product-ymodel2', 'brand://spiral', 'product:spiral/ymodel-2', 'sha256:0af6a4851575caff38e3705e9ce5b02ffcc24764e94753bb9498761ffe3a2663']
];

test('golden artifacts require a trusted external artifact digest', async () => {
  const catalog = await loadCatalog();
  for (const [name, brandRef, , trustedSha] of fixtures) {
    const bytes = await readFile(new URL(`../../fixtures/brand-context/${name}.json`, import.meta.url));
    const manifest = JSON.parse(await readFile(new URL(`../../fixtures/brand-context/${name}.json.manifest.json`, import.meta.url)));
    const entry = catalog.sources.find(item => item.brand_ref === brandRef);
    const artifact = verifyArtifact(bytes, manifest, entry, trustedSha, brandRef);
    assert.equal(artifact.schema, 'asteroides/brand-context/v1');
    assert.equal(artifact.as_of, asOf);
    assert.throws(() => verifyArtifact(bytes, manifest, entry, trustedSha, brandRef === 'brand://dorso' ? 'brand://spiral' : 'brand://dorso'), /UNTRUSTED_ARTIFACT/);
    assert.throws(() => verifyArtifact(bytes, manifest, entry, 'sha256:' + '0'.repeat(64), brandRef), /UNTRUSTED_ARTIFACT/);
    const forged = { ...artifact, claims: [] };
    assert.throws(() => verifyArtifact(canonicalBytes(forged), manifest, entry, trustedSha, brandRef), /UNTRUSTED_ARTIFACT/);
    assert.throws(() => verifyArtifact(bytes, { ...manifest, commit: '0'.repeat(40) }, entry, trustedSha, brandRef), /UNTRUSTED_ARTIFACT/);
  }
});

test('DORSO preserves statuses and asset rights independently', async () => {
  const brain = JSON.parse(await readFile(new URL('../../fixtures/brand-context/dorso-brand.json', import.meta.url)));
  assert.equal(brain.claims.length, 19);
  assert.deepEqual(Object.fromEntries(['approved', 'proposed', 'unknown'].map(status => [status, brain.claims.filter(claim => claim.knowledge_status === status).length])),
    { approved: 16, proposed: 1, unknown: 2 });
  assert.equal(brain.assets.length, 1);
  assert.deepEqual(brain.assets[0].restrictions, ['pilot_reference_only', 'no_publication_without_specific_authorization']);
  assert.equal(brain.claims.find(claim => claim.claim_id === 'dorso.voice-brief').approval_scope, 'unknown');
  assert.equal(brain.claims.find(claim => claim.claim_id === 'dorso.audience-hypothesis').knowledge_status, 'proposed');
  assert.ok(brain.unknowns.some(item => item.unknown_id === 'commercial-policy'));
});

test('Spiral brand context does not invent a product or inherit draft11', async () => {
  const brand = JSON.parse(await readFile(new URL('../../fixtures/brand-context/spiral-brand-general.json', import.meta.url)));
  const product = JSON.parse(await readFile(new URL('../../fixtures/brand-context/spiral-product-ymodel2.json', import.meta.url)));
  assert.equal(brand.native_snapshot_digest, null);
  assert.ok(brand.claims.some(claim => claim.claim_id === 'spiral.identity.name' && claim.knowledge_status === 'approved'));
  assert.ok(brand.claims.some(claim => claim.section === 'voice' && claim.knowledge_status === 'proposed'));
  assert.ok(!brand.claims.some(claim => claim.section === 'products'));
  assert.ok(product.claims.some(claim => claim.original_field === 'product.ymodel-2.copy.subject'));
  assert.notEqual(product.native_snapshot_digest, product.snapshot_digest);
  assert.notEqual(product.snapshot_digest, brand.snapshot_digest);
});

test('invalid date, brand and product references are rejected', () => {
  for (const as_of of ['2026-02-30T12:00:00Z', '2026-11-05T12:00:00+00:00', '2026-11-05']) {
    assert.throws(() => validateRequest({ brand_ref: 'brand://dorso', as_of }), /INVALID_AS_OF/);
  }
  assert.throws(() => validateRequest({ brand_ref: 'brand://', as_of: asOf }), /INVALID_BRAND_REF/);
  assert.throws(() => validateRequest({ brand_ref: 'brand://dorso', as_of: asOf, sections: ['identity', 'identity'] }), /INVALID_SECTIONS/);
  assert.throws(() => validateRequest({ brand_ref: 'brand://dorso', as_of: asOf, sections: ['arbitrary'] }), /INVALID_SECTIONS/);
});

test('checkout bytes permit only the Git LF-to-CRLF conversion', () => {
  const pinned = Buffer.from('alpha\nbeta\n');
  assert.doesNotThrow(() => verifyWorktreeBytes(pinned, pinned));
  assert.doesNotThrow(() => verifyWorktreeBytes(Buffer.from('alpha\r\nbeta\r\n'), pinned));
  assert.throws(() => verifyWorktreeBytes(Buffer.from('alpha\nbeta changed\n'), pinned), /SOURCE_WORKTREE_MISMATCH/);
});

const roots = { 'brand://spiral': process.env.BRAND_SPIRAL_ROOT, 'brand://dorso': process.env.BRAND_DORSO_ROOT };
test('two clean builds reproduce the golden bytes and digests', { skip: !roots['brand://spiral'] || !roots['brand://dorso'] }, async () => {
  for (const [name, brand_ref, product_ref] of fixtures) {
    const request = { brand_ref, as_of: asOf, ...(product_ref ? { product_ref } : {}) };
    const first = await build(request, roots);
    const second = await build(request, roots);
    const golden = await readFile(new URL(`../../fixtures/brand-context/${name}.json`, import.meta.url));
    assert.deepEqual(first.artifactBytes, second.artifactBytes);
    assert.deepEqual(first.manifestBytes, second.manifestBytes);
    assert.deepEqual(first.artifactBytes, golden);
  }
  await assert.rejects(build({ brand_ref: 'brand://dorso', as_of: asOf, product_ref: 'product:spiral/ymodel-2' }, roots), /UNRESOLVED_PRODUCT/);
  await assert.rejects(build({ brand_ref: 'brand://spiral', as_of: asOf, product_ref: 'product:spiral/ymodel' }, roots), /UNRESOLVED_PRODUCT/);
  await assert.rejects(build({ brand_ref: 'brand://unknown', as_of: asOf }, roots), /UNAVAILABLE_BRAND/);
  if (process.env.BRAND_SPIRAL_WRONG_HEAD_ROOT) {
    await assert.rejects(build({ brand_ref: 'brand://spiral', as_of: asOf }, { ...roots, 'brand://spiral': process.env.BRAND_SPIRAL_WRONG_HEAD_ROOT }), /SOURCE_CHECKOUT_MISMATCH/);
  }
  const catalog = await loadCatalog();
  const altered = structuredClone(catalog);
  altered.sources[0].required_files[0].sha256 = '0'.repeat(64);
  await assert.rejects(build({ brand_ref: 'brand://dorso', as_of: asOf }, roots, altered), /SOURCE_BYTES_MISMATCH/);
});
