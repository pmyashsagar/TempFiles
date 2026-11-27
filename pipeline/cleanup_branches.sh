#!/usr/bin/env bash
# Delete staged video branches (v-YYYYMMDD-slug) that are already posted everywhere.
# Reads state/posted.json (on the checked-out ref, normally main). Safe by default:
#   * only branches whose state entry has status "posted"
#   * only when the entry's date is BEFORE today (UTC) so YouTube/Metricool has long since fetched the file
#   * --dry-run prints what would be deleted
# Usage: pipeline/cleanup_branches.sh [--dry-run] [--min-age-days N]   (default N=1)
set -euo pipefail
DRY=0; MIN=1
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY=1 ;;
    --min-age-days) MIN="$2"; shift ;;
    *) echo "unknown arg $1" >&2; exit 2 ;;
  esac; shift
done
cd "$(git rev-parse --show-toplevel)"
branches=$(MIN="$MIN" python3 -I - <<'PY'
import json, os, re, datetime
st = json.load(open('state/posted.json'))
cut = datetime.date.today() - datetime.timedelta(days=int(os.environ['MIN']))
for slug, e in st.items():
    if not isinstance(e, dict) or e.get('status') != 'posted':
        continue
    m = re.match(r'(v-\d{8}-[A-Za-z0-9._-]+)', e.get('branch', ''))
    if not m:
        continue
    try:
        d = datetime.date.fromisoformat(e.get('date', '')[:10])
    except ValueError:
        continue
    if d <= cut:
        print(m.group(1))
PY
)
remote=$(git ls-remote --heads origin 'v-*' | sed 's#.*refs/heads/##')
n=0
for b in $branches; do
  if echo "$remote" | grep -qx "$b"; then
    if [ "$DRY" = 1 ]; then echo "would delete $b"; else
      echo "deleting $b"; git push origin --delete "$b" || echo "FAILED to delete $b" >&2
    fi
    n=$((n+1))
  fi
done
echo "cleanup done: $n branch(es) ${DRY:+(dry run)}"
