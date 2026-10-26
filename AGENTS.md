# ASTEROIDES MVP — Entrada obligatoria para agentes

Este repositorio es el **proyecto madre del ecosistema Asteroides**, no un executor ni el código de todos los subproductos.

## Lectura inicial mínima

1. Este `AGENTS.md` y [Master Plan](MASTER_PLAN/README.md).
2. [ADR-0001: MAIN / ING](MASTER_PLAN/04_DECISIONS/ADR-0001-main-ing-colaboracion.md).
3. Rector global `jonyspiral/asteroides#1`, rector del dominio y TaskRef activo en GitHub.
4. Harness y contratos locales **del proyecto donde realmente se ejecuta**. No recorrer todo el historial.

## Identidad operativa del hilo — sólo cuando cambia

Si el mini prompt del hilo ya declara `ROLE_ID` y `THREAD_REF`, **reutilizarlos sin nuevas lecturas**. Sólo al crear/cambiar de hilo o rol, y si falta identidad, consultar una vez [AGENT_REGISTRY.yml](MASTER_PLAN/02_MVP/AGENT_REGISTRY.yml) o [THREAD_IDENTITY.md](MASTER_PLAN/02_MVP/THREAD_IDENTITY.md), y asignar el mini prompt de [THREAD_STARTER.md](MASTER_PLAN/02_MVP/THREAD_STARTER.md). Son alias, no credenciales. `TASK_REF` se verifica en GitHub **cuando exista una Work Unit real**.

No añadir consultas de registry, llamadas MCP, verificación de identidad, cabeceras repetidas ni pasos de coordinación a tareas normales. No almacenar URLs privadas de conversaciones en este repo público.

## MAIN / ING obligatorio para rectores

Cuando se crea un Issue de tipo **rector**, incluir en su body el bloque `ASTEROIDES:MAIN-ING:v1` aprobado en ADR-0001. Usar la plantilla `.github/ISSUE_TEMPLATE/rector.md` al abrir desde la interfaz de GitHub; **si el rector se crea mediante API o MCP, incluir el bloque explícitamente**, pues GitHub no aplica la plantilla a esas llamadas.

MAIN mantiene responsabilidad de punta a punta, ING ejecuta WUs con alcance y evidencias, y puede delegar tareas nativamente si aporta valor. La coordinación entre agentes se publica en Issues/PR/comentarios de GitHub: el OWNER no transporta mensajes. Un rector **no** tiene lease, rama o PR permanente; la delegación **no** hereda autorización.

En un rector anterior sin bloque, registrar la adopción una vez mediante comentario con enlace a ADR-0001 y preservar el body existente.

## Fronteras

Core administra contexto global; Project Control gobierna WUs y autorización; Harness conserva reglas locales; Executor/MCP ejecutan capacidades cerradas. Contexto heredado no implica privilegios heredados. No crear sistemas paralelos, repositorios vacíos ni nuevas WUs por ceremonia.
