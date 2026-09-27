# Asteroides Growth / Ads Ops — Diseño rector

Estado: **propuesto para aprobación arquitectónica**  
Rector global: `jonyspiral/asteroides#7`  
Repositorio objetivo: `jonyspiral/asteroides-growth`  
Pilotos iniciales: Spiral Shoes + Cumbres & Mareas  
Proveedor inicial: Meta Marketing API

## 1. Decisión

Crear **Asteroides Growth** como producto y runtime independiente del ecosistema Asteroides para observabilidad, planificación y ejecución gobernada de publicidad paga.

No pertenece a Spiral, Cumbres & Mareas ni Asteroides Social Publishing. Es un servicio hermano que expone capacidades reutilizables a múltiples proyectos.

La primera vertical será Meta Ads. El diseño debe permitir incorporar luego DORSO y clientes externos sin reescribir el core.

## 2. Relación con Asteroides Social Publishing

Los dos productos pueden reutilizar assets y conceptos comunes, pero tienen fronteras distintas:

- **Asteroides Social Publishing:** distribución orgánica (Instagram Story, Reel, Feed, etc.).
- **Asteroides Growth:** publicidad paga (ad accounts, campaigns, ad sets, ads, creatives, budgets, audiences, pixels/CAPI, análisis y control).

No se permite que Social Publishing modifique campañas pagas ni que Growth publique contenido orgánico por analogía.

Si aparece duplicación estable en manejo de Graph API, rate limiting, errores, redacción, identidad o auditoría, podrá extraerse más adelante una librería común. No se crea otro servicio anticipadamente.

## 3. Runtime y repositorio

Repositorio canónico:

```text
jonyspiral/asteroides-growth
```

Checkout de desarrollo:

```text
C:\dev\asteroides-growth
```

Runtime canónico objetivo:

```text
/opt/asteroides-growth
```

Servicio hermano:

```text
/opt/asteroides-social-publishing
```

El MVP será **CLI-first**. No se introduce todavía daemon, API HTTP, scheduler propio ni panel web. Esas superficies se agregan sólo cuando el caso de uso lo requiera.

## 4. Fuentes de extracción inicial

La implementación no parte de cero. Se extraerán y reconciliarán capacidades probadas en proyectos consumidores.

### Spiral Shoes

Fuentes principales:

- PR #8: `campaign-review`, diagnóstico Andromeda read-only y cruce con promociones/stock.
- PR #15: runbook agnóstico, integración Meta Ads y `create-video-ad.ts`.
- `scripts/meta-ads/**`: cliente Meta, listados, snapshots, weekly reports, análisis, audiencias y CAPI.
- `plans/meta-ads-v1.md`: aprendizajes operativos y relación con PrestaShop/Mercado Libre.

PR #15 no se copia literalmente. Su secuencia de escritura requiere hardening antes de convertirse en core: journal reanudable, idempotencia y protección ante mutaciones de ads activos.

### Cumbres & Mareas

Fuentes principales:

- `scripts/meta-ads/**`: setup, list, uploads, create-ad, carousel, scaffold, snapshot, weekly-report y análisis Andromeda.
- generación de copies y ángulos por propiedad;
- ManyChat/audiencias;
- eventos de contexto y estacionalidad;
- Click-to-WhatsApp como vertical de leads.

La lógica propia de propiedades, disponibilidad, temporada y tono permanece en Cumbres; Growth consume esa información mediante contratos.

## 5. Arquitectura

```text
ChatGPT / Codex / Claude / Asteroides Console
                    |
                    v
        Skills: review / plan / execute
                    |
                    v
          Project Control + Harness
       autorización, scope, evidencia
                    |
                    v
             Asteroides Growth
  +---------------------------------------+
  | Core de planes, políticas e intentos |
  | Provider Meta Marketing API          |
  | Andromeda / reporting / alertas      |
  | Operation journal / idempotencia     |
  | Audit / read-after-write             |
  +---------------------------------------+
          |                         |
          v                         v
 Meta Marketing API       Adaptadores de negocio
                          PrestaShop / Tiendanube
                          Mercado Libre / ManyChat
                          Cumbres / KOI / futuros
```

### Componentes propuestos

```text
asteroides-growth/
├── packages/
│   ├── core/
│   ├── provider-meta/
│   ├── analysis-andromeda/
│   ├── adapter-prestashop/
│   ├── adapter-tiendanube/
│   ├── adapter-mercadolibre/
│   ├── adapter-manychat/
│   └── adapter-cym/
├── projects/
├── strategies/
├── skills/
│   ├── ads-review/
│   ├── ads-plan/
│   └── ads-execute/
├── cli/
├── schemas/
├── tests/
├── docs/
└── .harness/
```

No todos los adaptadores deben implementarse en la primera fase. Esta estructura define fronteras, no obliga a crear código sin necesidad.

## 6. Modelo multi-proyecto

El core nunca contiene IDs, tokens ni reglas comerciales específicas de una marca.

