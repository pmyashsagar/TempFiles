# Routine prompts (generic; the routine needs connectors + the TempFiles repository, see the setup guide)

## Test 1: publish only (posts whatever is already staged on v-* branches)
Follow pipeline/RUNBOOK_PUBLISH.md in the TempFiles repository. MODE=publish-only: publish every staged v-* branch that is not yet posted, to Instagram (Windsor), YouTube (Metricool, Zapier fallback) and Facebook (Zapier), delete each branch once it is posted on all three, update state/posted.json, and send a push notification with each platform's result.

## Test 2: create only (no posting)
Follow pipeline/RUNBOOK_CREATE.md in the TempFiles repository. MODE=create-only: make ONE video from the newest unposted blog post, stage it on a branch, and send a push notification with the result. Do not post anywhere.

## Daily (full run)
Follow pipeline/RUNBOOK_CREATE.md and then pipeline/RUNBOOK_PUBLISH.md in the TempFiles repository exactly. Pick the 2 best new blog posts, make and quality-check the videos, post each to Instagram (Windsor), YouTube (Metricool, Zapier fallback) and Facebook (Zapier) at least 10 minutes apart, delete each video after it is posted everywhere, and update state/posted.json. Never post a video that failed the checks. If anything fails, send a push notification saying what failed.
