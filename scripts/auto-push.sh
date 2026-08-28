#!/usr/bin/env bash
# Auto commit+push: vigila cambios en el repo y los sube automáticamente a GitHub.
# Vercel despliega automáticamente con cada push a main.
#
# Uso:    npm run autopush        (detener con Ctrl+C)
# Nota:   espera 10s sin cambios antes de subir, para no subir código a medias.

cd "$(dirname "$0")/.." || exit 1

echo "▶ Auto-push activo en $(pwd)"
echo "  Cada cambio guardado se subirá a GitHub y Vercel desplegará solo."
echo "  Detener: Ctrl+C"

while true; do
  if [[ -n "$(git status --porcelain)" ]]; then
    # Debounce: esperar hasta 10s sin nuevos cambios
    while true; do
      before="$(git status --porcelain | md5)"
      sleep 10
      after="$(git status --porcelain | md5)"
      [[ "$before" == "$after" ]] && break
    done
    git add -A
    git commit -m "auto: cambios $(date '+%Y-%m-%d %H:%M:%S')" --quiet
    echo "✓ Commit creado ($(date '+%H:%M:%S'))"
  fi

  # Subir commits pendientes (incluye reintentos si un push anterior falló)
  if [[ -n "$(git log origin/main..main --oneline 2>/dev/null)" ]]; then
    if git push origin main --quiet; then
      echo "✓ Subido a GitHub ($(date '+%H:%M:%S')) → Vercel desplegando…"
    else
      echo "✗ Push falló, reintentando en el próximo ciclo…"
    fi
  fi

  sleep 5
done
