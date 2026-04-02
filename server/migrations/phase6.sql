ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS facebook_psid VARCHAR(255) UNIQUE;
UPDATE leads SET customer_id = customers.id 
FROM customers 
WHERE leads.phone = customers.phone AND leads.phone IS NOT NULL AND leads.phone != '';
