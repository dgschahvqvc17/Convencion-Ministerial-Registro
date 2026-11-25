# Guía de Diseño UI/UX: Sistema de Registro de Asistencia
**Evento:** 44° Convención Ministerial — Iglesia de Dios de la Profecía (Bolivia)  
**Lema:** *"Testifiquemos"* (Isaías 43:10)  
**Sede y Fecha:** Cochabamba, 1 al 3 de Diciembre de 2026  

---

## 1. Paleta de Colores (Color System)

La paleta principal extrae los tonos institucionales y vibrantes del afiche oficial, equilibrando la seriedad del azul marino profundo con la energía del dorado/amarillo y los acentos patrios.

### Colores Principales (Brand Colors)
* **Azul Real Profundo (Fondo Principal):** `#141B5B`
  * *Uso:* Fondo base de la aplicación, encabezados (headers) y barras de navegación.
* **Azul Cobalto Medio (Superficies / Tarjetas):** `#1E2A78`
  * *Uso:* Contenedores de formularios, tarjetas de registro de pastores, modales.
* **Azul Destello (Acentos de Fondo):** `#2B3BA0`
  * *Uso:* Efectos hover, bordes activos y degradados sutiles.

### Colores de Acento y Llamados a la Acción (CTA)
* **Amarillo Dorado (Acento Principal):** `#F7B500`
  * *Uso:* Botón principal ("Registrar Asistencia"), títulos destacados ("TESTIFIQUEMOS", "2026"), indicadores de estado activo.
* **Naranja Ámbar (Degradado / Sombra):** `#E58E00`
  * *Uso:* Estado *hover* de los botones dorados, sombras paralelas de textos grandes y franjas diagonales decorativas.

### Colores Patrios (Acentos Secundarios - Bolivia)
* **Rojo Bandera:** `#D52B1E` (Alertas de error, botón de eliminar/cancelar, badge decorativo).
* **Amarillo Bandera:** `#F9E300` (Advertencias, badge decorativo).
* **Verde Bandera:** `#007934` (Confirmación de asistencia exitosa, estado "Presente", badge decorativo).

### Colores Neutros (Tipografía y Fondos Claros)
* **Blanco Puro:** `#FFFFFF` (Textos principales sobre fondo azul, fondo de inputs para máxima legibilidad).
* **Gris Hielo / Azul Muy Claro:** `#F0F4F8` (Fondo alternativo para tablas de reportes o modo claro).
* **Gris Pizarra (Textos Secundarios):** `#B0B8D1` (Placeholders, subtítulos, etiquetas de ayuda sobre fondo oscuro).
* **Texto Oscuro (Sobre Blanco/Dorado):** `#0F143A` (Texto dentro de los botones dorados e inputs blancos).

---

## 2. Tipografía (Typography)

Se recomienda utilizar fuentes gratuitas de **Google Fonts** que repliquen fielmente el estilo del cartel oficial.

### Familias Tipográficas
1. **Títulos Principales e Impacto (`TESTIFIQUEMOS`, `BOLIVIA`):**
   * **Fuente:** `Montserrat` (Pesos: `800 ExtraBold` o `900 Black`)
   * **Estilo:** Mayúsculas, *letter-spacing* ligeramente ajustado (`-0.02em`), con sombra sólida (`text-shadow: 2px 3px 0px #B86B00;`) para emular el relieve del afiche.
2. **Subtítulos, Cuerpo y Formularios:**
   * **Fuente:** `Inter` o `Poppins` (Pesos: `400 Regular`, `500 Medium`, `600 SemiBold`, `700 Bold`)
   * **Estilo:** Limpia, moderna y de alta legibilidad en pantallas móviles para agilizar el registro rápido de los pastores.
3. **Acento Caligráfico / Decorativo (`Cochabamba`):**
   * **Fuente:** `Pacifico` o `Yellowtail` (Peso: `400 Regular`)
   * **Uso:** Exclusivo para detalles decorativos como el nombre de la ciudad sede o mensajes de bienvenida, en color `#2643B5` (efecto marca de agua) o `#F7B500`.

### Jerarquía Tipográfica (Escala Web)
* **H1 (Título de Evento):** `2.5rem` (40px) — Montserrat Black, `#F7B500`
* **H2 (Sección / Pantalla):** `1.5rem` (24px) — Montserrat Bold, `#FFFFFF`
* **H3 (Subtítulo / Iglesia):** `1.125rem` (18px) — Poppins SemiBold, `#F7B500`
* **Body / Inputs:** `1rem` (16px) — Inter Regular (16px mínimo evita el zoom automático en celulares iOS/Android).
* **Small / Versículo / Pie:** `0.875rem` (14px) — Inter Regular, `#B0B8D1`

