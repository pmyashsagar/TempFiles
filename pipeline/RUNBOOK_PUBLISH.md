# Publisher runbook (runs 07:45 IST and 19:45 IST, unattended)

Slot: the 07:45 IST run publishes the staged video with `"slot": "am"`; the 19:45 IST run publishes `"slot": "pm"`. If none is staged for the slot, do nothing (note it in state/last_error.txt).

## 1. Find and fetch
- Attach the repo (add_repo pmyashsagar/TempFiles, access push) and run `git ls-remote --heads origin 'v-*'`. Fetch the branch for the slot; read `meta.json`; require `qa.passed == true`.
- Public video URL (must return HTTP 200, content-length > 1 MB, support range): `https://raw.githubusercontent.com/pmyashsagar/TempFiles/<branch>/video.mp4` (branch names contain no slash: v-YYYYMMDD-slug).

## 2. Post (account routing is fixed by the owner)
1. Instagram via the Windsor.ai connector: `execute_action` connector=instagram, account=17841477130761070 (findmyinnerpeace), action=create_video_post, params {video_url, caption: meta.instagram_caption, share_to_feed: true}. It publishes immediately (no scheduling).
2. YouTube via Metricool: createScheduledPost blogId=8265875, date = now + 3 minutes in Asia/Calcutta (ISO with +05:30), info = {autoPublish:true, providers:[{network:"youtube"}], text: youtube.description, media:[video_url], publicationDate:{dateTime, timezone:"Asia/Calcutta"}, youtubeData:{title, type:"short", privacy:"public", tags, category:"EDUCATION", madeForKids:false, isAiGeneratedContent:false}}. If Metricool returns an error about credits / plan limit / quota (monthly free credits exhausted), fall back to Zapier: execute_zapier_write_action selected_api=YouTubeV4CLIAPI action=upload_video params {title, description, video: video_url, privacy_status:"public", tags, made_for_kids:false}.
3. Facebook via Zapier: execute_zapier_write_action selected_api=FacebookV2CLIAPI action=page_video params {page:"1526608943860835" (Its my notebook), title: meta.facebook_title, source: video_url, description: meta.facebook_description}.
Include the caption, hashtags and metadata exactly as in meta.json.

## 3. Verify, then delete
- Confirm each platform accepted the post (IG media id returned; Metricool plannerUrl/status; Zapier success). Retry a failed platform once after 2 minutes.
- Only when ALL THREE succeeded: delete the branch (`git push origin --delete <branch>`), set the slug to "posted" in `state/posted.json` on main with the post ids/dates, push main.
- If one platform failed twice: keep the branch, record the failure in `state/posted.json`, and email the account owner via the Gmail connector (if available). Do not delete the video until it is posted everywhere.
- Never post the same slug twice: check state first.
