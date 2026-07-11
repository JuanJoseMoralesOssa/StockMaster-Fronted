# Skills archivadas

Estas skills venían de otro proyecto (uno con `web/` en Next.js, `engine/` en
Python, bot de Telegram) y describen un stack que **my-inventory no tiene**:
Vite + React, sin Next.js y sin Python.

Se sacaron de `.claude/skills/` en la auditoría de eficiencia de tokens del
2026-07-11 por dos razones, y el orden importa:

1. **Precisión.** Sus disparadores decían "usá esta skill SIEMPRE que escribas
   código", y su contenido mandaba correr `npm run gen:api`, los gates de
   `web/` o los de Python, y ubicar código en capas `engine/bot/api/web`.
   Instrucciones falsas no son ruido neutro: empujan al agente a hacer lo
   equivocado con confianza.
2. **Costo.** Sus descripciones se cargaban en cada sesión y su cuerpo
   (~9.5k tokens estimados entre las dos) se cargaba cada vez que el disparador
   se activaba, que era casi siempre.

Quedan acá y no borradas porque no estaban en git: si alguna vez este repo suma
un frontend Next.js o un servicio Python, son un buen punto de partida — pero hay
que reescribirlas contra la realidad de ese momento antes de devolverlas a
`.claude/skills/`.

La parte transversal que sí aplicaba (las 4 reglas del código sostenible, ETC,
POLA, primitivos, complejidad accidental) sobrevive reescrita para este repo en
`.claude/skills/clean-code-maintainability/SKILL.md`.
