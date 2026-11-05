# Identidad y coordinación MAIN / ING — protocolo operativo v1.1

- **Base:** decisión OWNER de 26/10/2026, [ADR-0001](../04_DECISIONS/ADR-0001-main-ing-colaboracion.md).
- **Aclaración aprobada:** 05/11/2026: los MAIN coordinan desde ChatGPT; los ING trabajan y pueden colaborar entre sí mediante el **chat nativo de Work**, como ya ocurre en PC Codex, Executor, Growth y KOI2.
- **Registro:** [AGENT_REGISTRY.yml](AGENT_REGISTRY.yml). No es una lista de IDs autenticados.

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
