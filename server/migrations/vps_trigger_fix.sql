CREATE OR REPLACE FUNCTION public.update_leave_used_days()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'approved' AND NEW.leave_type = 'annual' THEN
            UPDATE leave_balances
            SET used_days = used_days + NEW.total_days
            WHERE user_id = NEW.user_id AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Nếu chuyển sang approved (từ trạng thái khác)
        IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.leave_type = 'annual' THEN
            UPDATE leave_balances
            SET used_days = used_days + NEW.total_days
            WHERE user_id = NEW.user_id AND year = EXTRACT(YEAR FROM NEW.start_date);
        
        -- Nếu hủy approved (ví dụ bị reject sau khi đã approve)
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' AND OLD.leave_type = 'annual' THEN
            UPDATE leave_balances
            SET used_days = GREATEST(used_days - OLD.total_days, 0)
            WHERE user_id = OLD.user_id AND year = EXTRACT(YEAR FROM OLD.start_date);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'approved' AND OLD.leave_type = 'annual' THEN
            UPDATE leave_balances
            SET used_days = GREATEST(used_days - OLD.total_days, 0)
            WHERE user_id = OLD.user_id AND year = EXTRACT(YEAR FROM OLD.start_date);
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_update_leave_balance ON leave_requests;
CREATE TRIGGER trigger_update_leave_balance
AFTER INSERT OR UPDATE OR DELETE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_leave_used_days();