Cada proyecto tiene un binding declarativo:

```yaml
project: spiral
provider:
  type: meta
  api_version: configurable
identity:
  ad_account: credential://meta.spiral.ad_account
  page: credential://meta.spiral.page
  pixel: credential://meta.spiral.pixel
business:
  vertical: commerce
  currency: ARS
  timezone: America/Argentina/Buenos_Aires
adapters:
  catalog: prestashop
  stock: prestashop
  promotions: prestashop
  marketplace_attribution: mercadolibre
policies:
  create_status: PAUSED
  allow_active_mutation: false
  require_stock_check: true
  require_promotion_check: true
  require_utm: true
```

Cumbres usa otro perfil:

```yaml
project: cumbres
business:
  vertical: hospitality
adapters:
  offers: cym_properties
  availability: cym_calendar
  leads: whatsapp_manychat
  seasonality: cym_events
policies:
  create_status: PAUSED
  require_availability_check: true
  require_product_scope: true
  allow_active_mutation: false
```

El modelo debe soportar una jerarquía superior a `project`:

```text
tenant -> brand -> offer -> campaign
```

Ejemplos:

```text
cumbres-y-mareas -> cumbres-y-mareas -> casa-nevada -> el-cruce-diciembre
spiral            -> spiral-shoes      -> pow-skateb-impact -> lanzamiento-impact
```

## 7. Skills

Las skills son capas delgadas. No contienen llamadas directas a Meta ni IDs de cuentas.

### ads-review

Solo lectura:

- inventario;
- métricas;
- snapshots;
- Andromeda;
- comparación temporal;
- alertas;
- contexto comercial;
- recomendaciones explicadas.

### ads-plan

No productivo:

- crea un `AdsPlan`;
- valida creativo, copy, destino, UTM, presupuesto, fechas, oferta y contexto de negocio;
- produce preview/diff;
- genera fingerprint de intención.

No hace POST a Meta.

### ads-execute

Escritura gobernada:

- consume un plan ya preparado;
- exige autorización exacta;
- revalida identidad y estado;
- ejecuta pasos allowlisted;
- verifica por lectura;
- registra evidencia terminal.

No toma decisiones estratégicas durante la ejecución.

## 8. Riesgo y autorización

| Nivel | Operación | Política |
|---|---|---|
| R0 | leer campañas/configuración | libre/read-only |
| R1 | reportes, análisis, planes | libre/no productivo |
| R2 | subir asset, crear creative o ad PAUSED | autorización explícita exacta |
| R3 | editar recurso PAUSED | autorización explícita específica |
| R4 | activar/pausar, presupuesto, fechas, targeting de recursos activos | autorización específica + expected state |
| R5 | audiencias, CAPI o datos de clientes | autorización específica + contrato de datos |

Una autorización debe fijar como mínimo:

- proyecto/cuenta;
- entidad;
- estado anterior esperado;
- efecto deseado;
- asset/copy/link;
- presupuesto/fechas si aplican;
- fingerprint;
- ventana de validez.

No existe autorización permanente por proyecto.

## 9. Mutaciones seguras

### Creación

Todo recurso nuevo que pueda alterar delivery se crea en estado `PAUSED`.

### Cambio de creativo

El MVP no hace `replace-ad` directo sobre un anuncio activo.

Flujo canónico:

```text
ad existente
  -> snapshot
  -> creative nuevo
  -> ad nuevo PAUSED
  -> revisión
  -> autorización separada
  -> activar nuevo + pausar anterior
  -> GET verification
```

Una mutación directa futura exigirá expected status/creative, autorización específica y rollback documentado.

## 10. Journal e idempotencia

Las operaciones multi-step deben poder reanudarse sin repetir POST no idempotentes.

MVP:

- SQLite local del runtime;
- `operation_id`;
- fingerprint;
- steps persistidos;
- resource IDs devueltos por Meta;
- estado terminal;
- lock/reserva atómica por intención;
- read-after-write;
- resultado ambiguo fail-closed.

Ejemplo:

```json
{
  "operation_id": "spiral-impact-video-v3",
  "fingerprint": "...",
  "steps": {
    "video_upload": {"status": "completed", "resource_id": "..."},
    "thumbnail_upload": {"status": "completed", "resource_id": "..."},
    "creative_create": {"status": "pending"}
  }
}
```

La evidencia durable de gobierno queda además en GitHub / Project Control.

## 11. Validaciones de negocio

Las comprobaciones no pueden depender sólo de warnings del agente.

Resultados:

- `GREEN`: ejecutable;
- `WARN`: requiere confirmación adicional;
- `BLOCK`: ejecución prohibida.

Ejemplos Spiral:

- producto agotado -> BLOCK;
- URL sin UTM requerida -> BLOCK;
- promo mencionada pero vencida -> BLOCK;
- stock bajo -> WARN.

Ejemplos Cumbres:

