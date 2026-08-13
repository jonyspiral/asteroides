# Arquitectura objetivo

## Flujo rector

```text
Objetivo humano
→ Asteroides Core resuelve contexto
→ Project Control gobierna rector / Work Unit / autorización / routing
→ Harness aplica contrato local
→ agente razona y desarrolla
→ Executor interno o MCP/adaptador externo materializa el efecto
→ runtime produce evidencia / receipt
→ Project Control reconcilia estado
→ decisiones durables relevantes pueden volver al Core
```

## Fronteras

- **Asteroides Core**: qué es cada elemento, relaciones, contexto y herencia.
- **Project Control MCP**: qué se está haciendo, con qué autoridad y cuál es el siguiente paso.
- **Asteroides Harness**: cómo debe trabajarse dentro de un proyecto.
- **Agente/modelo**: razonamiento y desarrollo; reemplazable, sin autoridad propia.
- **Asteroides Executor MCP**: efectos internos allowlisted.
- **MCP/adaptadores externos**: efectos sobre proveedores específicos.
- **GitHub**: historia durable de código y trabajo técnico.

El esquema visual aprobado vive en `runtime-objetivo.html`.
