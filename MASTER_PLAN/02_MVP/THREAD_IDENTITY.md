# Identidad operativa de hilos — protocolo mínimo v1

**Decisión:** 26/10/2026 · Rector [Asteroides MVP #1](https://github.com/jonyspiral/asteroides/issues/1) · [ADR-0001 MAIN/ING](../04_DECISIONS/ADR-0001-main-ing-colaboracion.md).

## Tres referencias diferentes

| Campo | Qué identifica | Fuente |
|---|---|---|
| `ROLE_ID` | La función estable (no un modelo): `PC-ING`, `SERVER-MAIN` | [AGENT_REGISTRY.yml](AGENT_REGISTRY.yml) |
| `THREAD_REF` | Alias lógico único por conversación, asignado al iniciar | Mini prompt del hilo y registro declarado |
| `TASK_REF` | Rector (lectura) o Work Unit (ejecución) en curso | GitHub, siempre revalidado |

**`THREAD_REF` NO es un ID interno verificable del proveedor.** Las entradas actuales son **candidatas**, no conversaciones enlazadas. Al pegar el starter, el agente reconoce su alias operativo, pero no se autentica ni obtiene permisos. No deducir identidades a partir del modelo, título o nombre del chat. Si se renueva la conversación, asignar un nuevo alias `...-02` y reutilizar el rector sin modificarlo.

## Primeros pasos al iniciar o retomar

1. Leer el `AGENTS.md` local. Resolver `ROLE_ID` y `THREAD_REF` desde el mensaje inicial del hilo; verificar que el rol y su `rector_ref` figuren en el registro.
2. Leer únicamente el rector y la WU relevantes de GitHub. Si no hay tarea ejecutable, declarar `TASK_REF: pendiente` y no usar el rector como autorización de ejecución.
3. Informar al principio de una sesión operativa: `ROLE_ID / THREAD_REF / RECTOR_REF / TASK_REF / objetivo siguiente`. No repetir esa cabecera en cada intercambio.
4. MAIN coordina y acepta; ING ejecuta o delega con sus propios límites. GitHub Issues/PR/receipts son el canal durable; un comentario no despierta automáticamente a otro agente.
5. Cambios persistentes: aplicar claims, scope y permisos de Harness/PC vigentes. `ROLE_ID`, `THREAD_REF` y un mini prompt **no** sustituyen identidad autenticada, autorización OWNER, execution ID ni `TaskRef` válido.

## Activación de un hilo ya existente

Pegar **una sola vez** el mini prompt de [THREAD_STARTER.md](THREAD_STARTER.md) apropiado. El agente confirma la identidad funcional y consulta GitHub si tiene acceso. Si no puede leer el rector, debe declarar esa limitación; no inventar su estado. Para cambiar de rol, utilizar un nuevo starter explícito del OWNER y actualizar el registro si corresponde.

## Privacidad

`jonyspiral/asteroides` es un repositorio **público**. No guardar enlaces privados de conversaciones, datos personales, secretos, credenciales, transcripciones ni tokens aquí. Este registro sólo almacena identidades funcionales y aliases. Las URLs privadas, si alguna vez fueran necesarias, se administrarían por un canal privado aprobado.

## Creación de rectores

Nuevos rectores incluyen el bloque `ASTEROIDES:MAIN-ING:v1` de la [plantilla GitHub](../../.github/ISSUE_TEMPLATE/rector.md). Los agentes que los creen por API/MCP lo incorporan expresamente: GitHub no aplica plantillas UI a esa ruta. El rector no tiene lease, PR ni rama permanente. La plataforma de chat, modelo y subagentes no modifican este contrato.
