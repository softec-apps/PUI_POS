# Cronograma de desarolo del sistema POS

[![Screenshot-2025-05-20-11-37-11-1366x768.png](https://i.postimg.cc/8PqHhxW1/Screenshot-2025-05-20-11-37-11-1366x768.png)](https://postimg.cc/TpJgx7CS)

<!--
```mermaid
gantt
    title Cronograma Detallado de Desarrollo del Sistema POS
    dateFormat  YYYY-MM-DD
    axisFormat %U (Semana %U)

    section Análisis
    Boceto del Sistema          :a1, 2023-01-01, 1w
    Documentación Técnica       :a2, after a1, 2w

    section Desarrollo - Módulos Principales
    Autenticación JWT          :b1, after a2, 1w
    CRUD Productos             :b2, after b1, 3w
    Flujo de Ventas            :crit, b3, after b2, 5w
    Documentos Preventa        :b4, after b3, 3w
    Pruebas Módulos            :b5, after b4, 1w

    section Componentes Adicionales
    Gestión Kardex             :c1, after b5, 2w
    Integración SRI            :crit, c2, after c1, 2w
    Sistema de Reportes        :c3, after c2, 3w

    section Pruebas Finales
    Pruebas Integración        :d1, after c3, 2w
    Pruebas Carga              :d2, after d1, 1w
    Ajustes Finales            :d3, after d2, 1w
```
-->

## 1. Leyenda:

- **:crit**: Tareas críticas (camino crítico)
- **:milestone**: Hito importante
- **semanas**: Se muestran como %U (número de semana)

## 2. Fases detalladas:

### `Análisis (Semanas 1-2)`

- **1 semanas**: Boceto del sistema (db - funcionalidades)
- **2 semanas**: Documentación técnica (digramas, requerimientos, cronograma)

### `Desarrollo - Módulos Principales (Semanas 3-15)`

- **Semanas 3**: Autenticación JWT + (tablas usuarios/roles)
- **Semanas 4-6**: CRUD Productos con atributos/variaciones
- **Semanas 7-11**: Flujo completo de ventas (con clientes/detalle)
- **Semanas 12-14**: Documentos preventa (cotizaciones → ventas)
- **Semanas 15**: Pruebas (unitarias, integración, carga/rendimientocarga/rendimiento)

### `Componentes Adicionales (Semanas 15-21)`

- **Semanas 15-16**: Kardex (movimientos de inventario)
- **Semanas 17-18**: Integración SRI (comprobantes electrónicos)
- **Semanas 19-21**: Reportes (ventas, inventario)
