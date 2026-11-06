# Identidad y coordinación MAIN / ING — protocolo operativo v1.1

- **Base:** decisión OWNER de 26/10/2026, [ADR-0001](../04_DECISIONS/ADR-0001-main-ing-colaboracion.md).
- **Aclaración aprobada:** 05/11/2026: los MAIN coordinan desde ChatGPT; los ING trabajan y pueden colaborar entre sí mediante el **chat nativo de Work**, como ya ocurre en PC Codex, Executor, Growth y KOI2.
- **Registro:** [AGENT_REGISTRY.yml](AGENT_REGISTRY.yml). No es una lista de IDs autenticados.

## Entradas canónicas al crear una conversación

| Entorno | Entrada efectiva al inicio | De dónde obtiene identidad |
|---|---|---|
| **ChatGPT** | **Instrucciones del Project** (o mensaje inicial si no están configuradas) | Puntero a `AGENT_REGISTRY.yml` para rol/relación y a `THREAD_STARTER.md` para declarar el alias una vez |
| **Work** | `AGENTS.md` **del repositorio activo** (y Harness local si corresponde) | Puntero al mismo registro/protocolo global; adopción por repositorio, no herencia automática |
| **Nuevo hilo sin identidad previa** | Starter de `THREAD_STARTER.md` usado **una vez** | `ROLE_ID` conocido + `THREAD_REF` lógico, nunca un ID inventado de plataforma |

Un archivo versionado de GitHub **no actualiza por sí solo** las instrucciones de un ChatGPT Project, ni se propaga automáticamente a los `AGENTS.md` de otros repositorios. Cada entorno debe adoptar su **puntero mínimo** desde su entrada real. No copiar el registry a las WUs ni añadir consultas por tarea.

Para nombrar un hilo: conservar `ROLE_ID` estable del registro (ej. `AST-MVP-MAIN`, `KOI2-MAIN`, `KOI2-ING`), y elegir `THREAD_REF` lógico con forma `ROLE_ID-NN` no ocupado (`-01` para el primero declarado). Alias y rol no equivalen a una vinculación autenticada. Un chat Work identificado sin alias no recibe un alias inventado.

**Identidades declaradas en este alcance:** `AST-MVP-MAIN` y alias lógico `AST-MVP-MAIN-01` se corresponden con el registro y la función de este chat; el binding a ID nativo permanece pendiente. KOI2-MAIN declaró `KOI2-MAIN-01`; identificó el chat real KOI2 ING y comprobó su canal nativo, **sin** aportar alias público ni autorizar publicar vínculos privados.

## Identidad mínima (una sola vez por hilo)

| Campo | Propósito |
|---|---|
| `ROLE_ID` | Función estable del agente, aunque cambie el modelo |
| `THREAD_REF` | Alias lógico opcional; no es el ID interno de ChatGPT, Claude ni Work |
| `reports_to` | MAIN funcional responsable de esa función; no concede permisos |
| `execution_environment` | ChatGPT para MAIN; Work para los ING señalados por OWNER |
| `coordination` | `native_chat_to_work`, `native_work_chat` o canal disponible |
| `RECTOR_REF` | Rector de gobierno del proyecto |
| `TASK_REF` | Work Unit real resuelta al comenzar una tarea ejecutable |

**No equiparar `PC-ING` (hilo Claude previamente declarado) con `PC-CODEX-ING` (ingeniero Work).** Las dos referencias son operativas y responden a `PC-MAIN`. No inventar URLs, IDs nativos ni vinculación de una sesión.

## Registro interno de la identidad (una vez, nunca por tarea)

1. En el **primer mensaje de contexto** de la conversación declarar: `ROLE_ID`, `THREAD_REF` lógico, `RECTOR_REF`, `REPORTS_TO` y `EXECUTION_ENVIRONMENT`. Se puede usar el starter sin generar un archivo público.
2. Si el entorno dispone de **un archivo de notas privado y ya existente para esa sesión**, registrar allí el mismo conjunto mínimo como identidad local; ejemplo de contenido, **no archivo nuevo exigido**:

