# 📱 Personal Cashflow & AI Budgeting PWA

Progressive Web App (PWA) de uso personal para finanzas y presupuesto quincenal en ciclos exactos de 14 días, optimizada para desplegarse en **Vercel** e instalarse en **iOS Safari** (*Add to Home Screen*), con asesoría financiera proactiva mediante la **API de Google Gemini**.

---

## 💎 Reglas de Negocio y Dominio Financiero

1. **Ciclo de Nómina Bi-semanal (14 días)**:
   - Tarifa estándar: **$8,10 / hora**.
   - Jornada regular: 80 horas = **$648,00 USDT**.
   - Excepciones controladas: 56 horas = **$453,60 USDT** (Cobro 30 de Octubre).
2. **Estructura Multicuenta**:
   - **Binance Principal**: Saldo disponible para compras del día a día, ocio y compromisos semanales.
   - **Subcuenta Hogar (Blindada)**: Reserva ineludible para el 50% del alquiler ($82,50 por cobro para totalizar $165/mes), mercado, servicios e internet.
   - **Simple Earn**: Reserva de liquidez con devengo de rendimiento y pote de contingencia (prioridad: viaje a la playa del 18 de Diciembre).
3. **Control de Deudas y Umbral de Bolsillo**:
   - Calendario activo: Cashea (3 cuotas de $38,43), Cricut ($39,80 mensual fija día 14), Suscripción IA ($20 mensual día 13) y nuevo teléfono.
   - **Umbral de Seguridad**: Advertencia automática si el remanente libre cae por debajo de **$30 - $40 por semana**.

---

## 🚀 Inicio Rápido (Local)

1. **Entrar al directorio**:
   ```bash
   cd personal-cashflow-pwa
   ```

2. **Configurar la clave de Gemini** en `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Agrega tu clave obtenida gratis en [Google AI Studio](https://aistudio.google.com/):
   ```env
   GEMINI_API_KEY=tu_clave_de_gemini
   ```
   *(Nota: La app incluye un motor de simulación financiera que responde incluso si no has colocado la clave aún).*

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## ☁️ Base de Datos en Supabase (Opcional para persistencia en nube)

La app cuenta con persistencia local instantánea en el navegador (LocalStorage). Si deseas sincronizarla con PostgreSQL en la nube:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve al **SQL Editor** y ejecuta el archivo [`supabase-schema.sql`](./supabase-schema.sql).
3. Copia tus credenciales en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

---

## 🚢 Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com).
3. En **Settings > Environment Variables**, agrega:
   - `GEMINI_API_KEY`: Tu clave de Gemini.
4. Haz clic en **Deploy**.

---

## 📲 Instalación en iOS (iPhone / Safari)

1. Abre la URL de Vercel en **Safari**.
2. Presiona el botón de **Compartir** (icono central con la flecha hacia arriba).
3. Selecciona **"Añadir a la pantalla de inicio"** (*Add to Home Screen*).
4. La aplicación se abrirá en modo nativo a pantalla completa, respetando el Dynamic Island / Notch y con la barra de navegación táctil optimizada.
