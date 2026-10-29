/**
 * buPlanningTemplates.js
 * Master Reference Templates for BU1 - BU5
 * Pre-populated data directly aligned with Google Sheets:
 * "FIT TOUR | MASTER Template Kế hoạch BU 2027 — Demo dữ liệu BU5"
 */

const BU_TEMPLATES = {
  BU5: {
    buId: 'BU5',
    title: 'Kế Hoạch & Dự Toán Sản Phẩm BU5 (Tây Á • Trung Á • Khám Phá Độc Bản)',
    ownerName: 'Lê Hoàng (BUM BU5)',
    mktBudgetQuota: 0.0100, // 1%
    notes: 'Kế hoạch sản phẩm & dòng tiền Marketing BU5 năm 2027 đồng bộ từ Master Template Google Sheet.',
    products: [
      {
        product_code: 'BU5-001',
        name: 'Ai Cập Huyền Bí & Du Thuyền Sông Nile',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 11 - Tháng 4',
        priority: 'Cao',
        stage: 'Khảo sát',
        person_in_charge: 'Lê Hoàng',
        target_pax_per_group: 10,
        price_per_pax: 104900000,
        variable_cost_per_pax: 89372535,
        fixed_cost_per_group: 0,
        strategy_notes: 'Duy trì nhiều đợt trong mùa mát; điểm tựa sản phẩm đường xa',
        color: '#d97706',
        icon: 'Sun'
      },
      {
        product_code: 'BU5-002',
        name: 'Ma Rốc - Sa Mạc Sahara & Thành Phố Xanh',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 11 - Tháng 4',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Minh Thảo',
        target_pax_per_group: 10,
        price_per_pax: 109000000,
        variable_cost_per_pax: 90175564,
        fixed_cost_per_group: 0,
        strategy_notes: 'Tập trung thời tiết đẹp và kỳ nghỉ Tết / 30-4',
        color: '#e11d48',
        icon: 'Compass'
      },
      {
        product_code: 'BU5-003',
        name: 'Mông Cổ - Thảo Nguyên Bất Tận & Lễ Hội Naadam',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 6 - Tháng 9',
        priority: 'Cao',
        stage: 'Đang phát triển',
        person_in_charge: 'Quang Khải',
        target_pax_per_group: 10,
        price_per_pax: 78900000,
        variable_cost_per_pax: 68900000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Tổng 6 đoàn volume lớn; phát triển tour glamping',
        color: '#059669',
        icon: 'Mountain'
      },
      {
        product_code: 'BU5-004',
        name: 'Pakistan - Thung Lũng Hoa Hunza & Mùa Thu Vàng',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 3-4 và Tháng 10',
        priority: 'Cao',
        stage: 'Đang phát triển',
        person_in_charge: 'Lê Hoàng',
        target_pax_per_group: 10,
        price_per_pax: 74900000,
        variable_cost_per_pax: 67000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Mùa hoa (T3-4) và Mùa thu (T10) là hai campaign độc lập',
        color: '#16a34a',
        icon: 'Trees'
      },
      {
        product_code: 'BU5-005',
        name: 'Nga - Săn Cực Quang Murmansk & Vòng Bắc Cực',
        group_type: 'Tuyến mùa vụ',
        season: 'Tháng 12 - Tháng 2',
        priority: 'Cao',
        stage: 'Đang phát triển',
        person_in_charge: 'Quang Khải',
        target_pax_per_group: 10,
        price_per_pax: 165000000,
        variable_cost_per_pax: 140000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Sản phẩm mùa đông cao cấp; gom 3 đoàn cao điểm Tết',
        color: '#0284c7',
        icon: 'Snowflake'
      },
      {
        product_code: 'BU5-006',
        name: 'Hồ Baikal - Mùa Đông Băng Tuyết Kỳ Vĩ',
        group_type: 'Tuyến mùa vụ',
        season: 'Tháng 1 - Tháng 3',
        priority: 'Trung bình',
        stage: 'Khảo sát',
        person_in_charge: 'Quang Khải',
        target_pax_per_group: 10,
        price_per_pax: 85000000,
        variable_cost_per_pax: 72000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Sản phẩm thử nghiệm mùa đông băng xanh',
        color: '#06b6d4',
        icon: 'Sparkles'
      },
      {
        product_code: 'BU5-007',
        name: 'Con Đường Tơ Lụa Trung Á 4 Nước',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 5 - Tháng 9',
        priority: 'Cao',
        stage: 'Đang phát triển',
        person_in_charge: 'Minh Thảo',
        target_pax_per_group: 10,
        price_per_pax: 89000000,
        variable_cost_per_pax: 79000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Uzbekistan, Kazakhstan, Kyrgyzstan, Tajikistan',
        color: '#8b5cf6',
        icon: 'Map'
      },
      {
        product_code: 'BU5-008',
        name: 'Tây Tạng - Miền Đất Linh Thiêng Huyền Bí',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 5 - Tháng 10',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Lê Hoàng',
        target_pax_per_group: 10,
        price_per_pax: 68000000,
        variable_cost_per_pax: 58000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Tâm linh văn hóa Lhasa - Shigatse - Everest Base Camp',
        color: '#f59e0b',
        icon: 'Flame'
      }
    ],
    departures: [
      { departure_code: 'BU5-DEP-001', product_code: 'BU5-001', month: 2, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '02/2027' },
      { departure_code: 'BU5-DEP-002', product_code: 'BU5-001', month: 4, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '04/2027' },
      { departure_code: 'BU5-DEP-003', product_code: 'BU5-002', month: 2, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '02/2027' },
      { departure_code: 'BU5-DEP-004', product_code: 'BU5-002', month: 3, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '03/2027' },
      { departure_code: 'BU5-DEP-005', product_code: 'BU5-002', month: 4, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '04/2027' },
      { departure_code: 'BU5-DEP-006', product_code: 'BU5-003', month: 6, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '06/2027' },
      { departure_code: 'BU5-DEP-007', product_code: 'BU5-003', month: 7, groups_count: 2, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '07/2027' },
      { departure_code: 'BU5-DEP-008', product_code: 'BU5-003', month: 8, groups_count: 2, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '08/2027' },
      { departure_code: 'BU5-DEP-009', product_code: 'BU5-003', month: 9, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '09/2027' },
      { departure_code: 'BU5-DEP-010', product_code: 'BU5-004', month: 3, groups_count: 2, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '03/2027' },
      { departure_code: 'BU5-DEP-011', product_code: 'BU5-004', month: 10, groups_count: 2, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '10/2027' },
      { departure_code: 'BU5-DEP-012', product_code: 'BU5-005', month: 2, groups_count: 3, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '02/2027' },
      { departure_code: 'BU5-DEP-013', product_code: 'BU5-006', month: 2, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '02/2027' },
      { departure_code: 'BU5-DEP-014', product_code: 'BU5-007', month: 6, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '06/2027' },
      { departure_code: 'BU5-DEP-015', product_code: 'BU5-007', month: 7, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '07/2027' },
      { departure_code: 'BU5-DEP-016', product_code: 'BU5-007', month: 8, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '08/2027' },
      { departure_code: 'BU5-DEP-017', product_code: 'BU5-007', month: 9, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '09/2027' },
      { departure_code: 'BU5-DEP-018', product_code: 'BU5-008', month: 5, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '05/2027' },
      { departure_code: 'BU5-DEP-019', product_code: 'BU5-008', month: 9, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '09/2027' },
      { departure_code: 'BU5-DEP-020', product_code: 'BU5-008', month: 10, groups_count: 1, pax_per_group: 10, sales_status: 'Đang bán', original_milestone: '10/2027' }
    ],
    tasks: [
      {
        task_code: 'BU5-M01',
        season_stage: '10-12/2026',
        related_products: 'Pakistan; Ai Cập; Maroc',
        category: 'Chuẩn bị sản phẩm / triển khai truyền thông sớm',
        deadline: '2026-11-15',
        completed_date: '2026-10-25',
        assignee: 'Lê Hoàng + Team MKT',
        status: 'Đã hoàn tất',
        obstacles_notes: 'Đã xong bộ brochure và ảnh teaser'
      },
      {
        task_code: 'BU5-M02',
        season_stage: '12/2026-02/2027',
        related_products: 'Ai Cập; Maroc',
        category: 'Chốt series vé máy bay Tết & Giữ chỗ landtour',
        deadline: '2026-12-10',
        completed_date: null,
        assignee: 'Minh Thảo + Đội Vé',
        status: 'Đang chạy',
        obstacles_notes: 'Đang chờ hãng Emirates phản hồi giá đoàn'
      },
      {
        task_code: 'BU5-M03',
        season_stage: '12/2026-02/2027',
        related_products: 'Nga; Baikal',
        category: 'Khảo sát visa đoàn & Booking xe trượt tuyết husky',
        deadline: '2026-10-20', // Intentional past deadline to test OVERDUE alert!
        completed_date: null,
        assignee: 'Quang Khải (Ops)',
        status: 'Chậm tiến độ',
        obstacles_notes: 'Thủ tục visa Nga thay đổi biểu mẫu mới'
      },
      {
        task_code: 'BU5-M04',
        season_stage: '03-04/2027',
        related_products: 'Maroc; Ai Cập; Pakistan',
        category: 'Chốt allotment vé mùa xuân và 30/4',
        deadline: '2027-01-15',
        completed_date: null,
        assignee: 'Lê Hoàng',
        status: 'Đang chạy',
        obstacles_notes: 'Chờ mở bán slot bay mùa hè'
      },
      {
        task_code: 'BU5-M05',
        season_stage: '06-09/2027',
        related_products: 'Mông Cổ',
        category: 'Ký hợp đồng độc quyền lều du mục cao cấp Gobi',
        deadline: '2027-03-01',
        completed_date: null,
        assignee: 'Quang Khải',
        status: 'Đang chạy',
        obstacles_notes: 'Đang đàm phán giảm 5% chi phí land'
      }
    ]
  },

  BU1: {
    buId: 'BU1',
    title: 'Kế Hoạch & Dự Toán Sản Phẩm BU1 (Thị Trường Trung Quốc)',
    ownerName: 'Trưởng BU1',
    mktBudgetQuota: 0.0109,
    notes: 'Kế hoạch sản phẩm 20 đoàn khởi hành Trung Quốc (Giang Nam, Bắc Kinh, Cáp Nhĩ Tân, Lệ Giang...).',
    products: [
      {
        product_code: 'BU1-001',
        name: 'Giang Nam Mỹ Cảnh (Thượng Hải - Hàng Châu - Tô Châu)',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 3 - Tháng 11',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Sale BU1',
        target_pax_per_group: 15,
        price_per_pax: 24900000,
        variable_cost_per_pax: 19800000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Tour volume chủ lực mùa hoa và mùa thu',
        color: '#dc2626',
        icon: 'Compass'
      },
      {
        product_code: 'BU1-002',
        name: 'Bắc Kinh - Vạn Lý Trường Thành Cổ Kính',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 4 - Tháng 11',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Sale BU1',
        target_pax_per_group: 14,
        price_per_pax: 28900000,
        variable_cost_per_pax: 22500000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Tuyến truyền thống, tệp khách trung niên',
        color: '#ef4444',
        icon: 'Building2'
      },
      {
        product_code: 'BU1-003',
        name: 'Cáp Nhĩ Tân - Lễ Hội Băng Đăng Xứ Tuyết',
        group_type: 'Tuyến mùa vụ',
        season: 'Tháng 12 - Tháng 2',
        priority: 'Cao',
        stage: 'Đang phát triển',
        person_in_charge: 'Sale BU1',
        target_pax_per_group: 16,
        price_per_pax: 35900000,
        variable_cost_per_pax: 27900000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Cao điểm mùa đông Giáng Sinh / Tết',
        color: '#0284c7',
        icon: 'Snowflake'
      }
    ],
    departures: [
      { departure_code: 'BU1-DEP-001', product_code: 'BU1-001', month: 3, groups_count: 2, pax_per_group: 15, sales_status: 'Đang bán', original_milestone: '03/2027' },
      { departure_code: 'BU1-DEP-002', product_code: 'BU1-001', month: 4, groups_count: 2, pax_per_group: 15, sales_status: 'Đang bán', original_milestone: '04/2027' },
      { departure_code: 'BU1-DEP-003', product_code: 'BU1-002', month: 5, groups_count: 1, pax_per_group: 14, sales_status: 'Đang bán', original_milestone: '05/2027' },
      { departure_code: 'BU1-DEP-004', product_code: 'BU1-003', month: 1, groups_count: 2, pax_per_group: 16, sales_status: 'Đang bán', original_milestone: '01/2027' }
    ],
    tasks: [
      {
        task_code: 'BU1-M01',
        season_stage: 'T11-T12/2026',
        related_products: 'Cáp Nhĩ Tân',
        category: 'Ký allotment vé máy bay đi Cáp Nhĩ Tân',
        deadline: '2026-11-20',
        completed_date: null,
        assignee: 'Trưởng BU1',
        status: 'Đang chạy',
        obstacles_notes: 'Giá vé cao mùa đỉnh điểm'
      }
    ]
  },

  BU2: {
    buId: 'BU2',
    title: 'Kế Hoạch BU2 (Nhật Bản • Đài Loan • Hàn Quốc)',
    ownerName: 'Trưởng BU2',
    mktBudgetQuota: 0.0075,
    notes: 'Tour liên minh và trọng tâm tuyến Hokkaido tuyết trắng.',
    products: [
      {
        product_code: 'BU2-001',
        name: 'Hokkaido Tuyết Trắng Mùa Đông',
        group_type: 'Tuyến mùa vụ',
        season: 'Tháng 12 - Tháng 2',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Sale BU2',
        target_pax_per_group: 20,
        price_per_pax: 52900000,
        variable_cost_per_pax: 42000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Trọng điểm lợi nhuận của BU2',
        color: '#0284c7',
        icon: 'Snowflake'
      },
      {
        product_code: 'BU2-002',
        name: 'Cung Đường Vàng Nhật Bản (Tokyo - Kyoto - Osaka)',
        group_type: 'Tuyến trụ cột',
        season: 'Quanh năm',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Sale BU2',
        target_pax_per_group: 25,
        price_per_pax: 38900000,
        variable_cost_per_pax: 32000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Tour liên minh volume đều đặn',
        color: '#ec4899',
        icon: 'Compass'
      }
    ],
    departures: [
      { departure_code: 'BU2-DEP-001', product_code: 'BU2-001', month: 1, groups_count: 2, pax_per_group: 20, sales_status: 'Đang bán', original_milestone: '01/2027' },
      { departure_code: 'BU2-DEP-002', product_code: 'BU2-002', month: 3, groups_count: 2, pax_per_group: 25, sales_status: 'Đang bán', original_milestone: '03/2027' }
    ],
    tasks: []
  },

  BU3: {
    buId: 'BU3',
    title: 'Kế Hoạch BU3 (B2B MICE • Doanh Nghiệp)',
    ownerName: 'Trưởng BU3',
    mktBudgetQuota: 0.0069,
    notes: 'Kế hoạch tour đoàn doanh nghiệp, Gala Dinner & Company Trip.',
    products: [
      {
        product_code: 'BU3-001',
        name: 'MICE Doanh Nghiệp Gala Dinner & Teambuilding',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 4 - Tháng 11',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Trưởng BU3',
        target_pax_per_group: 45,
        price_per_pax: 12000000,
        variable_cost_per_pax: 9500000,
        fixed_cost_per_group: 5000000,
        strategy_notes: 'Khách đoàn đông, doanh thu lớn',
        color: '#86198f',
        icon: 'Users'
      }
    ],
    departures: [
      { departure_code: 'BU3-DEP-001', product_code: 'BU3-001', month: 5, groups_count: 3, pax_per_group: 45, sales_status: 'Đang bán', original_milestone: '05/2027' }
    ],
    tasks: []
  },

  BU4: {
    buId: 'BU4',
    title: 'Kế Hoạch BU4 (Bhutan • Ladakh • Sri Lanka)',
    ownerName: 'Trưởng BU4',
    mktBudgetQuota: 0.0135,
    notes: 'Kế hoạch tuyến văn hóa tâm linh và khám phá Himalaya.',
    products: [
      {
        product_code: 'BU4-001',
        name: 'Bhutan - Vương Quốc Hạnh Phúc',
        group_type: 'Tuyến trụ cột',
        season: 'Tháng 3-5 và Tháng 9-11',
        priority: 'Cao',
        stage: 'Đang bán',
        person_in_charge: 'Trưởng BU4',
        target_pax_per_group: 12,
        price_per_pax: 65900000,
        variable_cost_per_pax: 55000000,
        fixed_cost_per_group: 0,
        strategy_notes: 'Sản phẩm signature phân khúc cao cấp',
        color: '#0284c7',
        icon: 'Mountain'
      }
    ],
    departures: [
      { departure_code: 'BU4-DEP-001', product_code: 'BU4-001', month: 4, groups_count: 2, pax_per_group: 12, sales_status: 'Đang bán', original_milestone: '04/2027' }
    ],
    tasks: []
  }
};

module.exports = {
  BU_TEMPLATES
};
