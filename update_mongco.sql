BEGIN;

UPDATE leads l
SET bu_group = 'BU5'
WHERE (bu_group IS NULL OR bu_group != 'BU5')
AND (
    name ILIKE '%mông cổ%' OR name ILIKE '%mong co%'
    OR consultation_note ILIKE '%mông cổ%' OR consultation_note ILIKE '%mong co%'
    OR EXISTS (
        SELECT 1 
        FROM conversations c 
        JOIN messages m ON c.id = m.conversation_id 
        WHERE c.lead_id = l.id 
        AND (m.content ILIKE '%mông cổ%' OR m.content ILIKE '%mong co%')
    )
);

COMMIT;
