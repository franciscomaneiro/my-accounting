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
  1. Binance Principal (acc-principal): Saldo actual $${context?.principalBalance ?? '75.28'} USDT (gastos del día a día, ocio y compromisos semanales).
  2. Subcuenta Hogar (acc-hogar): Saldo actual $${context?.hogarBalance ?? '167.50'} USDT (fondos blindados para el 50% de alquiler acumulativo de $82,50, mercado, servicios y compromisos familiares).
  3. Simple Earn (acc-earn): Saldo actual $${context?.earnBalance ?? '308.93'} USDT (reserva de liquidez, ahorro con devengo de rendimiento y pote de contingencia).
- Gasto de alquiler mensual: $165, que reserva en mitades exactas e intocables de $82,50 en cada cobro quincenal.
- Deudas activas con calendario riguroso:
  * Cashea (Los 777): 3 cuotas de $38,43 los días 30 oct, 13 nov y finiquita el 27 nov.
  * Cricut: Cuota fija mensual de $39,80 los días 14 de cada mes (noviembre a febrero).
  * Teléfono nuevo: Inicial de $500 ($300 puente Simple Earn + $50 el 30 oct + $150 el 13 nov); luego $400 financiado en cuotas de $100 quincenales.
- Gastos fijos esenciales: Mercado ($160 quincenal), Alquiler 50% ($82,50), Servicios ($25), Gasolina Corsa ($15), Arena de gatos ($15), Depilación pareja ($15 desde el 13 nov), Suscripción IA ($20 mensual los días 13).
- Metas prioritarias:
  1. Viaje a la Playa del 18 de Diciembre (Meta $400 en Simple Earn).
  2. Mantenimiento del Corsa (Tren delantero y servicios).
- Quincena actual seleccionada:
  * Fecha de cobro: ${context?.activeCycleDate ?? '2026-10-30'}
  * Horas liquidadas: ${context?.hoursWorked ?? 56}h = $${context?.grossIncome ?? '453.60'} USDT bruto
  * Remanente Libre ("Bolsillo"): $${context?.freePocket ?? '117.67'} ($${context?.weeklyPocket ?? '58.83'}/semana)
  * Nivel de seguridad: ${context?.safetyStatus ?? 'seguro'}

INSTRUCCIÓN ESPECIAL: CREACIÓN DE ENTIDADES
Si el usuario te solicita registrar, anotar, crear o guardar un gasto, deuda, gasto fijo, meta o transferencia (por ejemplo: "anota que gasté $15 en gasolina", "registra una deuda de Cashea de $60 en 3 cuotas", "crea una meta para X", "pasa $82.50 a Hogar"), debes incluir AL FINAL de tu respuesta un bloque especial delimitado por \`\`\`action y \`\`\` con la siguiente estructura JSON estricta:

\`\`\`action
{
  "entity": "gasto" | "deuda" | "fijo" | "meta" | "transferencia",
  "title": "Nombre corto de la entidad a crear",
  "summary": "Resumen claro del registro",
  "data": {
    // Si entity es "gasto":
    // "amount": 15.00, "account_id": "acc-principal" | "acc-hogar" | "acc-earn", "description": "Gasolina Corsa", "type": "expense"
    // Si entity es "deuda":
    // "title": "Cashea Zapatos", "total_amount": 60.00, "installment_amount": 20.00, "total_installments": 3, "frequency": "biweekly"
    // Si entity es "fijo":
    // "name": "Gimnasio", "default_amount": 25.00, "periodicity": "biweekly"
    // Si entity es "meta":
    // "title": "Repuestos Corsa", "target_amount": 120.00, "current_amount": 20.00, "target_date": "2026-12-01", "category": "car"
    // Si entity es "transferencia":
    // "from_account_id": "acc-principal", "to_account_id": "acc-hogar", "amount": 82.50, "note": "Alquiler 50%"
  }
}
\`\`\`
En tu texto explicativo previo, sé claro, directo y resalta siempre el impacto que tendrá en el flujo quincenal.
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

    // Call Google Gemini REST API directly
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: contextPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Entendido. Conozco tus cuentas de Binance, tus deudas vivas, metas del Corsa y Playa, y emitiré bloques action cada vez que deba crear una entidad (gasto, deuda, fijo, meta, transferencia).' }],
      },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: `Pregunta o instrucción del usuario: ${message}` }],
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
          maxOutputTokens: 1400,
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

  // 1. Detect Intent: Register Expense / Withdrawal
  if (
    query.includes('gasté') ||
    query.includes('gaste') ||
    query.includes('usé') ||
    query.includes('use') ||
    query.includes('pagué') ||
    query.includes('pague') ||
    query.includes('saqué') ||
    query.includes('saque') ||
    query.includes('retiré') ||
    query.includes('retire') ||
    query.includes('registra gasto') ||
    query.includes('egreso')
  ) {
    const matchAmount = query.match(/\$?(\d+(?:\.\d+)?)/);
    const isEarn = query.includes('earn') || query.includes('simple earn');
    const isHogar = query.includes('hogar');
    
    const targetAccountId = isEarn ? 'acc-earn' : isHogar ? 'acc-hogar' : 'acc-principal';
    const targetAccountName = isEarn ? 'Binance Simple Earn' : isHogar ? 'Subcuenta Hogar' : 'Binance Principal';
    const currentBalance = isEarn
      ? (ctx?.earnBalance || 308.93)
      : isHogar
      ? (ctx?.hogarBalance || 167.50)
      : (ctx?.principalBalance || 75.28);

    const defaultAmount = isEarn && (query.includes('telefono') || query.includes('teléfono')) ? 300.00 : 15.00;
    const amount = matchAmount ? parseFloat(matchAmount[1]) : defaultAmount;

    let desc = 'Gasto del día a día';
    if (isEarn && (query.includes('telefono') || query.includes('teléfono') || query.includes('inicial'))) {
      desc = 'Inicial Teléfono Nuevo (Puente Simple Earn)';
    } else if (query.includes('gasolina')) {
      desc = 'Gasolina Corsa';
    } else if (query.includes('mercado')) {
      desc = 'Mercado imprevisto';
    } else if (query.includes('telefono') || query.includes('teléfono')) {
      desc = 'Pago/Inicial Teléfono';
    }

    const newBalance = Math.max(0, currentBalance - amount);

    return `He preparado el registro de tu movimiento por **$${amount.toFixed(2)} USDT**.

