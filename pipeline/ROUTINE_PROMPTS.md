# Routine prompts (generic; the routine needs connectors + the TempFiles repository)

## THE ROUTINE PROMPT (daily, end to end, no flags). Use this one.
Follow pipeline/RUNBOOK_CREATE.md and then pipeline/RUNBOOK_PUBLISH.md in the TempFiles repository exactly, in one run. Only consider RSS items with a pubDate after state/posted.json `_last_run` that are not already in state; record every considered blog in state/posted.json (chosen = staged then posted, others = considered) and set `_last_run` to the newest pubDate seen. If there are no new posts, stop quietly. Otherwise pick the 2 best, choose the animation/style from each article, make and quality-check both videos, then post each to Instagram (Windsor), YouTube (Metricool, Zapier fallback only if Metricool credits are exhausted) and Facebook (Zapier), at least 10 minutes apart. Delete each video's branch after it is posted everywhere (if deletion is refused, record it in state and leave it), and update state/posted.json. Never post a video that failed the checks. Never ask questions. If anything fails, send a push notification saying what failed; on success send one push notification summarising the posts.

## Debug only (do not use daily): publish-only
Follow pipeline/RUNBOOK_PUBLISH.md. MODE=publish-only: publish every staged v-* branch not yet posted (Instagram, YouTube, Facebook), delete each branch once posted on all three, update state/posted.json, notify with each platform's result.

## Debug only (do not use daily): create-only
Follow pipeline/RUNBOOK_CREATE.md. MODE=create-only: build and stage the videos and stop. Do not post anywhere.