- propiedad/copy incompatibles -> BLOCK;
- fecha sin disponibilidad -> BLOCK;
- visual de otra propiedad -> BLOCK;
- destino no verificable -> BLOCK;
- estacionalidad no confirmada -> WARN.

## 12. Estrategia de migración

Los scripts actuales de Spiral y Cumbres permanecen operativos hasta que Growth alcance paridad.

No se elimina código consumidor durante la extracción.

Secuencia:

1. inventariar y elegir implementación canónica por capacidad;
2. extraer read-only;
3. validar paridad en ambos pilotos;
4. agregar plan/preview;
5. agregar una escritura gobernada;
6. introducir wrappers consumidores si hace falta;
7. deprecar duplicación sólo después de evidencia de paridad.

## 13. Fases hacia GOAL

### Fase 0 — Bootstrap y gobierno

Objetivo:

- crear `jonyspiral/asteroides-growth`;
- rector local `#1`, subordinado a `jonyspiral/asteroides#7`;
- Harness actualizado;
- Project Control L1;
- inventario canónico Spiral/Cumbres;
- contratos iniciales;
- cero escritura externa.

GOAL:

- repo creado;
- rector local y fases registradas;
- arquitectura y sources documentados;
- tests/bootstrap verdes;
- ningún secreto ni POST a Meta.

### Fase 1 — Read-only multi-proyecto

Entregar:

```bash
growth projects validate
growth campaigns inventory --project spiral
growth campaigns inventory --project cumbres
growth campaigns review --project spiral --campaign <id>
growth campaigns review --project cumbres --campaign <id>
```

Incluye:

- Meta client multi-cuenta inyectable;
- identidad;
- paginación;
- rate limiting;
- snapshots;
- weekly reports;
- análisis Andromeda;
- project bindings.

GOAL: Spiral y Cumbres producen lectura equivalente o mejor que sus toolings actuales desde el mismo core.

### Fase 2 — AdsPlan / preview

Entregar:

```bash
growth plan create --project <p> --strategy <s>
growth plan validate <plan-id>
growth plan preview <plan-id>
```

Incluye:

- schema `AdsPlan`;
- validators;
- checks de contexto empresarial;
- diff;
- fingerprint;
- cero POST.

GOAL: una campaña/anuncio completo puede quedar preparado y validado sin escribir en Meta.

### Fase 3 — Creación controlada

Primera operación productiva:

- upload de imagen/video;
- creative;
- ad nuevo **PAUSED**;
- journal reanudable;
- idempotencia;
- expected identity;
- read-after-write;
- evidencia terminal.

GOAL: una pieza real autorizada puede materializarse exactamente una vez y quedar PAUSED.

### Fase 4 — Control y edición

Agregar:

- pause/activate;
- budget;
- fechas;
- nombres;
- cambios seguros sobre recursos pausados;
- clone-and-stage de creativos;
- rollback.

GOAL: control operativo completo de campañas bajo autorización específica, sin optimización autónoma.

### Fase 5 — Audiencias, catálogo y CAPI

Agregar según demanda:

- custom audiences;
- lookalikes;
- CAPI;
- catálogo;
- adapters PrestaShop/Tiendanube;
- hashing/minimización;
- políticas R5.

GOAL: datos y señales first-party gobernados, sin secretos ni PII durable en repositorio.

### Fase 6 — Console y automatización read-only

Agregar sólo si la operación lo justifica:

- panel Growth;
- salud multi-proyecto;
- alertas;
- decisiones;
- planes pendientes;
- scheduler de reportes read-only;
- aprobaciones visibles.

Las mutaciones continúan requiriendo aprobación.

## 14. GOAL del producto inicial

Se considera logrado el MVP cuando:

1. Spiral y Cumbres usan el mismo core read-only.
2. Un `AdsPlan` es portable entre agentes.
3. Existe una única ruta gobernada para crear un anuncio PAUSED.
4. Journal/idempotencia impiden duplicados por reintentos.
5. Stock/promos/disponibilidad pueden bloquear ejecuciones mediante adapters.
6. Toda mutación queda vinculada a autorización y evidencia.
7. Social Publishing y Growth conservan fronteras separadas.
8. El runtime está desplegado como `/opt/asteroides-growth`.
9. DORSO puede onboardearse mediante configuración/adapters sin modificar el core.

## 15. No objetivos del MVP

- optimización presupuestaria autónoma;
- auto-activación de campañas por recomendación del agente;
- reemplazo directo de creativos en ads activos;
- plataforma multi-provider desde el día 1;
- UI web obligatoria;
- ML predictivo propio;
- MCP nuevo si CLI + Project Control + Executor cubren la necesidad;
- almacenamiento de tokens en Git.

## 16. Decisiones pendientes para fases posteriores

No bloquean Fase 0:

- cuándo promover CLI a servicio persistente;
- cuándo extraer una librería Meta común con Social Publishing;
- proveedor de secretos definitivo;
- alcance de Asteroides Console;
- incorporación de otros providers publicitarios.
