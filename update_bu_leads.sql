BEGIN;

UPDATE leads l
SET bu_group = 'BU1'
WHERE bu_group = 'BU4'
AND (
    name ILIKE '%tây tạng%' OR name ILIKE '%tay tang%' OR name ILIKE '%thanh tạng%' OR name ILIKE '%thanh tang%' OR name ILIKE '%thanh hải%' OR name ILIKE '%thanh hai%'
    OR consultation_note ILIKE '%tây tạng%' OR consultation_note ILIKE '%tay tang%' OR consultation_note ILIKE '%thanh tạng%' OR consultation_note ILIKE '%thanh tang%' OR consultation_note ILIKE '%thanh hải%' OR consultation_note ILIKE '%thanh hai%'
    OR EXISTS (
        SELECT 1 
        FROM conversations c 
        JOIN messages m ON c.id = m.conversation_id 
        WHERE c.lead_id = l.id 
        AND (m.content ILIKE '%tây tạng%' OR m.content ILIKE '%tay tang%' OR m.content ILIKE '%thanh tạng%' OR m.content ILIKE '%thanh tang%' OR m.content ILIKE '%thanh hải%' OR m.content ILIKE '%thanh hai%')
    )
);

-- Remove from BU4 keywords
UPDATE business_units 
SET keywords = array_remove(array_remove(keywords, 'tay tang'), 'tây tạng')
WHERE id = 'BU4';

-- Add to BU1 keywords if not exists
UPDATE business_units 
SET keywords = ARRAY(
    SELECT DISTINCT unnest(array_append(array_append(array_append(array_append(array_append(array_append(keywords, 'tay tang'), 'tây tạng'), 'thanh tang'), 'thanh tạng'), 'thanh hai'), 'thanh hải'))
)
WHERE id = 'BU1';

COMMIT;
