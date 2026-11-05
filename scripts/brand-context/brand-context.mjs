import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const catalogPath = fileURLToPath(new URL('../../MASTER_PLAN/02_MVP/BRAND_SOURCES.json', import.meta.url));
const allowedSections = new Set(['identity', 'positioning', 'purpose', 'personality', 'voice', 'audiences', 'content', 'products', 'commercial_rules', 'content_pillars', 'campaign_playbook', 'references', 'assets']);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (plain(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || (Number.isInteger(value) && Number.isSafeInteger(value))) return value;
  throw new Error('UNSUPPORTED_CANONICAL_VALUE');
}

export const canonicalBytes = value => Buffer.from(`${JSON.stringify(canonical(value))}\n`, 'utf8');

export function validateRequest(request) {
  if (!plain(request) || !/^brand:\/\/[a-z][a-z0-9-]*$/.test(request.brand_ref ?? '')) throw new Error('INVALID_BRAND_REF');
  if (typeof request.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(request.as_of) || Number.isNaN(Date.parse(request.as_of)) || new Date(request.as_of).toISOString() !== request.as_of.replace('Z', '.000Z')) throw new Error('INVALID_AS_OF');
  if (request.sections !== undefined && (!Array.isArray(request.sections) || !request.sections.length || new Set(request.sections).size !== request.sections.length || request.sections.some(section => !allowedSections.has(section)))) throw new Error('INVALID_SECTIONS');
  if (request.product_ref !== undefined && request.product_ref !== null && (typeof request.product_ref !== 'string' || !/^product:[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(request.product_ref))) throw new Error('INVALID_PRODUCT_REF');
  if (Object.keys(request).some(key => !['brand_ref', 'as_of', 'sections', 'product_ref'].includes(key))) throw new Error('INVALID_REQUEST');
}

export async function loadCatalog() {
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
  if (catalog.schema !== 'asteroides/brand-sources/v1' || !Array.isArray(catalog.sources)) throw new Error('INVALID_CATALOG');
  return catalog;
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
}

function sourceBytes(entry, root) {
  const origin = git(root, 'remote', 'get-url', 'origin').toString('utf8').trim();
  if (![`https://github.com/${entry.canonical_repo}.git`, `https://github.com/${entry.canonical_repo}`, `git@github.com:${entry.canonical_repo}.git`].includes(origin)) throw new Error('SOURCE_REPO_MISMATCH');
  if (!/^[a-f0-9]{40}$/.test(entry.commit) || git(root, 'rev-parse', `${entry.commit}^{commit}`).toString('utf8').trim() !== entry.commit) throw new Error('SOURCE_PIN_MISMATCH');
  const files = {};
  for (const file of entry.required_files) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(file.path)) throw new Error('INVALID_SOURCE_PATH');
    const blob = git(root, 'rev-parse', `${entry.commit}:${file.path}`).toString('utf8').trim();
    const bytes = git(root, 'show', `${entry.commit}:${file.path}`);
    if (blob !== file.blob_git_sha || sha(bytes) !== file.sha256) throw new Error('SOURCE_BYTES_MISMATCH');
    files[file.path] = bytes;
  }
  return files;
}

async function importPinned(bytes) {
  return import(`data:text/javascript;base64,${bytes.toString('base64')}`);
}

const sectionName = name => ({ 'commercial-rules': 'commercial_rules', voice_and_tone: 'voice', product_positioning: 'products' })[name] ?? name;
const asArray = value => value === undefined ? [] : Array.isArray(value) ? value : [value];

