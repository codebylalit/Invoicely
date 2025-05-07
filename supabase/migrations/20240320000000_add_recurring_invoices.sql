-- Add recurring invoice support
ALTER TABLE invoices
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_frequency TEXT CHECK (recurrence_frequency IN ('weekly', 'monthly', 'custom')),
ADD COLUMN recurrence_interval INTEGER DEFAULT 1,
ADD COLUMN recurrence_start_date DATE,
ADD COLUMN recurrence_end_date DATE,
ADD COLUMN parent_invoice_id UUID REFERENCES invoices(id),
ADD COLUMN next_recurrence_date DATE;

-- Add index for recurring invoice queries
CREATE INDEX idx_recurring_invoices ON invoices (is_recurring, next_recurrence_date);

-- Add function to generate next recurrence date
CREATE OR REPLACE FUNCTION calculate_next_recurrence_date(
    p_frequency TEXT,
    p_interval INTEGER,
    p_current_date DATE
) RETURNS DATE AS $$
BEGIN
    CASE p_frequency
        WHEN 'weekly' THEN
            RETURN p_current_date + (p_interval * INTERVAL '1 week');
        WHEN 'monthly' THEN
            RETURN p_current_date + (p_interval * INTERVAL '1 month');
        WHEN 'custom' THEN
            RETURN p_current_date + (p_interval * INTERVAL '1 day');
        ELSE
            RETURN NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql; 