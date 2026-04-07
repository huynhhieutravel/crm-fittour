DO $$ 
DECLARE
    guide1_id integer;
    guide2_id integer;
    guide3_id integer;
    tour_id integer;
BEGIN
    -- Thêm 3 HDV
    INSERT INTO guides (name, phone, email, specialties, status, experience, bio) 
    VALUES ('Trần Văn Bình', '0901234567', 'binh.hdd@fittour.com', 'Tiếng Anh', 'Available', 5, 'Chuyên gia đi tour khu vực Đông Nam Á')
    RETURNING id INTO guide1_id;

    INSERT INTO guides (name, phone, email, specialties, status, experience, bio) 
    VALUES ('Lê Thị Lan', '0987654321', 'lan.le@fittour.com', 'Tiếng Nhật', 'Available', 3, 'Am hiểu văn hóa Nhật Bản - Hàn Quốc')
    RETURNING id INTO guide2_id;

    INSERT INTO guides (name, phone, email, specialties, status, experience, bio) 
    VALUES ('Nguyễn Hữu Dũng', '0912345678', 'dung.nguyen@fittour.com', 'Tiếng Anh, Trung', 'Available', 4, 'Chuyên đi tuyến Châu Âu và Trung Quốc')
    RETURNING id INTO guide3_id;

    -- Lấy 1 tour mẫu để gán khởi hành
    SELECT id INTO tour_id FROM tour_templates LIMIT 1;

    IF tour_id IS NULL THEN
        INSERT INTO tour_templates (code, name, destination, duration_days, duration_nights) 
        VALUES ('TOUR-MOCK', 'Khám phá Nhật Bản (Mock)', 'Nhật Bản', 5, 4)
        RETURNING id INTO tour_id;
    END IF;

    -- Lịch 1: Tháng 4
    INSERT INTO tour_departures (tour_template_id, code, start_date, end_date, guide_id, status)
    VALUES (tour_id, 'DEP-APR-' || trunc(random()*1000)::text, '2026-04-10', '2026-04-15', guide1_id, 'Published');

    -- Lịch 2: Tháng 5
    INSERT INTO tour_departures (tour_template_id, code, start_date, end_date, guide_id, status)
    VALUES (tour_id, 'DEP-MAY-' || trunc(random()*1000)::text, '2026-05-15', '2026-05-20', guide2_id, 'Published');

    -- Lịch 3: Tháng 6
    INSERT INTO tour_departures (tour_template_id, code, start_date, end_date, guide_id, status)
    VALUES (tour_id, 'DEP-JUN-' || trunc(random()*1000)::text, '2026-06-20', '2026-06-25', guide3_id, 'Published');

END $$;