function spiralProjection(entry, files, request) {
  return importPinned(files[entry.engine_entry]).then(engine => {
    const brain = JSON.parse(files['docs/brand/brain.json']);
    const media = JSON.parse(files['assets/media/manifest.json']);
    const bundle = { brain, media };
    if (engine.validateBundle(bundle).errors.length) throw new Error('INVALID_SOURCE_PROFILE');
    if (brain.brand !== 'spiral' || request.brand_ref !== 'brand://spiral') throw new Error('BRAND_MISMATCH');
    const wanted = request.sections ? new Set(request.sections) : null;
    const claims = [];
    const addGroup = (group, section, prefix) => {
      for (const [field, value] of Object.entries(group.content)) {
        const originalField = `${prefix}.${field}`;
        const source = brain.sources[group.source_ref];
        claims.push({ claim_id: `spiral.${originalField.replaceAll('/', '.')}`, section, original_field: originalField, value,
          knowledge_status: group.status, source_ref: group.source_ref, source_uri: source.uri,
          approval_ref: source.approval_ref ?? null, approval_scope: source.approved_for ?? 'unknown',
          conditions: [], restrictions: asArray(group.content.restrictions), valid_at: null, expires_at: null,
          provenance: { profile: entry.profile, source_file: 'docs/brand/brain.json' },
          scope_verification: source.approved_for ? 'SOURCE_SCOPED' : 'SCOPE_NOT_MACHINE_VERIFIABLE' });
      }
      for (const [name, child] of Object.entries(group.overrides ?? {})) addGroup(child, section, `${prefix}.${name}`);
    };
    for (const name of Object.keys(brain.sections)) {
      const section = sectionName(name);
      if (!wanted || wanted.has(section)) addGroup(engine.resolveReference(bundle, `brand://spiral/${name}`, 'spiral'), section, name);
    }
    let nativeDigest = null;
    if (request.product_ref !== undefined && request.product_ref !== null) {
      if (request.product_ref !== 'product:spiral/ymodel-2') throw new Error('UNRESOLVED_PRODUCT');
      const product = engine.resolveReference(bundle, 'brand://spiral/product/ymodel-2', 'spiral');
      if (!wanted || wanted.has('products')) addGroup(product, 'products', 'product.ymodel-2');
      nativeDigest = engine.buildSnapshot(bundle, { tenant: 'spiral', product: request.product_ref, asOf: request.as_of }).digest;
    }
    const assets = (!wanted || wanted.has('assets')) ? media.assets.map(item => {
      const asset = engine.resolveReference(bundle, `asset://spiral/${item.asset_id}`, 'spiral');
      return { asset_id: asset.asset_id, status: asset.status, source_ref: asset.source_ref, source_uri: asset.source.uri,
        logical_uri: asset.logical_uri, revision: asset.revision, digest: asset.digest ?? null, type: asset.type, role: asset.role,
        rights: 'unknown', usage: 'unknown', restrictions: [], product_refs: asset.product_refs };
    }) : [];
    return { claims, assets, unknowns: [], limitations: ['OFFLINE_PINNED_REFERENCES_NOT_LIVE', 'NO_BUSINESS_EXECUTION_AUTHORITY'], native_snapshot_digest: nativeDigest };
  });
}

async function dorsoProjection(entry, files, request) {
  const engine = await importPinned(files[entry.engine_entry]);
  const brain = JSON.parse(files['docs/brand/brand-brain.yml']);
  const references = JSON.parse(files['docs/brand/REFERENCES.yml']);
  const media = JSON.parse(files['assets/media/manifest.yml']);
  const knownReferenceIds = new Set(references.references.map(item => item.reference_id));
  if (brain.brand !== 'DORSO' || request.brand_ref !== 'brand://dorso' ||
      engine.validateReferenceRegistry(references).errors.length ||
      engine.validateBrandBrain(brain, { knownReferenceIds }).errors.length ||
      engine.validateAssetRegistry(media, { knownReferenceIds }).errors.length) throw new Error('INVALID_SOURCE_PROFILE');
  if (request.product_ref !== undefined && request.product_ref !== null) throw new Error('UNRESOLVED_PRODUCT');
  const wanted = request.sections ? new Set(request.sections) : null;
  const refById = new Map(references.references.map(item => [item.reference_id, item]));
  const claims = [];
  for (const [sourceSection, items] of Object.entries(brain.sections)) {
    const section = sectionName(sourceSection);
    if (wanted && !wanted.has(section)) continue;
    for (const item of items) {
      const ref = refById.get(item.source_ref);
      claims.push({ claim_id: `dorso.${item.claim_id}`, section, original_field: `sections.${sourceSection}.${item.claim_id}.statement`,
        value: item.statement, knowledge_status: item.status, source_ref: item.source_ref, source_uri: ref.logical_ref,
        approval_ref: ref.approval_ref ?? null, approval_scope: 'unknown', conditions: asArray(item.conditions), restrictions: [],
        valid_at: null, expires_at: null,
        provenance: { profile: entry.profile, source_file: 'docs/brand/brand-brain.yml', reference_version: ref.source_version },
        scope_verification: 'SCOPE_NOT_MACHINE_VERIFIABLE' });
    }
  }
  const assets = (!wanted || wanted.has('assets')) ? media.assets.map(item => ({
    asset_id: item.asset_id, status: item.status, source_ref: item.source_ref, source_uri: item.source.uri,
    logical_uri: item.logical_uri, revision: item.version, digest: item.digest ?? null, type: item.type, role: item.role,
    rights: item.rights, usage: item.usage, restrictions: item.rights.restrictions, product_refs: item.product_refs ?? []
  })) : [];
  const unknowns = brain.unknowns.map(item => ({ unknown_id: item.unknown_id, question: item.question, owner: item.owner, source_ref: item.source_ref, status: item.status }));
  return { claims, assets, unknowns, limitations: ['OFFLINE_PINNED_REFERENCES_NOT_LIVE', 'NO_BUSINESS_EXECUTION_AUTHORITY', ...brain.exclusions], native_snapshot_digest: null };
}

