# Asteroides Pricing Engine — ficha de producto

**Estado comercial:** producto incorporado al portafolio; oferta piloto con implementación asistida.  
**Estado técnico:** P0 definición; P1 simulador pendiente de validación. No existe aún una app general publicada.  
**Rector:** [asteroides#11](https://github.com/jonyspiral/asteroides/issues/11) (hijo del [rector global #1](https://github.com/jonyspiral/asteroides/issues/1)).  
**Primer piloto:** DORSO (datos privados fuera del repositorio público).

## ¿Qué ofrecemos?
Un sistema de análisis y simulación de precios para empresas que venden por web, mayoristas y promociones, contemplando costos, comisiones comerciales, descuentos, publicidad y el margen de quienes revenden.

No es un generador de listas con un markup fijo: produce **escenarios trazables**, identifica riesgos entre canales y propone precios sujetos a revisión humana.

## Paquetes comerciales
| Modalidad | Entregable |
|---|---|
| **Pricing Audit** | Diagnóstico de márgenes actuales, estructura por canal, costos faltantes y alertas |
| **Pricing Architecture** | Políticas y simulador: web, mayorista, promociones, CPA, ROAS, bundles y pisos de rentabilidad |
| **Pricing Performance** | Revisión recurrente de costos, conversiones y rentabilidad; ajustes sugeridos, no publicados automáticamente |

**Cotización:** por relevamiento y alcance. No inferir tarifa a partir del presupuesto de pauta del cliente. Los honorarios por una consultoría específica y los de la futura aplicación son ofertas distintas.

## Entradas mínimas
1. Catálogo con ID/SKU/variantes, costos reales y fechas de actualización.
2. Precios web y mayoristas vigentes; moneda, impuestos y definición bruto/neto.
3. Gastos variables por canal: pasarelas, cuotas, envíos subsidiados, devoluciones, descuentos, logística, cobranza.
4. **Comisión de vendedor mayorista (default inicial 10%, parametrizable por cliente y canal)**.
5. Márgenes mínimos y objetivos de DORSO y del revendedor, bandas de promociones, presupuesto de adquisición y órdenes promedio.

Si falta un costo esencial, se muestra `UNKNOWN/BLOCKED`; nunca se presenta una recomendación como rentable por defecto.

## Cálculos y decisiones
- Precios web sugeridos y piso promocional con margen de contribución verificable.
- Precio mayorista sugerido por volumen; comisión del vendedor separada del margen DORSO.
- PVP **sugerido**, margen potencial del revendedor y advertencias ante descuentos web que deterioren la viabilidad comercial de un tercero.
- Escenarios conservador, base y agresivo con parámetros explícitos; bundles/combos.
- Contribución antes y después de Ads, CPA máximo económico, CPA objetivo y ROAS de equilibrio.
- Distinción entre **margen sobre precio de venta** y **markup sobre costo**.
- Rastro de la fuente de cada dato, fórmula/parámetro aplicado, fecha de cálculo y estado de aprobación.

**Economía base por canal:** `contribución_antes_ads = ingreso_cobrado - costo_producto - comisiones - costos_variables - descuentos_no_reflejados_en_ingreso - otros_costos_del_pedido`. El CPA de equilibrio no puede superar la contribución antes de Ads; el CPA objetivo debe reservar rentabilidad. Se calculan impuestos según la condición fiscal y naturaleza del costo, evitando doble contabilización. El ROAS de equilibrio es dependiente del ticket y contribución por orden (no un múltiplo universal).

## Piloto DORSO (v0 Google Sheets)
Preservar las hojas actuales de productos y variantes; crear un espacio de simulación separado:

- **08 Estrategia de precios**: producto/grupo, costo, precio web, promo mínima, mayorista con comisión, PVP sugerido, margen revendedor, CAC/ROAS y alertas.
- **09 Parámetros Pricing**: comisión, costos web, márgenes, promoción máxima, costos variables, redondeo comercial, rango y vigencia.

DORSO es **fixture de validación**, nunca reglas hardcodeadas: otros clientes deben poder cambiar parámetros, monedas y sistemas fuente sin reescribir fórmulas.

**Sin cambios automáticos de precios en Tiendanube o listas mayoristas.** Cada propuesta pasa por `PROPOSED -> REVIEWED -> APPROVED` antes de una exportación o publicación eventual, que requerirá autorización específica.

## Fronteras arquitectónicas
- **Asteroides Pricing Engine** posee el cálculo/escenario de rentabilidad; **Commerce Ops/KOI** puede consumir listas aprobadas.
- **Asteroides Growth** consume límites/condiciones comerciales aprobadas; no es source of truth de costos ni del cálculo.
- **Brand Brain** conserva reglas comerciales aprobadas de marca; el motor no eleva una recomendación a política de marca automáticamente.
- Datos y secretos por tenant; costos internos nunca en este repositorio público.
- No crear repo propio, DB, MCP, API o microservicio hasta que un segundo caso valide un ciclo de vida separado.

## Criterios de aceptación v0
- Fórmulas equivalentes a cálculo manual para tres familias con márgenes distintos.
- 10% mayorista aplicado sobre la base definida, configurable; contribución post-comisión correcta.
- Descuentos y costos variables aplicados sin doble cómputo.
- Costo no informado bloquea recomendación final.
- Comparación minorista/mayorista y rentabilidad del revendedor visibles.
- Cero cambios en Tiendanube, cuentas publicitarias o listas comerciales reales.
- Documentación de inputs, tests, excepciones, versiones y aprobaciones.

## Evolución
**P0:** alta comercial y contrato.  
**P1:** simulador DORSO en Sheets con QA económico.  
**P2:** segundo tenant, contratos import/export y pruebas de portabilidad.  
**P3 (opcional):** app o API independiente sólo si evidencia de demanda y necesidades técnicas lo justifican.
