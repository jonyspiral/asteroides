# Registro de repositorios — Asteroides MVP

## Existentes / fuente real

| Repositorio | Rol | Estado |
|---|---|---|
| `jonyspiral/asteroides` | Repo madre, Core v0.1, Master Plan y contexto global | existente |
| `jonyspiral/asteroides-harness` | Contrato local por repositorio | existente |
| `jonyspiral/project-control-mcp` | Execution Control Plane multi-proyecto | existente |
| `jonyspiral/asteroides-executor` | Ejecución interna allowlisted | existente |
| `jonyspiral/koi2` | Consumidor / vertical Commerce Ops | existente |
| `jonyspiral/cumbresymareas-web` | Consumidor / vertical Conversations | existente |

## Repos previstos cuando exista código independiente real

| Repositorio previsto | Rol | Estado / gate de creación |
|---|---|---|
| `jonyspiral/asteroides-console` | UI Projects / Console | `planned/not-created`; crear al iniciar Fase 2 |
| `jonyspiral/asteroides-conversations` | Producto conversacional reusable | `planned/not-created`; crear sólo tras validar frontera común desde CYM |
| `jonyspiral/asteroides-growth` | Growth / Ads Ops | `planned/not-created`; crear al iniciar implementación independiente de Fase 5 |

## Repos que NO se crean por anticipación

- `asteroides-core`: Core v0.1 vive en `jonyspiral/asteroides` hasta que una frontera runtime propia sea necesaria.
- `asteroides-commerce-ops`: primero se valida sobre Spiral/KOI2; se extrae sólo si aparece código transversal reusable.
- `asteroides-integrations`: las integraciones permanecen en adaptadores/MCP especializados hasta demostrar una biblioteca o producto común real.
- `asteroides-runtime-ops`: Harness, Project Control y Executor ya cubren las responsabilidades base; no duplicar.

## Limitación operativa registrada — 2026-08-13
La conexión GitHub disponible en ChatGPT permite repos, Issues, ramas, PR, archivos, commits y otras operaciones, pero no expone una acción para **crear repositorios nuevos**. Por ello los repos previstos quedan registrados como `planned/not-created`, sin afirmar que existen.