export async function build(request, roots, catalog = null) {
  validateRequest(request);
  catalog ??= await loadCatalog();
  const entry = catalog.sources.find(item => item.brand_ref === request.brand_ref && item.status === 'active');
  if (!entry) throw new Error('UNAVAILABLE_BRAND');
  const root = roots[request.brand_ref];
  if (typeof root !== 'string') throw new Error('SOURCE_ROOT_REQUIRED');
  const files = sourceBytes(entry, root);
  const profile = entry.brand_ref === 'brand://spiral' ? await spiralProjection(entry, files, request) :
    entry.brand_ref === 'brand://dorso' ? await dorsoProjection(entry, files, request) : null;
  if (!profile) throw new Error('UNSUPPORTED_PROFILE');
  profile.claims.sort((a, b) => a.section.localeCompare(b.section, 'en') || a.claim_id.localeCompare(b.claim_id, 'en'));
  profile.assets.sort((a, b) => a.asset_id.localeCompare(b.asset_id, 'en'));
  profile.unknowns.sort((a, b) => a.unknown_id.localeCompare(b.unknown_id, 'en'));
  profile.limitations.sort();
  const source_files = entry.required_files.map(file => ({ path: file.path, git_blob_sha: file.blob_git_sha, sha256: file.sha256 }));
  const projection = { schema: 'asteroides/brand-context/v1', brand_ref: request.brand_ref, as_of: request.as_of,
    source: { repo: entry.canonical_repo, commit: entry.commit, profile: entry.profile, source_files },
    claims: profile.claims, assets: profile.assets, unknowns: profile.unknowns, limitations: profile.limitations,
    native_snapshot_digest: profile.native_snapshot_digest };
  const snapshot_digest = `sha256:${sha(canonicalBytes(projection))}`;
  const artifact = { ...projection, snapshot_digest };
  const artifactBytes = canonicalBytes(artifact);
  const manifest = { schema: 'asteroides/brand-context-manifest/v1', brand_ref: request.brand_ref,
    repo: entry.canonical_repo, commit: entry.commit, profile: entry.profile, as_of: request.as_of,
    source_files, projection_spec_revision: 'asteroides/brand-json-c14n/v1', snapshot_digest,
    artifact_sha256: `sha256:${sha(artifactBytes)}` };
  return { artifact, artifactBytes, manifest, manifestBytes: canonicalBytes(manifest) };
}

export function verifyArtifact(artifactBytes, manifest, trustedEntry, trustedArtifactSha, brandRef) {
  if (!Buffer.isBuffer(artifactBytes) || !trustedEntry || !/^sha256:[a-f0-9]{64}$/.test(trustedArtifactSha ?? '') ||
      brandRef !== trustedEntry.brand_ref || manifest.schema !== 'asteroides/brand-context-manifest/v1' ||
      manifest.projection_spec_revision !== 'asteroides/brand-json-c14n/v1' || manifest.brand_ref !== brandRef ||
      manifest.repo !== trustedEntry.canonical_repo || manifest.commit !== trustedEntry.commit || manifest.profile !== trustedEntry.profile ||
      !canonicalBytes(manifest.source_files).equals(canonicalBytes(trustedEntry.required_files.map(file => ({ path: file.path, git_blob_sha: file.blob_git_sha, sha256: file.sha256 })))) ||
      manifest.artifact_sha256 !== trustedArtifactSha || manifest.artifact_sha256 !== `sha256:${sha(artifactBytes)}`) throw new Error('UNTRUSTED_ARTIFACT');
  const artifact = JSON.parse(artifactBytes);
  if (artifact.brand_ref !== brandRef || artifact.source.repo !== manifest.repo || artifact.source.commit !== manifest.commit ||
      artifact.as_of !== manifest.as_of || artifact.source.profile !== manifest.profile ||
      !canonicalBytes(artifact.source.source_files).equals(canonicalBytes(manifest.source_files)) ||
      artifact.snapshot_digest !== manifest.snapshot_digest ||
      !artifactBytes.equals(canonicalBytes(artifact))) throw new Error('INVALID_ARTIFACT');
  const { snapshot_digest, ...projection } = artifact;
  if (snapshot_digest !== `sha256:${sha(canonicalBytes(projection))}`) throw new Error('INVALID_SNAPSHOT_DIGEST');
  return artifact;
}

async function main(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--brand-ref', '--as-of', '--product-ref', '--spiral-root', '--dorso-root', '--out'].includes(args[i]) || !args[i + 1] || options[args[i]]) throw new Error('INVALID_ARGUMENT');
    options[args[i]] = args[i + 1];
  }
  if (!options['--out']) throw new Error('OUTPUT_REQUIRED');
  const result = await build({ brand_ref: options['--brand-ref'], as_of: options['--as-of'], ...(options['--product-ref'] ? { product_ref: options['--product-ref'] } : {}) },
    { 'brand://spiral': options['--spiral-root'], 'brand://dorso': options['--dorso-root'] });
  const out = resolve(options['--out']);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, result.artifactBytes);
  await writeFile(`${out}.manifest.json`, result.manifestBytes);
  console.log(JSON.stringify({ brand_ref: result.artifact.brand_ref, snapshot_digest: result.artifact.snapshot_digest, artifact_sha256: result.manifest.artifact_sha256, claims: result.artifact.claims.length }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