---

## 3. Fondos y Texturas (Backgrounds & Assets)

Para mantener la identidad visual sin sacrificar la velocidad de carga ni la legibilidad de los datos:

1. **Degradado Base (Hero & App Background):**
   ```css
   background: radial-gradient(circle at 50% 20%, #273694 0%, #141B5B 70%, #0D1240 100%);
   ```
2. **Silueta Urbana de Cochabamba (Footer / Fondo Inferior):**
   * Aplicar una imagen vectorial o PNG monocromático en azul (`#1B277A`) con opacidad del `25%` (`opacity: 0.25`) anclada en la parte inferior (`background-position: bottom center; background-size: cover;`), mostrando el paisaje montañoso y arquitectura de Cochabamba.
3. **Franjas Diagonales Decorativas:**
   * En las esquinas (inferior izquierda y derecha), incorporar formas geométricas diagonales con degradado de dorado a verde (`linear-gradient(135deg, #F7B500 0%, #007934 100%)`) para enmarcar la pantalla.
4. **Marca de Agua Superior:**
   * Incluir el emblema circular de los tres íconos (Cruz, Estrella, Corona) en la barra superior (`Navbar`) en blanco `#FFFFFF`, y el escudo oficial de la *Iglesia de Dios de la Profecía* en el pie de página o pantalla de confirmación.

---

## 4. Componentes UI para el Registro de Pastores

### Tarjeta de Formulario (Glassmorphism Sutil)
* **Fondo:** `rgba(30, 42, 120, 0.75)` con desenfoque `backdrop-filter: blur(10px)`.
* **Borde:** `1px solid rgba(247, 181, 0, 0.3)` (borde dorado sutil).
* **Radio de borde:** `16px`.

### Campos de Entrada (Inputs / Selectores)
* **Fondo:** `#FFFFFF` (Blanco sólido para que los pastores o encargados lean sin esfuerzo bajo cualquier iluminación).
* **Texto:** `#0F143A` (Azul muy oscuro).
* **Borde activo (Focus):** `2px solid #F7B500` con resplandor suave (`box-shadow: 0 0 0 3px rgba(247, 181, 0, 0.25)`).
* **Altura:** `48px` (ideal para interacción táctil en celulares y tablets).

### Botones
* **Botón Primario (Confirmar Asistencia / Buscar Pastor):**
  * **Fondo:** `linear-gradient(180deg, #FFD000 0%, #F7B500 100%)`
  * **Texto:** `#0F143A` en **Negrita (Bold)**, mayúsculas.
  * **Borde redondeado:** `10px`.
  * **Sombra:** `0 4px 14px rgba(247, 181, 0, 0.4)`.
* **Botón Secundario (Escanear QR / Ver Lista):**
  * **Fondo:** Transparente (`transparent`).
  * **Borde:** `2px solid #FFFFFF`.
  * **Texto:** `#FFFFFF`.

### Indicadores de Estado (Badges de Asistencia)
* **Asistencia Confirmada:** Fondo `#007934` (Verde), texto `#FFFFFF`, ícono de check.
* **Pendiente de Registro:** Fondo `rgba(247, 181, 0, 0.2)`, borde `#F7B500`, texto `#F7B500`.
* **Bloque Tricolor Decorativo:** Tres pequeñas barras horizontales (`width: 16px; height: 5px; border-radius: 2px;`) en Rojo `#D52B1E`, Amarillo `#F9E300` y Verde `#007934` ubicadas justo encima del título principal de la aplicación.

---

## 5. Variables CSS Listas para Copiar (`variables.css`)

```css
:root {
  /* Colores Principales */
  --bg-primary: #141B5B;
  --bg-card: #1E2A78;
  --bg-accent: #2B3BA0;

  /* Dorados / Llamados a la acción */
  --gold-primary: #F7B500;
  --gold-hover: #E58E00;
  --gold-light: #FFD000;

  /* Bandera de Bolivia */
  --bolivia-red: #D52B1E;
  --bolivia-yellow: #F9E300;
  --bolivia-green: #007934;

  /* Textos y Neutros */
  --text-light: #FFFFFF;
  --text-muted: #B0B8D1;
  --text-dark: #0F143A;
  --input-bg: #FFFFFF;

  /* Tipografías */
  --font-display: 'Montserrat', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-script: 'Pacifico', cursive;
}
```