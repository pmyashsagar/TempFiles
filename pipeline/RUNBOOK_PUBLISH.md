# Publisher runbook (part 2 of the single daily routine; run it right after RUNBOOK_CREATE.md in the same session)

> MODE: read the routine prompt. `MODE=publish-only` (or 'only publish what is already staged'): skip RUNBOOK_CREATE.md entirely, publish every staged `v-*` branch that is not yet posted in state/posted.json (max 2), then stop. In a full run, publish the videos you just staged.


Publish every video staged today (max 2), one after the other, with at least 10 minutes between the first and the second video on all platforms. Never post a slug already marked posted in state/posted.json. If nothing is staged, stop.

## 1. Find and verify
- `git ls-remote --heads origin 'v-*'`; take today's staged branches, read each `meta.json`; require `qa.passed == true`.
- Public video URL (must return HTTP 200, content-length > 1 MB, support range): `https://raw.githubusercontent.com/pmyashsagar/TempFiles/<branch>/video.mp4` (branch names contain no slash: v-YYYYMMDD-slug).

## 2. Post (account routing is fixed by the owner)
1. Instagram via the Windsor.ai connector: `execute_action` connector=instagram, account=17841477130761070 (findmyinnerpeace), action=create_video_post, params {video_url, caption: meta.instagram_caption, share_to_feed: true}. It publishes immediately.
2. YouTube via Metricool: createScheduledPost blogId=8265875, date = now + 3 minutes in Asia/Calcutta (ISO with +05:30), info = {autoPublish:true, providers:[{network:"youtube"}], text: youtube.description, media:[video_url], publicationDate:{dateTime, timezone:"Asia/Calcutta"}, youtubeData:{title, type:"short", privacy:"public", tags, category:"EDUCATION", madeForKids:false, isAiGeneratedContent:false}}. If Metricool returns an error about credits / plan limit / quota (monthly free credits exhausted), fall back to Zapier: execute_zapier_write_action selected_api=YouTubeV4CLIAPI action=upload_video params {title, description, video: video_url, privacy_status:"public", tags, made_for_kids:false}.
3. Facebook via Zapier: execute_zapier_write_action selected_api=FacebookV2CLIAPI action=page_video params {page:"1526608943860835" (Its my notebook), title: meta.facebook_title, source: video_url, description: meta.facebook_description}.
Use the caption, hashtags and metadata exactly as in meta.json.

## 3. Verify, then delete

### 3a. NEVER blindly retry a post (a timeout is NOT a failure)
Owner-observed fact: Windsor's `create_video_post` timed out (60 s) on 3 of 3 posts, and every one of those posts HAD gone live. Retrying would create a duplicate reel/video. Rule for every platform: a timeout, a 5xx, a dropped connection or any "outcome unknown" error means UNKNOWN. First check, then decide.
- Record intent BEFORE posting: write `state/posted.json[slug].<platform> = {"status":"attempted","at":"<ISO time>"}` locally (push at the end of the run, or immediately if cheap). If the session dies mid-run, the next run sees "attempted" and VERIFIES instead of re-posting.
- Instagram (Windsor): check with `get_data` connector=instagram, accounts=[17841477130761070], fields [media_id, media_permalink, media_caption], date_preset `last_2dT`, NO caption filter (the cache lags and filters miss); look for a media whose caption starts with the first line of `meta.instagram_caption` and whose media_id is not already in state. Not found: wait 90 s and check again; check up to 3 times over about 5 minutes. Only if it is still absent after that, post again ONCE.
- YouTube (Metricool): on an unknown outcome call `getScheduledPosts` for blogId 8265875 around today and look for the exact title; if present, it is created, never create it again. After creating, record the post id and status.
- Facebook (Zapier): a returned `id` means success. On an unknown outcome check the page's recent videos (Zapier Facebook Pages find/read action if enabled) for the same title before posting again; if you cannot verify, do NOT retry; record "unverified" and notify.
- A DEFINITE failure (clear 4xx error message such as invalid token, quota exceeded, media rejected) may be retried once after 2 minutes, after fixing the cause (YouTube credits exhausted -> Zapier upload_video).
- Never post the same slug to the same platform twice. Before any post, check the state entry for that platform.

### 3b. Confirm YouTube really published
Metricool shows `Pending` at creation. After the second video has been handled (and again at the very end of the run), call `getScheduledPosts` and record each YouTube post's status (PUBLISHED / PENDING / ERROR). ERROR -> failure notification with the title. PENDING after its scheduled time + 15 min -> notify "YouTube pending".

### 3c. Mark posted, then clean up
- When ALL THREE accepted (or were verified live): mark the slug `"posted"` in `state/posted.json` on main (post ids, permalinks, date), push main. Keep the entry's `branch` field starting with the exact branch name (`v-YYYYMMDD-slug`).
- Try to delete the branch (`git push origin --delete <branch>`). If it is refused or hangs (it often is from sessions), do NOT retry or work around: append " (not deleted)" in the state entry and move on. `pipeline/cleanup_branches.sh` (run by the scheduled GitHub Action, see pipeline/cleanup-workflow.yml) removes posted branches the next day.
- If a platform failed definitively twice: keep the branch, record it in state/posted.json and send a PushNotification naming the platform. Do not delete a video that is not posted everywhere.
- Send one PushNotification at the end: success summary (titles, permalinks/ids, YouTube status) or failure (which platform, which video).
