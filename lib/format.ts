// Formateo determinista (seguro para SSR, sin depender de ICU del runtime)

/** 412800 -> "412.8K" · 2400000 -> "2.4M" */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${trim1(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim1(n / 1_000)}K`;
  return `${Math.floor(n)}`;
}

/** 2847 -> "2.847" (separador de miles estilo LATAM) */
export function dots(n: number): string {
  return Math.floor(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 754 -> "12:34" */
export function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function trim1(x: number): string {
  const v = Math.floor(x * 10) / 10;
  return v % 1 === 0 ? `${v}` : v.toFixed(1);
}