```json
{
  "schema": "asteroides/thread-identity-local/v1",
  "role_id": "KOI2-MAIN",
  "thread_ref": "KOI2-MAIN-01",
  "rector_ref": "jonyspiral/koi2#143",
  "reports_to": "OWNER",
  "execution_environment": "ChatGPT",
  "native_binding": "not_published"
}
```

3. Si **no existe** un archivo privado accesible (incluido ChatGPT sin filesystem expuesto), el contexto del chat y su starter son suficientes. No inventar un directorio obligatorio, un ID de sesión, una API ni un mecanismo de sincronización. No guardar IDs/URLs privados en GitHub, `AGENTS.md`, `.harness/current-task.md`, Issues o PR.
4. Al reemplazar conversación/modelo, conservar el rol si la función no cambia, asignar un alias lógico nuevo si es otro hilo y volver a resolver sólo el `TASK_REF` de WU activa. No duplicar instrucciones ni revalidar identidad en cada trabajo.

El registro público describe roles y alias **sin autenticar ni vincular sesiones**; el propio hilo conserva el contexto interno cuando el entorno lo permite. `pending_confirmation` significa que falta esa vinculación nativa, no que el rol funcional sea desconocido.

## Al comenzar una tarea (sin pasos adicionales)

1. MAIN ya conoce su rol, identifica el objetivo y, si existe, la WU actual. No consulta de nuevo el registry si el hilo ya fue identificado.
2. MAIN asigna la tarea al ING correspondiente mediante **la capacidad nativa de Work cuando esté disponible**. La asignación incluye objetivo, frontera y rector/WU útil. No hace falta crear otra WU por cada agente o mensaje.
3. ING continúa en Work, colabora con otros ING por **chat nativo** y respeta el mismo control existente de scope, WU, writer, claim y autorización. Los mensajes entre agentes no constituyen una autorización ni cambian el dueño del trabajo.
4. MAIN revisa el resultado y resuelve el GOAL o bloqueo verdadero. **GitHub** conserva código, Issues, WUs, PRs, autorizaciones, decisiones y evidencias que deban sobrevivir a un chat.
5. Si el Work no está activo o no existe delegación nativa disponible, **no fingir un handoff**. Registrar el objetivo en el lugar existente o informar el bloqueo; un comentario GitHub no despierta por sí solo una conversación.

## No confundir los dos planos de comunicación

- **Operativo:** chats entre MAIN–ING e ING–ING en ChatGPT/Work, aprovechando la colaboración nativa que el OWNER ya utiliza.
- **Durable:** GitHub como fuente de verdad para decisiones, autorizaciones, código y receipts. El canal durable no exige copiar allí cada intercambio informal.
- **Seguridad:** la autoridad OWNER y los gates de Project Control/Harness siguen siendo los mismos; ni la identidad ni un mensaje de Work autorizan deploy, DML o infraestructura.
- **Costo:** `AGENTS.md` se mantiene lazy; no añadir lecturas, reportes de cabecera, verificaciones de roles o nuevas herramientas por tarea.

## Configuración de un nuevo hilo

Si no tiene identidad, seleccionar una vez un starter de [THREAD_STARTER.md](THREAD_STARTER.md) y confirmar la relación con el MAIN. Los aliases `pending_confirmation` sólo se confirman con evidencia de la propia conversación; no publicar enlaces privados en este repositorio público. Si se reemplaza el modelo o se abre un hilo nuevo, mantener el `ROLE_ID` si la función continúa y renovar el alias cuando corresponda.

## Rectores y documentación existente

Los nuevos rectores llevan `ASTEROIDES:MAIN-ING:v1` de la [plantilla](../../.github/ISSUE_TEMPLATE/rector.md); los creados por API/MCP incluyen el bloque explícitamente. La referencia a GitHub en esa plantilla significa **evidencia durable**, no exclusividad de comunicación ni prohibición del chat nativo.

No modificar retroactivamente las WUs cerradas, no introducir herramientas externas ni cambiar el alcance de otro proyecto por esta decisión.
