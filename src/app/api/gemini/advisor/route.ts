import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context, history } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Financial context formatted for the system prompt
    const contextPrompt = `
Eres el Asesor Financiero Personal del usuario. Conoces a fondo su situación financiera y dominas las finanzas personales en ciclos bi-semanales estrictos (cada 14 días):
- Su ingreso proviene de ciclos de nómina bi-semanales exactos calculados a una tarifa base de $8,10/hora.
- Maneja tres cuentas clave:
  1. Binance Principal: Saldo actual $${context?.principalBalance ?? '75.28'} USDT (gastos del día a día, ocio y compromisos semanales).
  2. Subcuenta Hogar: Saldo actual $${context?.hogarBalance ?? '167.50'} USDT (fondos blindados para el 50% de alquiler acumulativo de $82,50, mercado, servicios y compromisos familiares).
  3. Simple Earn: Saldo actual $${context?.earnBalance ?? '308.93'} USDT (reserva de liquidez, ahorro con devengo de rendimiento y pote de contingencia).
- Gasto de alquiler mensual: $165, que reserva en mitades exactas e intocables de $82,50 en cada cobro quincenal.
- Deudas activas con calendario riguroso:
  * Cashea (Los 777): 3 cuotas de $38,43 los días 30 oct, 13 nov y finiquita el 27 nov.
  * Cricut: Cuota fija mensual de $39,80 los días 14 de cada mes (noviembre a febrero).
  * Suscripción IA: $20 mensual los días 13.
  * Teléfono nuevo: Inicial de $500 ($300 puente Simple Earn + $50 el 30 oct + $150 el 13 nov); luego $400 financiado en cuotas de $100 quincenales.
- Fijos esenciales quincenales: Mercado ($160), Alquiler 50% ($82,50), Servicios ($25), Gasolina Corsa ($15), Arena de gatos ($15), Depilación pareja ($15 desde el 13 nov).
- Quincena actual seleccionada:
  * Fecha de cobro: ${context?.activeCycleDate ?? '2026-10-30'}
  * Horas trabajadas: ${context?.hoursWorked ?? 56}h = $${context?.grossIncome ?? '453.60'} USDT bruto
  * Gastos Fijos quincenales: $${context?.fixedExpenses ?? '297.50'}
  * Cuotas de Deuda este ciclo: $${context?.debtInstallments ?? '38.43'}
  * Remanente Libre ("Bolsillo"): $${context?.freePocket ?? '117.67'} total ($${context?.weeklyPocket ?? '58.83'}/semana)
  * Nivel de seguridad: ${context?.safetyStatus ?? 'seguro'}
- Objetivos prioritarios innegociables:
  1. Preservar y robustecer el fondo de la playa para el viaje del 18 de diciembre (en Simple Earn).
  2. Mantener al día el Corsa (tren delantero y mantenimiento preventivo).
  3. No asfixiar el margen de bolsillo semanal por debajo del umbral de seguridad ($30 - $40/semana).

Instrucciones de respuesta:
1. Evaluar cada propuesta de nuevo gasto recurrente o deuda (ej. "¿Me puedo comprar X?", "¿Puedo asumir esta cuota de $Y?", "¿Qué pasa si compro la Epson L3250 a $59 quincenales?").
2. Generar el impacto proyectado en el flujo de caja quincenal y advertir con contundencia si el margen libre semanal cae por debajo de los $30-$40/semana.
3. Responder de forma directa, analítica y sin rodeos. Incluye siempre una comparativa clara "Antes vs. Después" (en números y porcentaje) y sugiere la fecha óptima para contraer el compromiso si hoy resulta inviable (por ejemplo, después de liquidar Cashea el 27 de noviembre o una vez cubierto el inicial del teléfono).
4. Usa formato Markdown limpio con viñetas y datos destacados.
`;

    // If GEMINI_API_KEY is not defined, return realistic simulated financial advice
    if (!apiKey) {
      const simulatedResponse = generateOfflineSimulatedAdvice(message, context);
      return NextResponse.json({
        reply: simulatedResponse,
        source: 'simulated_advisor',
        notice: 'Para activar la IA en vivo de Gemini, define tu GEMINI_API_KEY en .env.local',
      });
    }

    // Call Google Gemini REST API directly (supports gemini-2.0-flash / gemini-1.5-flash / gemini-1.5-pro)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: contextPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Entendido a la perfección. Conozco todas tus cuentas en Binance, tus deudas activas, tu fondo de la playa y el mantenimiento del Corsa. Evaluaré cada solicitud con rigor numérico.' }],
      },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: `Pregunta del usuario: ${message}` }],
      },
    ];

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedContents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini API call failed, falling back to simulated advisor:', errText);
      const simulatedResponse = generateOfflineSimulatedAdvice(message, context);
      return NextResponse.json({
        reply: simulatedResponse,
        source: 'fallback_simulated',
        warning: 'Gemini API devolvió error, se utilizó el motor financiero de respaldo.',
      });
    }

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No se pudo generar respuesta del asesor.';

    return NextResponse.json({ reply: replyText, source: 'gemini-live' });
  } catch (error: any) {
    console.error('Error in /api/gemini/advisor:', error);
    return NextResponse.json(
      {
        error: error.message || 'Error comunicándose con el asesor financiero Gemini.',
      },
      { status: 500 }
    );
  }
}

