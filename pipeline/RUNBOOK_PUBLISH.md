# Publisher runbook (part 2 of the single daily routine; run it right after RUNBOOK_CREATE.md in the same session)

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
- Confirm each platform accepted the post (IG media id; Metricool plannerUrl/status; Zapier success). Retry a failed platform once after 2 minutes.
- Only when ALL THREE accepted the video: delete its branch (`git push origin --delete <branch>`), mark the slug "posted" in `state/posted.json` on main (post ids, date), push main.
- If a platform failed twice: keep the branch, record it in state/posted.json and send a PushNotification saying which platform failed. Do not delete a video that is not posted everywhere.
- Never post the same slug twice: check state first.
- Send one PushNotification (proactive) only on failure.
