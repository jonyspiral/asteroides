# Brand Context v1

`MASTER_PLAN/02_MVP/BRAND_SOURCES.json` binds explicit `brand://` identities to
reviewed Git commits and source-file bytes. The offline builder requires an
exact-HEAD checkout with the pinned files unmodified (ordinary Git CRLF
conversion is accepted), reads those Git objects locally, validates each brand using its pinned native validator, then
projects them to `asteroides/brand-context/v1`. It never fetches a URL or calls
a provider. A new brand needs an explicit catalog pin and a reviewed profile
adapter; a free-form repository or URL supplied by a request is rejected.

The projection is JSON UTF-8 with LF, recursively sorted object keys, stable
claim/asset order and an explicit UTC `as_of`. `snapshot_digest` hashes the
projection without itself. The companion manifest hashes the final artifact
bytes and records the source Git blobs. A consumer must pin the catalog entry
**and the expected artifact SHA** in reviewed source/config; the manifest alone
does not authenticate its own contents. `verifyArtifact` requires that separate
trusted SHA. When a source pin or `as_of` changes, regenerate and review the
artifact and consumer pin together.

`knowledge_status` describes the source, not permission to publish. A
`proposed` claim can inform a labeled `PREVIEW_ONLY` proposal; an `unknown`
claim is a question, never an invented fact. Rights and usage limits of an
asset remain separate from the claims. Publication, sending and spend require
their own gates.

Local checks with the pinned repositories available:

```sh
BRAND_SPIRAL_ROOT=/path/to/spiral BRAND_DORSO_ROOT=/path/to/dorso node --test tests/brand-context/*.test.mjs
```

The checked-in golden artifacts can be verified without the source repos.
