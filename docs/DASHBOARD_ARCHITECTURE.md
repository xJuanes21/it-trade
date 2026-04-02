# 📊 Arquitectura de Dashboards: Operativo vs. Financiero

Este documento detalla la separación de responsabilidades entre el Dashboard Principal (Operativo) y el Resumen Financiero, especificando qué componentes utiliza cada uno y cómo se mapean los datos desde la API de Trade Copier.

---

## 🚀 1. Dashboard Principal (Operativo)
**Ruta:** `/dashboard`  
**Propósito:** Visión en tiempo real del estado de las cuentas y operativa actual. Es la pantalla de monitoreo rápido.

### 🧩 Componentes y Mapeo de Datos
| Componente | Datos API (Mapeo `toOperational`) | Descripción |
| :--- | :--- | :--- |
| **DashboardHeader** | `report.last_sync`, `report.state` | Saludo al usuario, estado de conexión y última sincronización. |
| **PnLSummary** | `report.roi`, `report.profit` | Tarjeta principal con el % de ganancia y beneficio neto acumulado. |
| **TradeCountChart** | `report.trade_count_history` | Gráfico de área que muestra el volumen de operaciones en el tiempo. |
| **ProfitChart** | `report.daily_profit_history` | Gráfico de barras con el beneficio diario (verde/rojo). |
| **SymbolsTraded** | `report.top_symbols` | Gráfico de barras horizontal con los activos más operados (e.g., EURUSD, Gold). |
| **MarketTable** | API: `/position/open` | Tabla de posiciones abiertas actualmente en el mercado. |
| **RankingTable** | `reporting[]` | Tabla comparativa de rendimiento entre todas las cuentas vinculadas. |

---

## 📈 2. Resumen Financiero (Análisis)
**Ruta:** `/dashboard/overview`  
**Propósito:** Análisis profundo del rendimiento histórico, métricas de riesgo y estadísticas técnicas.

### 🧩 Componentes y Mapeo de Datos
| Componente | Datos API (Mapeo `toFinancial`) | Descripción |
| :--- | :--- | :--- |
| **WinstreakCard** | `report.current_streak`, `report.best_streak` | Racha actual y mejor racha de días ganadores vs. perdedores. |
| **MetricCards** | `report.daily_profit`, `report.avg_win` | Tarjetas con métricas de beneficio promedio y winrate. |
| **WinrateGauges** | `report.daily_winrate`, `report.win_rate` | Medidores circulares de efectividad diaria y total. |
| **TechnicalAudit** | `report.performance`, `report.hwm`, `report.equity_start` | Auditoría técnica: HWM (High Water Mark), Equity inicial y actual. |
| **TradingCalendar** | `report.calendar` | Calendario interactivo con el PnL diario y resúmenes semanales/mensuales. |
| **EquityCurve** | `report.equity_history` | Gráfico de línea con el crecimiento del capital en el tiempo. |
| **PnLDistribution**| `report.pnl_history` | Histograma de distribución de ganancias y pérdidas. |
| **HistoryTable** | API: `/position/closed` | Tabla detallada con el historial de todas las posiciones ya cerradas. |
| **CapitalFlows** | `report.deposits`, `report.withdrawals`, `report.commissions` | Resumen de ingresos, retiros y costos de swap/comisiones. |

---

## 🛠️ Reglas de Diseño y Separación
1.  **Cero Widget Sharing (Ideal):** Para evitar confusión, los widgets de `/dashboard` son de "vistas rápidas" (mini charts), mientras que en `/overview` son detallados y analíticos.
2.  **Diferentes Adaptadores:**
    *   `/dashboard` usa `tradeCopierAdapter.toOperational()` centrado en actividad.
    *   `/overview` usa `tradeCopierAdapter.toFinancial()` centrado en métricas y riesgo.
3.  **Diferentes APIs:**
    *   El dashboard operativo NO necesita historial de posiciones cerradas, ahorrando ancho de banda.
    *   El resumen financiero hace un fetch pesado de `/position/closed` para su análisis.

---

> [!TIP]
> **Recomendación:** Actualmente `RankingTable` es el único componente visualmente compartido. Podría moverse exclusivamente al Dashboard Principal para mantener el Overview 100% puro de análisis individual de cuenta.
