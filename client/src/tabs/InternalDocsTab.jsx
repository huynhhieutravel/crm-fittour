import React from 'react';

const InternalDocsTab = () => {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#1e293b' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                    QUY CHẾ LƯƠNG ĐỐI VỚI HƯỚNG DẪN VIÊN
                </h1>
                <p style={{ color: '#64748b' }}>Ban hành và áp dụng hệ thống CRM nội bộ</p>
            </div>

            {/* Content Section I */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                    I. LƯƠNG CƠ BẢN
                </h2>
                <p style={{ marginBottom: '16px', fontWeight: '500' }}>
                    Được tính theo hiệu quả hoàn thành công việc như sau:
                </p>

                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '20px' }}>1. Công tác phí</h3>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                                <th style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'left', width: '25%' }}>Tuyến</th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'left', width: '50%' }}>Quốc Gia</th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right', width: '25%' }}>Công tác phí/ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Himalaya */}
                            <tr>
                                <td rowSpan="4" style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Himalaya</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Nepal hoặc Bhutan/ Tây Tạng</td>
                                <td rowSpan="3" style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>
                                    Tour đầu: 1.000.000 đ<br/>
                                    tour thứ 2: 1.500.000 đ
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Liên tuyến: Nepal + Bhutan</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Ấn Độ (Ladakh, Sikkim)</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Pakistan</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>2.100.000 đ</td>
                            </tr>

                            {/* Silk Road */}
                            <tr>
                                <td rowSpan="5" style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Silk Road<br/>(Con đường tơ lụa)</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Iran/ Uzebekistan/ Kazashtan</td>
                                <td rowSpan="4" style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>
                                    2.500.000 đ
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Georgia/ Azebaijan</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Liên tuyến: Georgia + Azebaijan</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Liên tuyến: Thổ Nhĩ Kỳ ...</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Mông Cổ</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.500.000 đ</td>
                            </tr>

                            {/* Trung Quốc Group 1 */}
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>
                                    Giang Nam<br/>
                                    Thượng Hải - Bắc Kinh<br/>
                                    Lệ Giang – Vân Nam
                                </td>
                                <td rowSpan="4" style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Trung Quốc</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.000.000 đ</td>
                            </tr>
                            {/* Trung Quốc Group 2 */}
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>
                                    Tân Cương<br/>
                                    Cáp Nhĩ Tân<br/>
                                    Cửu trại câu (Thành Đô)<br/>
                                    Tây An<br/>
                                    Sơn Tây
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.200.000 đ</td>
                            </tr>
                            {/* Trung Quốc Group 3 */}
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Sơn Tây (đoàn &lt;10pax)</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.500.000 đ</td>
                            </tr>
                            {/* Trung Quốc Group 4 */}
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Đạo Thành Á Đinh</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.500.000 đ</td>
                            </tr>

                            {/* Tây Tạng */}
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Tây Tạng</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}></td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.500.000 đ</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Tây Tạng - Kailash</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}></td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.800.000 đ</td>
                            </tr>

                            {/* Đông Nam Á */}
                            <tr>
                                <td rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Đông Nam Á</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Thái Lan/ Cambodia</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>600.000 đ</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Malaysia/ Singapore/ Lào/ Myanmar/<br/>Indonesia/ Philipines</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>
                                    local tiếng Anh 1.000.000 đ<br/>
                                    local tiếng Việt 600.000 đ
                                </td>
                            </tr>

                            {/* Đông Bắc Á */}
                            <tr>
                                <td rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Đông Bắc Á</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Nhật Bản</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.000.000 đ</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Hàn Quốc/ Đài Loan/ Hongkong</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>800.000 đ</td>
                            </tr>

                            {/* Trung Đông */}
                            <tr>
                                <td rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Trung Đông</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Ai Cập/ Israel/ Jordan/ Maroc</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>2.100.000 đ</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Liên tuyến 4 nước: Ai Cập+ Israel+<br/>Jordan+Palestine</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>2.500.000 đ</td>
                            </tr>

                            {/* Các tuyến khác */}
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Châu Âu - Mỹ - Úc</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Châu Âu - Mỹ - Úc - New Zealand</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>2.500.000 đ</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Việt Nam</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Kèm phụ phí (nếu có)</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>700.000đ</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>Inbound</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}></td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>1.000.000đ</td>
                            </tr>
                            <tr>
                                <td rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '12px', fontWeight: 'bold' }}>MC</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Show từ 30 khách (01 xe)</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>2.500.000đ</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px' }}>Show từ 60 khách (02 xe)</td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>3.500.000đ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Lưu ý:</p>
                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
                        <li>Lương sẽ tính sau khi hướng dẫn viên đi tour về và bàn giao đầy đủ theo yêu cầu của cty</li>
                        <li>Nhân viên thuộc đội ngũ nội bộ Fit Tour dẫn tour (Tour Leader) sẽ được nhận lương như sau:
                            <ul style={{ paddingLeft: '20px', listStyleType: 'circle', marginTop: '4px' }}>
                                <li>Ngày nghỉ cuối tuần, Lễ: <strong>hưởng 100% lương</strong> Công tác phí (CTP)</li>
                                <li>Ngày làm việc trong tuần: <strong>hưởng 50% lương</strong> Công tác phí (CTP), đồng thời không tính lương cơ bản</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                {/* Seeding Section */}
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                    2. Chiến Dịch Hỗ Trợ Seeding Trên 2 Nền Tảng: Facebook Và Google
                </h3>
                <p style={{ marginBottom: '12px' }}>
                    Khách hàng đi Tour của FIT review 5* / đề xuất thẳng trên Google/Fanpage của FIT Tour - Du lịch có GUU
                </p>
                <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px' }}>Chế độ khích lệ (tối đa 1,500,000 VND tiền thưởng/chuyến)</p>
                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
                        <li>1 review 5* + 05 hình chuyến đi: <strong>100,000đ / REVIEW</strong> hiển thị</li>
                        <li>1 review 5* + 10 hình chuyến đi: <strong>150,000đ / REVIEW</strong> hiển thị</li>
                    </ul>
                </div>
            </div>

            {/* Section II */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                    II. CHẾ ĐỘ KỶ LUẬT
                </h2>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
                    <li><span style={{ fontWeight: '600' }}>1.</span> Không tuân thủ theo nội quy, quy định làm việc thì cty sẽ chấm dứt Hợp đồng cộng tác.</li>
                </ul>
            </div>

            {/* Section IV */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                    IV. TRÁCH NHIỆM VÀ QUYỀN LỢI
                </h2>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6', listStyleType: 'none', marginLeft: '-20px' }}>
                    <li style={{ marginBottom: '8px' }}><span style={{ fontWeight: '600' }}>1.</span> HDV có trách nhiệm hoàn thành quyết toán, bàn giao trong vòng 3 ngày kể từ ngày tour hoàn thành.</li>
                    <li style={{ marginBottom: '8px' }}><span style={{ fontWeight: '600' }}>2.</span> Chế độ lương trên chưa bao gồm một số thưởng khác chạy theo từng thời điểm như TIP, các khoản hỗ trợ... độc lập với chính sách lương của quy chế này.</li>
                    <li style={{ marginBottom: '8px' }}><span style={{ fontWeight: '600' }}>3.</span> Trường hợp HDV hủy đột xuất thì chịu trách nhiệm bồi thường 100% như thỏa thuận, thiệt hại phát sinh cho Cty.</li>
                </ul>
            </div>

            {/* Footer Notice */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.6' }}>
                        Quy chế này có hiệu lực kể từ ngày <strong>01/01/2026</strong> cho đến khi có quyết định<br/> 
                        khác thay thế, và được thông báo toàn thể nhân viên công ty<br/>
                        và Hướng dẫn viên cộng tác cùng Fit Tour.
                    </p>
                    <div>
                        <p style={{ textDecoration: 'underline', fontStyle: 'italic', marginBottom: '4px' }}>Nơi nhận:</p>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#475569' }}>
                            <li>- Ban Giám Đốc</li>
                            <li>- Phòng KD, KT</li>
                            <li>- Lưu Vp</li>
                        </ul>
                    </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '200px' }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '60px' }}>GIÁM ĐỐC</h4>
                    <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>(Đã ký & ban hành)</p>
                </div>
            </div>
        </div>
    );
};

export default InternalDocsTab;
