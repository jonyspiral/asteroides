# ADR-0001 — Colaboración MAIN / ING en rectores Asteroides

- **Estado:** APROBADA por OWNER, 2026-10-26.
- **Alcance:** gobierno multiagente de los proyectos y subproductos del ecosistema Asteroides.
- **Rector global:** [Asteroides MVP #1](https://github.com/jonyspiral/asteroides/issues/1).
- **Implementación transversal:** plantillas instalables de Asteroides Harness, sin exigir MCP.
- **Autoridad:** esta ADR es una decisión de coordinación, **no** autorización de cambios, merges, infraestructura ni producción.

## Decisión

**MAIN conserva responsabilidad del objetivo de punta a punta.** Diseña el plan mínimo, delega cuando aporta valor, revisa evidencias y devuelve al OWNER únicamente decisiones reales. No exige al OWNER trasladar mensajes entre agentes.

**ING es responsable de la ejecución técnica delegada** dentro del alcance aprobado. Puede utilizar subagentes nativos (por ejemplo Codex/Claude) para análisis, pruebas o cambios acotados cuando estén disponibles. No se crea un ingeniero nuevo ni una Work Unit nueva por cada microtarea o rol.

**GitHub es el canal durable de comunicación entre MAIN, ING y arquitectos transversales:** rector, comentarios, WUs, PR, revisiones, receipts y decisiones. Los agentes deben consultar ese canal al abrir o reanudar trabajo. Los comentarios no significan entrega instantánea ni ejecución en segundo plano.

## Cómo se aplica

1. **Al crear un rector**, agregar en su body el bloque breve `ASTEROIDES:MAIN-ING:v1` de la plantilla `.github/ISSUE_TEMPLATE/rector.md`, con MAIN responsable, ING inicial si está identificado, canal GitHub y reglas de delegación. Si ING está pendiente, declararlo como no asignado; no inventar identidad.
2. **Al iniciar cualquier agente**, leer `AGENTS.md` del repositorio, Harness si existe, rector y TaskRef activos; verificar la política. Las plantillas de Issues se aplican en la interfaz GitHub, **no** automáticamente a creaciones por API/MCP; quien use la API debe incorporar el bloque de forma explícita.
3. **En rectores existentes**, registrar la adopción una sola vez mediante comentario enlazado a esta ADR; no reescribir el body ni abrir rama/PR permanente del rector.
4. **Para tareas ejecutables**, conservar Work Unit, scope, claim y autorización exacta. Si subagentes colaboran dentro de la misma WU, sólo el holder válido escribe; si sus efectos requieren escritores realmente concurrentes y disjuntos, usar WUs/ramas con paths no solapados. Un handoff de escritor libera el lease anterior y reclama de nuevo.
5. **Delegación no hereda permisos:** un subagente no puede aumentar categoría de efecto, target, presupuesto, credenciales o autorización. El resultado lo revisa MAIN/ING responsable, con evidencia durable en la WU.

## Bloque mínimo requerido por nuevo rector

```markdown
<!-- ASTEROIDES:MAIN-ING:v1 -->
## Colaboración MAIN / ING
- MAIN: responsable del objetivo y aceptación de punta a punta; coordina a los ING.
- ING: ejecuta en WU acotadas; puede delegar nativamente análisis y trabajo independiente.
- Comunicación: GitHub (rector, WU, PR, comentarios y evidencias), sin OWNER intermediario.
- Gobierno: rector sin lease ni PR permanente; WU/claims y autorizaciones no se heredan por delegación.
- Contrato: https://github.com/jonyspiral/asteroides/blob/main/MASTER_PLAN/04_DECISIONS/ADR-0001-main-ing-colaboracion.md
<!-- /ASTEROIDES:MAIN-ING:v1 -->
```

## Criterio de simplicidad

Un rector puede comenzar con un solo agente MAIN/ING. No se obliga a dividir trabajo ni a incorporar un servicio coordinador, automatización nueva o un segundo control plane. Delegar sólo cuando disminuye tiempo total, reduce riesgo o permite paralelismo real.

**Canal de recepción:** un mensaje en GitHub queda disponible para los agentes que vuelvan a leer el rector; no se presupone que Claude, Codex u otro proceso esté conectado continuamente ni que reciba notificaciones en tiempo real.

## Límites de esta decisión

- No modifica el contrato de Project Control ni su runtime; PC ING conserva el diseño técnico de PC.
- No concede privilegios ni sustituye la aprobación OWNER de mutaciones.
- No impone a todos los repositorios una adopción automática antes de actualizar su Harness; el rollout de plantillas es gradual y verificable.
