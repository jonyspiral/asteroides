---
name: "Rector — MAIN / ING"
about: "Programa/área que coordina Work Units sin rama ni PR permanente"
title: "[RECTOR] "
---

## Objetivo y criterio de GOAL
Describir resultado de negocio o técnico verificable. No confundir rector con una tarea ejecutora.

## Responsable MAIN y contexto
- MAIN responsable: **por definir**
- Organización / proyecto consumidor:
- Rector padre / dependencias:
- Ingeniero ING inicial: **por definir** (no inventar agente ni identidad)

<!-- ASTEROIDES:MAIN-ING:v1 -->
## Colaboración MAIN / ING
- MAIN: responsable del objetivo y aceptación de punta a punta; coordina a los ING.
- ING: ejecuta en WU acotadas; puede delegar nativamente análisis y trabajo independiente.
- Comunicación: GitHub (rector, WU, PR, comentarios y evidencias), sin OWNER intermediario.
- Gobierno: rector sin lease ni PR permanente; WU/claims y autorizaciones no se heredan por delegación.
- Contrato: https://github.com/jonyspiral/asteroides/blob/main/MASTER_PLAN/04_DECISIONS/ADR-0001-main-ing-colaboracion.md
<!-- /ASTEROIDES:MAIN-ING:v1 -->

## Alcance, exclusiones y plan mínimo
- Alcance:
- Exclusiones:
- Primeras WUs: sólo resultados independientes con scope/paths propios.

## Identidad de rector
Al crear el Issue y conocer su número, completar en el body el contrato `ASTEROIDES:WORK-UNIT:v1` con `kind: rector`, TaskRef real y sin paths/claims del rector. Los ejecutores usarán sus propias WUs y autorización. En creaciones por API/MCP incluir explícitamente el bloque MAIN/ING: GitHub no copia plantillas a la API.