- **Cuenta afectada:** ${targetAccountName}
- **Concepto:** ${desc}
- **Saldo actual:** $${currentBalance.toFixed(2)} USDT ➔ **Nuevo saldo estimado:** $${newBalance.toFixed(2)} USDT

Al confirmar abajo con un solo toque, se actualizará el saldo de la cuenta y quedará registrado en tu historial de movimientos:

\`\`\`action
{
  "entity": "gasto",
  "title": "${desc}",
  "summary": "Registrar salida de $${amount.toFixed(2)} USDT en ${targetAccountName}",
  "data": {
    "amount": ${amount},
    "account_id": "${targetAccountId}",
    "description": "${desc}",
    "type": "expense"
  }
}
\`\`\``;
  }

  // 2. Detect Intent: Create Debt
  if (query.includes('deuda') || query.includes('cuota') || query.includes('cashea') || query.includes('crédito') || query.includes('fiado')) {
    const matchAmount = query.match(/\$?(\d+(?:\.\d+)?)/);
    const total = matchAmount ? parseFloat(matchAmount[1]) : 60.00;
    const installments = query.includes('4') ? 4 : 3;
    const cuota = Math.round((total / installments) * 100) / 100;

    return `### 💳 Evaluación de Nueva Deuda

- **Monto Total:** $${total.toFixed(2)} USDT
- **Estructura:** ${installments} cuotas quincenales de **$${cuota.toFixed(2)} USDT**
- **Impacto en Flujo:** Tu remanente quincenal se reducirá en $${cuota.toFixed(2)}, dejando tu margen semanal en $${(weeklyCurrent - cuota / 2).toFixed(2)}/semana.

He preparado la entidad de crédito para que la agregues a tu Debt Tracker:

\`\`\`action
{
  "entity": "deuda",
  "title": "Financiamiento Cashea ($${total.toFixed(2)})",
  "summary": "${installments} cuotas quincenales de $${cuota.toFixed(2)} USDT",
  "data": {
    "title": "Compra a Cuotas Cashea",
    "total_amount": ${total},
    "installment_amount": ${cuota},
    "total_installments": ${installments},
    "frequency": "biweekly",
    "notes": "Compra registrada mediante el Asesor IA"
  }
}
\`\`\``;
  }

  // 3. Detect Intent: Goal contribution
  if (query.includes('meta') || query.includes('playa') || query.includes('viaje') || query.includes('apartar') || query.includes('ahorrar')) {
    const matchAmount = query.match(/\$?(\d+(?:\.\d+)?)/);
    const amount = matchAmount ? parseFloat(matchAmount[1]) : 30.00;

    return `### 🏖️ Aporte a Meta de Ahorro: Viaje a la Playa

Excelente iniciativa. Apartar **$${amount.toFixed(2)} USDT** para el viaje del 18 de diciembre te acerca al objetivo sin comprometer tus gastos fijos esenciales.

He preparado la acción para registrar el progreso en tu meta:

\`\`\`action
{
  "entity": "meta",
  "title": "Viaje a la Playa (18 Dic)",
  "summary": "Sumar $${amount.toFixed(2)} USDT al progreso de la meta",
  "data": {
    "goal_id": "goal-playa",
    "amount_to_add": ${amount}
  }
}
\`\`\``;
  }

  // 4. Detect Intent: Transfer funds
  if (query.includes('transfiere') || query.includes('pasa') || query.includes('mover') || query.includes('blindar')) {
    return `### 🔄 Transferencia de Fondos: Alquiler Blindado

He preparado la transferencia de **$82,50 USDT** desde **Binance Principal** hacia tu **Subcuenta Hogar** para resguardar la mitad del alquiler.

\`\`\`action
{
  "entity": "transferencia",
  "title": "Blindar 50% Alquiler",
  "summary": "Transferir $82.50 USDT de Principal a Subcuenta Hogar",
  "data": {
    "from_account_id": "acc-principal",
    "to_account_id": "acc-hogar",
    "amount": 82.50,
    "note": "Aporte 50% Alquiler blindado vía Asesor IA"
  }
}
\`\`\``;
  }

  // Default Simulation: Epson
  if (query.includes('epson') || query.includes('59') || query.includes('impresora')) {
    const newPocket = Math.round((currentPocket - 59) * 100) / 100;
    const newWeekly = Math.round((newPocket / 2) * 100) / 100;
    const isDangerous = newWeekly < 30;

    return `### 🖨️ Análisis de Impacto: Impresora Epson L3250 ($59 quincenales)

**Veredicto del Asesor:** ⚠️ **${isDangerous ? 'NO RECOMENDADO EN ESTE CICLO' : 'PRECAUCIÓN EXTREMA'}**

#### Comparativa de Flujo de Caja:
| Concepto | Antes | Con Epson ($59) | Variación |
| :--- | :--- | :--- | :--- |
| **Ingreso Bruto** | $${ctx?.grossIncome || 453.60} | $${ctx?.grossIncome || 453.60} | $0.00 |
| **Bolsillo Libre** | **$${currentPocket.toFixed(2)}** | **$${newPocket.toFixed(2)}** | -$59.00 (-50.1%) |
| **Margen Semanal** | **$${weeklyCurrent.toFixed(2)}/sem** | **$${newWeekly.toFixed(2)}/sem** | 🔴 ${newWeekly < 30 ? 'Zona Crítica (< $30/sem)' : 'Alerta'} |

> [!WARNING]
> Tu margen semanal caería a **$${newWeekly.toFixed(2)}/semana**, vulnerando el piso de seguridad estipulado de $30-$40.

Si aún así decides contraerla, aquí está la entidad lista para crear:

\`\`\`action
{
  "entity": "deuda",
  "title": "Impresora Epson L3250",
  "summary": "4 cuotas quincenales de $59.00 USDT",
  "data": {
    "title": "Impresora Epson L3250",
    "total_amount": 236.00,
    "installment_amount": 59.00,
    "total_installments": 4,
    "frequency": "biweekly",
    "notes": "Financiamiento de impresora"
  }
}
\`\`\``;
  }

  return `### 💡 Evaluación del Asesor Financiero

- **Quincena activa:** ${ctx?.activeCycleDate || '30 Oct 2026'} (${ctx?.hoursWorked || 56} horas = $${ctx?.grossIncome || '453.60'} USDT)
- **Bolsillo libre actual:** $${currentPocket.toFixed(2)} USDT ($${weeklyCurrent.toFixed(2)}/semana)
- **Fondos en custodia:**
  * Subcuenta Hogar: $${ctx?.hogarBalance || '167.50'} USDT (Blindado)
  * Simple Earn: $${ctx?.earnBalance || '308.93'} USDT (Reserva)
  * Principal: $${ctx?.principalBalance || '75.28'} USDT (Líquido)

Puedes pedirme evaluar o registrar cualquier entidad directamente:
- *"Gasté $15 en gasolina en la Principal"* (crea un **gasto**)
- *"Compré X por Cashea a $40 en 2 cuotas"* (crea una **deuda**)
- *"Agrega un gasto fijo de $25 para gimnasio"* (crea un **fijo**)
- *"Aparté $30 para el viaje de la playa"* (abona a una **meta**)
- *"Pasa $82.50 a Hogar"* (ejecuta una **transferencia**)`;
}
