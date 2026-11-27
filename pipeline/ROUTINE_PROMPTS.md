# Routines to create in the claude.ai Routines UI (a scheduled session started from the API has no connectors and no repo write access)

For EVERY routine below set:
- Connectors: Windsor.ai for Social Media, Metricool Social Media Management, Zapier, Gmail
- Repositories (sources): pmyashsagar/TempFiles (allow pushes) and lemomo-ai/lemo-opuscar (read)
- Network: allow github.com, raw.githubusercontent.com, fonts.googleapis.com, fonts.gstatic.com, pypi.org, files.pythonhosted.org, itsmynotebook.com, huggingface.co (optional)
- Time zone Asia/Kolkata

## 1) Creator, daily 03:00 IST
Prompt:
"Follow pipeline/RUNBOOK_CREATE.md in the TempFiles repository exactly. Create and stage today's two videos. Do not post anything."

## 2) Publisher AM, daily 07:45 IST
Prompt:
"Follow pipeline/RUNBOOK_PUBLISH.md in the TempFiles repository exactly. Publish the staged video with slot am to Instagram (Windsor), YouTube (Metricool, Zapier fallback) and Facebook (Zapier), then delete its branch and update state."

## 3) Publisher PM, daily 19:45 IST
Prompt:
"Follow pipeline/RUNBOOK_PUBLISH.md in the TempFiles repository exactly. Publish the staged video with slot pm to Instagram (Windsor), YouTube (Metricool, Zapier fallback) and Facebook (Zapier), then delete its branch and update state."