function generateOfflineSimulatedAdvice(message: string, ctx: any): string {
  const query = message.toLowerCase();
  const currentPocket = ctx?.freePocket ?? 117.67;
  const weeklyCurrent = ctx?.weeklyPocket ?? 58.83;

  if (query.includes('epson') || query.includes('59') || query.includes('impresora')) {
    const newPocket = Math.round((currentPocket - 59) * 100) / 100;
    const newWeekly = Math.round((newPocket / 2) * 100) / 100;
    const isDangerous = newWeekly < 30;

    return `### 🖨️ Análisis de Impacto: Impresora Epson L3250 ($59 quincenales)

**Veredicto del Asesor:** ⚠️ **${isDangerous ? 'NO RECOMENDADO EN ESTE CICLO' : 'PRECAUCIÓN EXTREMA'}**

#### Comparativa de Flujo de Caja (Quincena ${ctx?.activeCycleDate || '30 Oct'}):
| Concepto | Antes | Con Epson ($59) | Variación |
| :--- | :--- | :--- | :--- |
| **Ingreso Bruto** | $${ctx?.grossIncome || 453.60} | $${ctx?.grossIncome || 453.60} | $0.00 |
| **Fijos + Deudas** | $${((ctx?.fixedExpenses || 297.5) + (ctx?.debtInstallments || 38.43)).toFixed(2)} | $${((ctx?.fixedExpenses || 297.5) + (ctx?.debtInstallments || 38.43) + 59).toFixed(2)} | +$59.00 |
| **Bolsillo Libre Quincenal** | **$${currentPocket.toFixed(2)}** | **$${newPocket.toFixed(2)}** | -$59.00 (-50.1%) |
| **Margen Libre Semanal** | **$${weeklyCurrent.toFixed(2)}/sem** | **$${newWeekly.toFixed(2)}/sem** | 🔴 ${newWeekly < 30 ? 'Zona Crítica (< $30/sem)' : 'Alerta'} |

> [!WARNING]
> Tu margen semanal caería a **$${newWeekly.toFixed(2)}/semana**, vulnerando el piso de seguridad estipulado de $30-$40. Además, estás asumiendo la inicial del teléfono ($50 el 30 oct y $150 el 13 nov).

#### Recomendación Estratégica:
1. **Fecha Óptima de Compra:** Esperar al **27 de Noviembre** o **11 de Diciembre**.
2. **Motivo:** Para el 27 de noviembre habrás finiquitado las 3 cuotas de Cashea (-$38,43 liberados) y tu ciclo de nómina volverá a ser regular de 80h ($648,00), subiendo tu margen disponible a más de $75/semana.
3. No toques la reserva de **Simple Earn ($${ctx?.earnBalance || 308.93})**, ya que está comprometida para el viaje del 18 de diciembre y el colchón de emergencias del Corsa.`;
  }

  if (query.includes('playa') || query.includes('viaje') || query.includes('13 de noviembre') || query.includes('fondo')) {
    return `### 🏖️ Análisis de Aporte al Viaje de la Playa (Ciclo 13 de Noviembre)

**Veredicto del Asesor:** ✅ **APORTE VIABLE CON TOPE MODERADO**

#### Proyección para el 13 de Noviembre (80 Horas = $648,00):
- **Ingreso Bruto proyectado:** $648,00 USDT
- **Compromisos Fijos:** $312,50 (incluyendo Alquiler 50% $82,50, Mercado $160, Servicios $25, Gasolina $15, Gatos $15, Depilación $15).
- **Cuotas de Deuda activas este cobro:**
  - Cashea (Cuota 2/3): $38,43
  - Cricut (Día 14): $39,80
  - Suscripción IA (Día 13): $20,00
  - Compromiso Inicial Teléfono: $150,00 (tramo 2 de la inicial)
- **Total Salidas:** $560,73
- **Remanente Libre Estimado:** **$87,27 USDT** ($43,63/semana).

#### Aporte Recomendado a Simple Earn:
- Puedes destinar un máximo de **$30,00 a $40,00 USDT** a la reserva de la playa.
- Esto mantendrá tu bolsillo líquido en **~$47,00 USDT** ($23,50/semana de libre disposición), manteniéndote dentro de un perfil austero pero sin asfixia total antes de liquidar Cashea el 27 de noviembre.`;
  }

  if (query.includes('70 horas') || query.includes('70h') || query.includes('horas')) {
    const gross70 = 70 * 8.10;
    const totalOut = (ctx?.fixedExpenses || 297.5) + (ctx?.debtInstallments || 38.43);
    const pocket70 = gross70 - totalOut;
    const weekly70 = pocket70 / 2;

    return `### ⏱️ Simulación de Jornada: 70 Horas vs 80 Horas

| Métrica | Base 80h ($8,10/h) | Simulación 70h ($8,10/h) | Diferencia |
| :--- | :--- | :--- | :--- |
| **Ingreso Bruto** | $648,00 | $${gross70.toFixed(2)} | -$81.00 |
| **Salidas Totales** | $${totalOut.toFixed(2)} | $${totalOut.toFixed(2)} | $0.00 |
| **Remanente Bolsillo** | $${(648.00 - totalOut).toFixed(2)} | **$${pocket70.toFixed(2)}** | -$81.00 |
| **Margen Semanal** | $${((648.00 - totalOut) / 2).toFixed(2)}/sem | **$${weekly70.toFixed(2)}/sem** | ${weekly70 < 30 ? '⚠️ Alerta' : '✅ Seguro'} |

> [!NOTE]
> Trabajar 70 horas te deja un margen semanal de **$${weekly70.toFixed(2)}/semana**. Es sostenible siempre que no asumas nuevas deudas antes de liquidar Cashea.`;
  }

  return `### 💡 Evaluación del Asesor Financiero

Analizando tu mensaje: *"Revisión de flujo y liquidez actual"*

- **Quincena activa:** ${ctx?.activeCycleDate || '30 Oct 2026'} (${ctx?.hoursWorked || 56} horas = $${ctx?.grossIncome || '453.60'})
- **Bolsillo libre actual:** $${currentPocket.toFixed(2)} USDT ($${weeklyCurrent.toFixed(2)}/semana)
- **Fondos en custodia:**
  * Subcuenta Hogar: $${ctx?.hogarBalance || '167.50'} USDT (Blindado)
  * Simple Earn: $${ctx?.earnBalance || '308.93'} USDT (Reserva)
  * Principal: $${ctx?.principalBalance || '75.28'} USDT (Líquido)

#### Principio Clave de tus Ciclos:
Mantén la regla de no comprometer más de $35 quincenales en nuevas cuotas hasta que termine el ciclo de **Cashea (27 de Noviembre)** y se estabilice la financiación del nuevo teléfono. Cualquier compra extraordinaria debe evaluarse contra el piso de seguridad de **$30 a $40 semanales** de bolsillo libre.`;
}
