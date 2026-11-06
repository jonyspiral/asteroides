# ASTEROIDES MVP — Entrada obligatoria para agentes

Este repositorio es el **proyecto madre del ecosistema Asteroides**, no un executor ni el código de todos los subproductos.

## Lectura inicial mínima

1. Este `AGENTS.md` y [Master Plan](MASTER_PLAN/README.md).
2. [ADR-0001: MAIN / ING](MASTER_PLAN/04_DECISIONS/ADR-0001-main-ing-colaboracion.md).
3. Rector global `jonyspiral/asteroides#1`, rector del dominio y TaskRef activo en GitHub.
4. Harness y contratos locales **del proyecto donde realmente se ejecuta**. No recorrer todo el historial.

## Identidad operativa por entorno — sólo al crear o cambiar de hilo

**Punto de entrada ChatGPT:** instrucciones del **Project** al crear una conversación, o el mensaje inicial si ese entorno no las incluye. Esas instrucciones deben apuntar una sola vez a [THREAD_IDENTITY.md](MASTER_PLAN/02_MVP/THREAD_IDENTITY.md), [AGENT_REGISTRY.yml](MASTER_PLAN/02_MVP/AGENT_REGISTRY.yml) y [THREAD_STARTER.md](MASTER_PLAN/02_MVP/THREAD_STARTER.md). **GitHub no modifica automáticamente las instrucciones de un Project de ChatGPT.**

**Punto de entrada Work:** `AGENTS.md` **del repositorio activo**, leído al abrir el entorno. Este archivo es el entrypoint únicamente de `jonyspiral/asteroides`; Work en KOI2, Growth u otro repo debe recibir un **puntero mínimo en su propio `AGENTS.md`** mediante adopción independiente, no se presume que haya heredado este contenido. Si Work ya tiene `ROLE_ID` y `THREAD_REF` lógico declarados en el contexto de su sesión, no releer el registro.

**Declaración inicial una sola vez:** resolver el `ROLE_ID` existente del registry, asignar `THREAD_REF` lógico `ROLE_ID-01` o siguiente alias libre (no es ID de proveedor), y declarar `RECTOR_REF`, `reports_to` y `execution_environment` en el contexto del hilo. Si existe un archivo de notas **privado de esa sesión**, registrar allí los mismos campos mínimos conforme al protocolo; nunca versionar el archivo ni publicar IDs/URLs nativos. Si no hay archivo interno accesible, el mensaje inicial es suficiente: no crear infraestructura para suplirlo.

No modificar `.harness/current-task.md` ni `AGENTS.md` por cada conversación: el primero describe el trabajo activo, el segundo da instrucciones estables. El `TASK_REF` se verifica aparte en GitHub **sólo cuando haya una Work Unit real**. No añadir consultas de registry, cabeceras repetidas, checks o pasos extra a tareas normales.

## MAIN / ING obligatorio para rectores

Cuando se crea un Issue de tipo **rector**, incluir en su body el bloque `ASTEROIDES:MAIN-ING:v1` aprobado en ADR-0001. Usar la plantilla `.github/ISSUE_TEMPLATE/rector.md` al abrir desde la interfaz de GitHub; **si el rector se crea mediante API o MCP, incluir el bloque explícitamente**, pues GitHub no aplica la plantilla a esas llamadas.

MAIN mantiene responsabilidad de punta a punta, ING ejecuta WUs con alcance y evidencias, y puede delegar tareas nativamente si aporta valor. La coordinación operativa MAIN↔ING e ING↔ING se realiza por chat nativo ChatGPT/Work cuando está disponible; GitHub conserva las decisiones, WUs, PR y evidencias durables. Publicar un comentario no despierta una conversación Work. Un rector **no** tiene lease, rama o PR permanente; la delegación **no** hereda autorización.

En un rector anterior sin bloque, registrar la adopción una vez mediante comentario con enlace a ADR-0001 y preservar el body existente.

## Fronteras

Core administra contexto global; Project Control gobierna WUs y autorización; Harness conserva reglas locales; Executor/MCP ejecutan capacidades cerradas. Contexto heredado no implica privilegios heredados. No crear sistemas paralelos, repositorios vacíos ni nuevas WUs por ceremonia.
