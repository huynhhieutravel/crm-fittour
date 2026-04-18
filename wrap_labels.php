<?php
$files = [
    __DIR__ . '/../quan-ly-phong-kham/modules/medical/view_form.php',
    __DIR__ . '/../quan-ly-phong-kham/modules/medical/forms/print_dong_y.php',
];

$replacements = [
    'Họ tên' => '<?php echo __(\'Họ tên\'); ?>',
    'Năm sinh' => '<?php echo __(\'Năm sinh\'); ?>',
    'Nghề nghiệp' => '<?php echo __(\'Nghề nghiệp\'); ?>',
    'Huyết áp Tay Trái' => '<?php echo __(\'Huyết áp Tay Trái\'); ?>',
    'Huyết áp Tay Phải' => '<?php echo __(\'Huyết áp Tay Phải\'); ?>',
    'Chỉ số:' => '<?php echo __(\'Chỉ số:\'); ?>',
    'Nhịp tim:' => '<?php echo __(\'Nhịp tim:\'); ?>',
    'Lý do đến khám' => '<?php echo __(\'Lý do đến khám\'); ?>',
    'Thần sắc & Sắc mặt' => '<?php echo __(\'Thần sắc & Sắc mặt\'); ?>',
    'Thần:' => '<?php echo __(\'Thần:\'); ?>',
    'Sắc mặt:' => '<?php echo __(\'Sắc mặt:\'); ?>',
    'Vọng lưỡi' => '<?php echo __(\'Vọng lưỡi\'); ?>',
    'Chất lưỡi:' => '<?php echo __(\'Chất lưỡi:\'); ?>',
    'Hình dáng:' => '<?php echo __(\'Hình dáng:\'); ?>',
    'Đầu lưỡi:' => '<?php echo __(\'Đầu lưỡi:\'); ?>',
    'Rêu lưỡi:' => '<?php echo __(\'Rêu lưỡi:\'); ?>',
    'Mắt' => '<?php echo __(\'Mắt\'); ?>',
    'Mí mắt:' => '<?php echo __(\'Mí mắt:\'); ?>',
    'Niêm mạc môi' => '<?php echo __(\'Niêm mạc môi\'); ?>',
    'Tình trạng:' => '<?php echo __(\'Tình trạng:\'); ?>',
    'Tiếng nói / Hơi thở' => '<?php echo __(\'Tiếng nói / Hơi thở\'); ?>',
    'Mùi cơ thể' => '<?php echo __(\'Mùi cơ thể\'); ?>',
    'Tiền sử / Phụ khoa' => '<?php echo __(\'Tiền sử / Phụ khoa\'); ?>',
    'Giấc ngủ' => '<?php echo __(\'Giấc ngủ\'); ?>',
    'Tỉnh giấc:' => '<?php echo __(\'Tỉnh giấc:\'); ?>',
    'Thức dậy & Thói quen' => '<?php echo __(\'Thức dậy & Thói quen\'); ?>',
    'Trạng thái:' => '<?php echo __(\'Trạng thái:\'); ?>',
    'Môi trường & Tư thế' => '<?php echo __(\'Môi trường & Tư thế\'); ?>',
    'Tư thế:' => '<?php echo __(\'Tư thế:\'); ?>',
    'Môi trường:' => '<?php echo __(\'Môi trường:\'); ?>',
    'Tiêu hóa & Bài tiết' => '<?php echo __(\'Tiêu hóa & Bài tiết\'); ?>',
    'Ăn uống:' => '<?php echo __(\'Ăn uống:\'); ?>',
    'Đại tiện:' => '<?php echo __(\'Đại tiện:\'); ?>',
    'Số lần:' => '<?php echo __(\'Số lần:\'); ?>',
    'Màu tiểu tiện:' => '<?php echo __(\'Màu tiểu tiện:\'); ?>',
    'Tiểu đêm:' => '<?php echo __(\'Tiểu đêm:\'); ?>',
    'Kinh nguyệt (Phụ khoa)' => '<?php echo __(\'Kinh nguyệt (Phụ khoa)\'); ?>',
    'Chu kỳ:' => '<?php echo __(\'Chu kỳ:\'); ?>',
    'Đau bụng:' => '<?php echo __(\'Đau bụng:\'); ?>',
    'Màu:' => '<?php echo __(\'Màu:\'); ?>',
    'Huyết trắng:' => '<?php echo __(\'Huyết trắng:\'); ?>',
    'Cảm giác đối với bệnh lý' => '<?php echo __(\'Cảm giác đối với bệnh lý\'); ?>',
    'NHIỆT' => '<?php echo __(\'NHIỆT\'); ?>',
    'HÀN' => '<?php echo __(\'HÀN\'); ?>',
    'ĐỘ SÂU' => '<?php echo __(\'ĐỘ SÂU\'); ?>',
    'TỐC ĐỘ' => '<?php echo __(\'TỐC ĐỘ\'); ?>',
    'HÌNH DẠNG' => '<?php echo __(\'HÌNH DẠNG\'); ?>',
    'LỰC' => '<?php echo __(\'LỰC\'); ?>',
    'Mạch tượng' => '<?php echo __(\'Mạch tượng\'); ?>',
    'Xúc chẩn (Sờ nắn)' => '<?php echo __(\'Xúc chẩn (Sờ nắn)\'); ?>',
    'Cơ bắp & Nhiệt độ' => '<?php echo __(\'Cơ bắp & Nhiệt độ\'); ?>',
    'Cơ bắp:' => '<?php echo __(\'Cơ bắp:\'); ?>',
    'Thân nhiệt:' => '<?php echo __(\'Thân nhiệt:\'); ?>',
    'TỔNG KẾT NHANH (Bát cương)' => '<?php echo __(\'TỔNG KẾT NHANH (Bát cương)\'); ?>',
    'Ghi chú thêm:' => '<?php echo __(\'Ghi chú thêm:\'); ?>',
    'Chẩn đoán & Ghi chú lâm sàng' => '<?php echo __(\'Chẩn đoán & Ghi chú lâm sàng\'); ?>',
    'PHẦN I: THÔNG TIN CƠ BẢN & HUYẾT ÁP' => '<?php echo __(\'PHẦN I: THÔNG TIN CƠ BẢN & HUYẾT ÁP\'); ?>',
    'PHẦN II: VỌNG CHẨN (Nhìn)' => '<?php echo __(\'PHẦN II: VỌNG CHẨN (Nhìn)\'); ?>',
    'PHẦN III: VĂN CHẨN (Nghe & Ngửi)' => '<?php echo __(\'PHẦN III: VĂN CHẨN (Nghe & Ngửi)\'); ?>',
    'PHẦN IV: VẤN CHẨN (Hỏi)' => '<?php echo __(\'PHẦN IV: VẤN CHẨN (Hỏi)\'); ?>',
    'PHẦN V: THIẾT CHẨN (Bắt mạch & Sờ nắn)' => '<?php echo __(\'PHẦN V: THIẾT CHẨN (Bắt mạch & Sờ nắn)\'); ?>',
    'I. THÔNG TIN CƠ BẢN & HUYẾT ÁP' => '<?php echo __(\'I. THÔNG TIN CƠ BẢN & HUYẾT ÁP\'); ?>',
    'II. VỌNG CHẨN (Nhìn)' => '<?php echo __(\'II. VỌNG CHẨN (Nhìn)\'); ?>',
    'III. VĂN CHẨN (Nghe & Ngửi)' => '<?php echo __(\'III. VĂN CHẨN (Nghe & Ngửi)\'); ?>',
    'IV. VẤN CHẨN (Hỏi)' => '<?php echo __(\'IV. VẤN CHẨN (Hỏi)\'); ?>',
    'V. THIẾT CHẨN (Bắt mạch & Sờ nắn)' => '<?php echo __(\'V. THIẾT CHẨN (Bắt mạch & Sờ nắn)\'); ?>',
    'VI. Chẩn đoán & Điều trị' => '<?php echo __(\'VI. Chẩn đoán & Điều trị\'); ?>',
    'Chẩn đoán Bát cương:' => '<?php echo __(\'Chẩn đoán Bát cương:\'); ?>',
];

foreach ($files as $file) {
    if (!file_exists($file)) continue;
    $content = file_get_contents($file);
    foreach ($replacements as $search => $replace) {
        $content = str_replace(">".$search."<", ">".$replace."<", $content);
        $content = str_replace(">".$search."\n", ">".$replace."\n", $content);
    }
    file_put_contents($file, $content);
    echo "Processed labels in $file\n";
}
