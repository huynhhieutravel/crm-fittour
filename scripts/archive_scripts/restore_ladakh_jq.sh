# Extract all view_file outputs containing LadakhConsultingPage.jsx and write them to a temp file
cat /Users/huynhtronghieu/.gemini/antigravity-ide/brain/5a863c3a-dd6c-4f8f-96f6-35ede55802e5/.system_generated/logs/transcript_full.jsonl | jq -r 'select(.type=="VIEW_FILE" and (.content | contains("LadakhConsultingPage.jsx"))) | .content' > scripts/ladakh_raw.txt
