import { swalConfirm } from '../utils/swalHelpers';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, FileText, Mail, CheckCircle, Smartphone, RotateCcw } from 'lucide-react';

export default function ServiceContractViewer() {
    const { tourId, bookingId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/public/contracts/${tourId}/${bookingId}`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [tourId, bookingId]);

    const handleDownloadWord = () => {
        window.location.href = `/api/public/contracts/${tourId}/${bookingId}/export-docx`;
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải hợp đồng...</div>;
    if (!data) return <div style={{ padding: '50px', textAlign: 'center' }}>Không tìm thấy hợp đồng!</div>;

    const { tour, booking } = data;
    const members = booking.raw_details?.members || [];
    const reservationCode = booking.reservation_code || `TOURFIT-${tourId}-${bookingId}`;
    const totalAmount = Number(booking.total || 0);
    const paidAmount = Number(booking.paid || 0);
    const restAmount = totalAmount - paidAmount;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, sans-serif' }}>
            
            {/* The A4 Page Area */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }} className="print-area">
                
                {/* Print Styles injected in a style tag */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; background: white; }
                        .no-print { display: none !important; }
                        @page { margin: 15mm; }
                    }
                    [contenteditable="true"] { outline: none; transition: background 0.2s; }
                    [contenteditable="true"]:hover { background: #fef08a; cursor: text; }
                `}</style>
                
                <div 
                    contentEditable 
                    suppressContentEditableWarning
                    style={{ 
                    backgroundColor: 'white', 
                    width: '100%', 
                    maxWidth: '850px', 
                    margin: '0 auto', 
                    padding: '60px 50px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    lineHeight: '1.6',
                    color: '#000',
                    fontSize: '14px'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '16px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                        <h3 style={{ fontSize: '14px', margin: 0, fontWeight: 'normal' }}>Độc lập - Tự do - Hạnh phúc</h3>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '18px', margin: '0 0 5px 0' }}>HỢP ĐỒNG DU LỊCH LỮ HÀNH</h2>
                        <h3 style={{ fontSize: '14px', margin: '0 0 5px 0', fontWeight: 'normal', fontStyle: 'italic' }}>CUNG CẤP DỊCH VỤ DU LỊCH</h3>
                        <p style={{ margin: 0 }}>Mã đơn (Order code) : <strong contentEditable suppressContentEditableWarning>{reservationCode}</strong></p>
                        <h3 style={{ fontSize: '16px', margin: '10px 0 0 0', textTransform: 'uppercase' }} contentEditable suppressContentEditableWarning>{tour.tour_name}</h3>
                    </div>

                    <p style={{ fontWeight: 'bold' }}>Căn cứ:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '20px', textAlign: 'justify' }}>
                        <li>Luật Thương Mại nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam số 36/2005/QH11 được Quốc hội thông qua ngày 14 tháng 06 năm 2005 và có hiệu lực ngày 01 tháng 01 năm 2006</li>
                        <li>Luật Dân Sự nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam số 91/2015/QH13 được Quốc hội ban hành ngày 24 tháng 11 năm 2015</li>
                        <li>Căn cứ Luật Du lịch số 09/2017/QH14 của Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam ban hành ngày 19/06/2017;</li>
                        <li>Nhu cầu của Quý khách hàng (BÊN B) và khả năng của CÔNG TY TNHH DU LỊCH QUỐC TẾ FIT TOUR (BÊN A)</li>
                    </ul>

                    <p>Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}, chúng tôi đại diện 2 bên gồm có:</p>
                    
                    <p style={{ fontWeight: 'bold' }}>BÊN A: CÔNG TY TNHH DU LỊCH QUỐC TẾ FIT TOUR</p>
                    <table style={{ width: '100%', marginBottom: '20px', borderSpacing: '0 8px' }}>
                        <tbody>
                            <tr><td style={{ width: '150px' }}>Địa chỉ:</td><td>19 Lương Hữu Khánh, Phường Bến Thành, Tp. Hồ Chí Minh, Việt Nam</td></tr>
                            <tr><td>Chi nhánh:</td><td></td></tr>
                            <tr><td>Điện thoại:</td><td>0836999909</td></tr>
                            <tr><td>Mã số thuế:</td><td>0316127669</td></tr>
                            <tr><td>Số giấy phép:</td><td></td></tr>
                            <tr><td>Đại diện:</td><td>NGUYỄN NHẤT VŨ</td></tr>
                            <tr><td>Chức vụ:</td><td>Giám Đốc</td></tr>
                            <tr><td>Số tài khoản:</td><td></td></tr>
                        </tbody>
                    </table>

                    <p style={{ fontWeight: 'bold' }}>BÊN B: <span contentEditable suppressContentEditableWarning>{booking.name}</span></p>
                    <table style={{ width: '100%', marginBottom: '20px', borderSpacing: '0 8px' }}>
                        <tbody>
                            <tr><td style={{ width: '150px' }}>Địa chỉ:</td><td contentEditable suppressContentEditableWarning>Việt Nam</td></tr>
                            <tr><td>Điện thoại:</td><td contentEditable suppressContentEditableWarning>{booking.phone}</td></tr>
                            <tr><td>Ngày sinh:</td><td contentEditable suppressContentEditableWarning>{members[0]?.dob || '...'}</td></tr>
                            <tr><td>CCCD/Số hộ chiếu:</td><td contentEditable suppressContentEditableWarning>{members[0]?.identity || '...'}</td></tr>
                            <tr><td>Ngày cấp:</td><td contentEditable suppressContentEditableWarning>...</td></tr>
                        </tbody>
                    </table>

                    <p>Hai bên cùng thoả thuận kí kết hợp đồng để thực hiện cung cấp dịch vụ Du Lịch theo các điều khoản như sau:</p>

                    <h4 style={{ fontSize: '16px', margin: '20px 0 10px 0' }}>ĐIỀU 1: NỘI DUNG HỢP ĐỒNG:</h4>
                    <p>Bên B đồng ý giao, bên A đồng ý nhận thực hiện tổ chức cung cấp dịch vụ du lịch theo nội dung sau và chương trình du lịch mô tả các dịch vụ được cung cấp đính kèm là một phần không thể thiếu của Hợp đồng này.</p>
                    <table style={{ width: '100%', marginBottom: '20px', borderSpacing: '0 8px' }}>
                        <tbody>
                            <tr><td style={{ width: '150px' }}>Tên dịch vụ:</td><td contentEditable suppressContentEditableWarning style={{ textTransform: 'uppercase' }}>{tour.tour_name}</td></tr>
                            <tr><td>Mã:</td><td contentEditable suppressContentEditableWarning>{tour.tour_code}</td></tr>
                            <tr><td>Ngày khởi hành:</td><td contentEditable suppressContentEditableWarning>{tour.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : ''}</td></tr>
                            <tr><td>Ngày kết thúc:</td><td contentEditable suppressContentEditableWarning>{tour.end_date ? new Date(tour.end_date).toLocaleDateString('vi-VN') : ''}</td></tr>
                            <tr><td>Nhân viên phụ trách:</td><td contentEditable suppressContentEditableWarning>{tour.tour_info?.operators || '...'}</td></tr>
                            <tr><td>Điện thoại (Sale):</td><td contentEditable suppressContentEditableWarning>...</td></tr>
                        </tbody>
                    </table>

                    <h4 style={{ fontSize: '16px', margin: '20px 0 10px 0' }}>ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG THEO SỐ LƯỢNG KHÁCH HÀNG/ DỊCH VỤ</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                        <thead style={{ background: '#1e40af', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>STT<br/><i>(No.)</i></th>
                                <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Dịch vụ<br/><i>(Service)</i></th>
                                <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Số lượng<br/><i>(Q'ty)</i></th>
                                <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Đơn giá<br/><i>(Price)</i></th>
                                <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Giảm giá<br/><i>(Discount)</i></th>
                                <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Thành tiền<br/><i>(Amount)</i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {booking.raw_details?.pricingRows?.filter(r => Number(r.qty) > 0).map((row, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{idx + 1}</td>
                                        <td style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'left', fontWeight: 'bold' }}>Tour trọn gói ({row.ageType})</td>
                                        <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{row.qty}</td>
                                        <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{Number(row.price).toLocaleString('vi-VN')}</td>
                                        <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{Number(row.discount).toLocaleString('vi-VN')}</td>
                                        <td style={{ padding: '10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }} contentEditable suppressContentEditableWarning>{Number(row.total || 0).toLocaleString('vi-VN')}</td>
                                    </tr>
                                    {row.extraServices && row.extraServices.length > 0 && row.extraServices.map((svc, sIdx) => (
                                        <tr key={`svc-${idx}-${sIdx}`} style={{ fontStyle: 'italic', color: '#475569' }}>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderTop: 'none' }}></td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px' }}>↳ Phụ thu dịch vụ: {svc.name}</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontSize: '13px' }} contentEditable suppressContentEditableWarning>{svc.qty}</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontSize: '13px' }} contentEditable suppressContentEditableWarning>{Number(svc.price).toLocaleString('vi-VN')}</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontSize: '13px' }} contentEditable suppressContentEditableWarning>0</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '13px' }} contentEditable suppressContentEditableWarning>{Number(svc.total).toLocaleString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                    {row.surcharge > 0 && (
                                        <tr style={{ fontStyle: 'italic', color: '#475569' }}>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderTop: 'none' }}></td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px' }}>↳ Tiền phụ thu (Surcharge)</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontSize: '13px' }} contentEditable suppressContentEditableWarning>1</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontSize: '13px' }} contentEditable suppressContentEditableWarning>{Number(row.surcharge).toLocaleString('vi-VN')}</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontSize: '13px' }} contentEditable suppressContentEditableWarning>0</td>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '13px' }} contentEditable suppressContentEditableWarning>{Number(row.surcharge).toLocaleString('vi-VN')}</td>
                                        </tr>
                                    )}
                                    {row.customerNote && row.customerNote.trim() !== '' && (
                                        <tr style={{ background: '#f8fafc' }}>
                                            <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}></td>
                                            <td colSpan="5" style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '12px', color: '#334155' }}>
                                                <strong>Ghi chú:</strong> {row.customerNote}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            
                            {/* Fallback in case there is no pricingRows */}
                            {(!booking.raw_details?.pricingRows || booking.raw_details.pricingRows.filter(r => Number(r.qty) > 0).length === 0) && (
                                <tr>
                                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>1</td>
                                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'left', fontWeight: 'bold' }}>Tour trọn gói</td>
                                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{booking.qty || 1}</td>
                                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{totalAmount.toLocaleString('vi-VN')}</td>
                                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>0</td>
                                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }} contentEditable suppressContentEditableWarning>{totalAmount.toLocaleString('vi-VN')}</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Tổng thành tiền:</td>
                                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{totalAmount.toLocaleString('vi-VN')}</td>
                            </tr>
                            <tr style={{ background: '#ffffff', fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Đã thanh toán:</td>
                                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{paidAmount.toLocaleString('vi-VN')}</td>
                            </tr>
                            <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Còn lại:</td>
                                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{restAmount.toLocaleString('vi-VN')}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <h4 style={{ fontSize: '16px', margin: '20px 0 10px 0' }}>Thanh toán <i style={{ fontWeight: 'normal' }}>(Deposited)</i></h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'center', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <thead style={{ background: '#1e40af', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>STT<br/><i>(No.)</i></th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Mã phiếu thu<br/><i>(Voucher code)</i></th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Ngày thanh toán<br/><i>(Date of payment)</i></th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Hình thức thanh toán<br/><i>(Payment methods)</i></th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Số tiền<br/><i>(Amount)</i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.vouchers || []).map((v, idx) => (
                                <tr key={v.id}>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{idx + 1}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }} contentEditable suppressContentEditableWarning>{v.voucher_code}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{new Date(v.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }} contentEditable suppressContentEditableWarning>{v.payment_method}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }} contentEditable suppressContentEditableWarning>{Number(v.amount).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                            {(!data.vouchers || data.vouchers.length === 0) && (
                                <tr><td colSpan="5" style={{ padding: '15px' }}>Chưa có thanh toán</td></tr>
                            )}
                        </tbody>
                    </table>

                    <h4 style={{ fontSize: '16px', margin: '20px 0 10px 0' }}>DANH SÁCH THÀNH VIÊN <i style={{ fontWeight: 'normal' }}>(Members list)</i></h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', textAlign: 'center', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <thead style={{ background: '#1e40af', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>STT</th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Họ tên</th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Email</th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Ngày sinh</th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Giới tính</th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Số điện thoại</th>
                                <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>CCCD/Passport</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{idx + 1}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase', textAlign: 'left' }} contentEditable suppressContentEditableWarning>{m.name}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{m.email || ''}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{m.dob}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{m.gender}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{m.phone}</td>
                                    <td style={{ padding: '8px', border: '1px solid #e2e8f0' }} contentEditable suppressContentEditableWarning>{m.docId || m.identity}</td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr><td colSpan="7" style={{ padding: '15px' }}>Chưa có danh sách</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* --- CÁC ĐIỀU KHOẢN PHÁP LÝ --- */}
                    <h4 style={{ fontSize: '16px', margin: '20px 0 10px 0' }}>ĐIỀU 3: PHƯƠNG THỨC THANH TOÁN</h4>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>3.1 Lịch trình thanh toán:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                        <li>Lần 1: Ngay sau khi kí hợp đồng, bên B thanh toán cho Bên A 50% tổng giá trị tour.</li>
                        <li>Lần 2: Bên B thanh toán phần còn lại trong vòng 07 ngày trước ngày khởi hành.</li>
                        <li>Chi phí thực tế khi thanh toán sẽ bao gồm Tổng chi phí và Chi phí dịch vụ phát sinh (nếu có).</li>
                        <li>Phương thức thanh toán: Chuyển khoản hoặc Tiền mặt.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>3.2 Tài khoản bên A:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                        <li>Tài khoản tại: Ngân hàng Thương mại Cổ phần Á Châu (ACB).</li>
                        <li>Tên tài khoản: NGUYỄN NHẤT VŨ</li>
                        <li>Số tài khoản: 999912368</li>
                        <li>Chi nhánh: Chi nhánh Tân Bình.</li>
                    </ul>

                    <h4 style={{ fontSize: '16px', margin: '30px 0 10px 0' }}>ĐIỀU 4: TRÁCH NHIỆM CÁC BÊN</h4>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>4.1 Trách nhiệm bên A:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Thực hiện các dịch vụ: vận chuyển, ăn, nghỉ, phí tham quan theo chương trình, và tổ chức thực hiện chương trình đúng chất lượng, chương trình đã được hai bên thống nhất.</li>
                        <li>Trong trường hợp Bên A thay đổi chương trình (ăn, ở, các điểm tham quan..) phải tham khảo, được sự đồng ý và xác nhận của Trưởng Đoàn của Bên B.</li>
                        <li>Trong trường hợp có những vấn đề trục trặc lớn trong thời gian tham quan, bên A có trách nhiệm thông báo ngay cho Trưởng Đoàn của Bên B để cùng nhau giải quyết.</li>
                        <li>Nếu trong thời gian diễn ra chương trình tour, mà bên A bỏ khách giữa chuyến đi thì bên A phải bồi thường toàn bộ thiệt hại cho bên B những phát sinh nếu có.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>4.2 Trách nhiệm bên B:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Thanh toán đủ các khoản phí chương trình theo từng giai đoạn cụ thể đã được quy định trong Điều 3 của hợp đồng.</li>
                        <li>Có trách nhiệm phối hợp với bên A thông báo cho các thành viên tham gia đoàn cung cấp đủ và đúng các hồ sơ cần thiết, phổ biến quy định để khách hàng thực hiện theo đúng quy định của Tổng cục Du lịch và luật pháp Việt Nam.</li>
                        <li>Thông báo danh sách xếp phòng cho Bên A trước 5 ngày khởi hành (ngày làm việc) để Bên A tiến hành sắp xếp lịch.</li>
                        <li>Trưởng đoàn và các thành viên trong đoàn của Bên B chịu trách nhiệm về nhân thân những thành viên tham gia đoàn trong thời gian tham gia tour, hợp tác và hỗ trợ cùng với Hướng dẫn viên của Bên A tổ chức quản lý đoàn trong suốt thời gian tham quan.</li>
                    </ul>

                    <h4 style={{ fontSize: '16px', margin: '30px 0 10px 0' }}>ĐIỀU 5: CÁC ĐIỀU KHOẢN HUỶ VÀ THAY ĐỔI, BỔ SUNG HỢP ĐỒNG</h4>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>5.1 Điều khoản thay đổi, bổ sung hợp đồng:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Nếu Bên B có nhu cầu phát sinh bên ngoài thỏa thuận hợp đồng đã ký thì Bên B phải chịu toàn bộ chi phí phát sinh ngoài hợp đồng đã ký đó với điều kiện Bên A có khả năng phục vụ được. Khoản chi phí phát sinh này sẽ được cộng vào và thanh toán khi thanh lý hợp đồng.</li>
                        <li>Trường hợp thay đổi ngày khởi hành vì các lí do bất khả kháng như thiên tai, bão lũ và bệnh dịch(Có công văn khuyến cáo từ chính quyền tại nơi đi hoặc nơi đến)… hoặc điều kiện về chính trị, chiến tranh thì hai bên bàn bạc thống nhất lại ngày khởi hành mới.</li>
                        <li>Nếu việc thay đổi này phát sinh chi phí thì hai bên bàn bạc để hỗ trợ nhau trên tinh thần hợp tác.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>5.2 Điều khoản huỷ, thay đổi số lượng của hợp đồng</p>
                    <p style={{ textAlign: 'justify', marginBottom: '10px' }}>Nếu bên B hủy không tham gia chương trình như đã thỏa thuận, thì bên B phải trả cho bên A các chi phí như phòng khách sạn, vé máy bay(Nếu có) và tất cả các dịch vụ khác có liên quan đến chuyến đi.</p>
                    
                    <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                        <li><b>Phí huỷ tour: Áp dụng cho cả Bên A và Bên B</b></li>
                    </ul>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'center', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <thead style={{ background: '#fef3c7' }}>
                            <tr>
                                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>So với ngày bắt đầu dịch vụ<br/>(Ngày khởi hành)</th>
                                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>PHÍ HỦY<br/>% Giá trị Hợp đồng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Ngay sau khi kí Hợp đồng</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>50%</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Trong 30 đến 15 ngày</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>70%</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Trong 14 đến 10 ngày</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>85%</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Trong vòng 9 ngày</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>100%</td></tr>
                        </tbody>
                    </table>

                    <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                        <li><b>Phí giảm số lượng: Áp dụng cho Bên B</b></li>
                    </ul>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'center', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <thead style={{ background: '#fef3c7' }}>
                            <tr>
                                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>So với ngày bắt đầu dịch vụ<br/>(Ngày khởi hành)</th>
                                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>PHÍ HỦY<br/>% Giá Tour mỗi khách</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Ngay sau khi kí hợp đồng</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>30%</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Trong 30 đến 15 ngày</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>50%</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Trong 14 đến 10 ngày</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>80%</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Trong vòng 9 ngày</td><td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>100%</td></tr>
                        </tbody>
                    </table>
                    
                    <h4 style={{ fontSize: '16px', margin: '30px 0 10px 0' }}>ĐIỀU 6: CÁC ĐIỀU KHOẢN CHUNG:</h4>
                    <p style={{ fontStyle: 'italic', fontWeight: 'bold', marginBottom: '15px' }}>Khi đăng ký Du lịch cùng FIT TOUR, đồng nghĩa rằng quý bạn đồng hành (Travel Mates) đã đọc kỹ và đồng ý các điều khoản Du lịch cùng chúng tôi.</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Đối với những khách hàng chỉ mua Land tour (tức dịch vụ mặt đất tại nước muốn đến),FIT TOUR sẽ không khuyến khích khách hàng tự mua/xuất vé máy bay khi chưa có sự xác nhận tour chắc chắn khởi hành từ FIT TOUR.</li>
                        <li>Chúng tôi không chịu trách nhiệm về chi phí chuyến đi: khách sạn mua thêm, vé máy bay, visa… của khách hàng nếu tour không khởi hành.</li>
                        <li>Quý khách mang quốc tịch nước ngoài hoặc Việt Kiều có visa tái nhập Việt Nam 01 lần, phải làm visa tái nhập VN để nhập cảnh vào VN lần tiếp theo & phải có visa rời mang theo lúc đi tour.</li>
                        <li>Quý khách mang 2 Quốc tịch hoặc Travel document (chưa nhập quốc tịch) vui lòng thông báo với nhân viên bán tour ngay thời điểm đăng ký tour và nộp bản gốc kèm các giấy tờ có liên quan (nếu có).</li>
                        <li>Quý khách chỉ mang thẻ xanh (thẻ tạm trú tại nước ngoài) và không còn hộ chiếu VN còn hiệu lực thì không du lịch sang nước thứ ba được.</li>
                        <li>Trường hợp trẻ em đi với người nhà (không phải Bố Mẹ) phải nộp kèm giấy ủy quyến được chính quyền địa phương xác nhận (do Bố Mẹ ủy quyền dắt đi tour).</li>
                        <li>Đối với khách hàng từ 75 tuổi – đến 79 tuổi: yêu cầu ký cam kết sức khỏe với Cty & giấy khám sức khỏe để đi du lịch nước ngoài do bác sĩ cấp. Cty khuyến khích đóng thêm phí bảo hiểm cao cấp tùy theo tour. Bất cứ sự cố nào xảy ra trên tour, công ty sẽ không chịu trách nhiệm.</li>
                        <li>Không nhận khách hàng từ 80 tuổi trở lên & khách hàng mang thai từ tháng thứ 5 trở lên. Khách hàng mai thai vui lòng thông báo ngay khi đăng ký tour để được tư vấn.</li>
                        <li>Công ty có quyền thay đổi hãng hàng không vận chuyển hoặc giờ bay vào giờ chót tùy thuộc vào các hãng hàng không, thời tiết.</li>
                        <li>Tùy theo điều kiện thực tế mà chương trình tham quan có thể thay đổi hành trình lên xuống cho phù hợp tuy nhiên các tuyến điểm Du Lịch vẫn đảm bảo đầy đủ như lúc ban đầu. Tuy nhiên, FIT TOUR sẽ được miễn trừ trách nhiệm bảo đảm các điểm tham quan trong trường hợp khách quan như:
                            <ul style={{ marginTop: '5px' }}>
                                <li>Xảy ra thiên tai: bão lụt, hạn hán, động đất..</li>
                                <li>Sự cố về an ninh: biểu tình, khủng bố, đình công…</li>
                                <li>Sự cố về hàng không: dời, hủy, hoãn chuyến bay, trục trặc kỹ thuật bay, an ninh bay…</li>
                            </ul>
                        </li>
                        <li>Nếu những trường hợp trên xảy ra, FIT TOUR sẽ xem xét để hoàn chi phí không tham quan cho khách trong điều kiện có thể (sau khi đã trừ lại các dịch vụ đã thực hiện: phí làm visa, tiền vé máy bay….và không chịu trách nhiệm bồi thường thêm bất kỳ chi phí nào khác). Tuy nhiên mỗi bên có trách nhiệm cố gắng tối đa để giúp đỡ bên bị thiệt hại nhằm giảm thiểu các tổn thất gây ra vì lý do bất khả kháng.</li>
                        <li>Trường hợp Quý khách không được xuất cảnh và nhập cảnh vì lý do cá nhân, FIT TOUR được miễn trừ trách nhiệm và không hoàn trả tiền tour. Quý khách tự túc chi phí mua vé máy bay quay về Việt Nam.</li>
                        <li>Tùy theo tình hình cấp Visa của Lãnh Sự Quán và vé máy bay, ngày khởi hành có thể dời lại từ 1 đến 7 ngày so với ngày khởi hành ban đầu hoặc vào đoàn khởi hành tiếp theo gần nhất.</li>
                        <li>Trên đây là mức phạt hủy tối đa, chi phí này có thể được giảm tùy theo điều kiện của từng nhà cung cấp dịch vụ cho FIT TOUR.</li>
                        <li>Thời gian hủy chuyến du lịch được tính theo ngày làm việc (không tính thứ 7, chủ nhật và các ngày lễ).</li>
                        <li>Do tính phức tạp của việc xin visa nên các điều kiện hủy vé du lịch trên đây không áp dụng với các chương trình đi Châu Âu, Úc, Mỹ, Nga, Nhật Bản, Hàn Quốc, Ai Cập, Nam Phi, các chương trình này sẽ có các điều kiện hủy vé du lịch riêng.</li>
                        <li>Các điều kiện hủy vé như trên không áp dụng vào dịp Lễ, Tết.</li>
                    </ul>

                    <h4 style={{ fontSize: '16px', margin: '30px 0 10px 0' }}>ĐIỀU 7: CÁC YÊU CẦU KHÁC:</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Quý khách có yêu cầu đặc biệt phải thông báo trước cho FIT TOUR ngay tại thời điểm đăng ký, chúng tôi sẽ cố gắng đáp ứng những yêu cầu này trong khả năng của mình, song sẽ không chịu trách nhiệm về bất kỳ sự từ chối cung cấp dịch vụ nào từ phía các nhà vận chuyển, khách sạn, nhà hàng và các nhà cung cấp dịch vụ độc lập khác.</li>
                        <li>Quý khách hàng sẽ phải chi trả thêm chi phí đối với các yêu cầu đặc biệt trong từng trường hợp cụ thể nếu được đáp ứng và tùy theo báo giá cung cấp của các đơn vị hậu cần.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>7.1. Khách sạn</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Khách sạn được cung cấp trên cơ sở những phòng có 2 giường đơn (TWIN) hoặc một giường đôi (DBL) tùy theo cơ cấu phòng của các khách sạn. Phòng 3 sẽ được bố trí khi cần thiết (TRIPLE), tuy nhiên phòng 3 ở rất hạn chế ở nước ngoài.</li>
                        <li>Khách sạn/dịch vụ do FIT TOUR đặt cho các chương trình tham quan có tiêu chuẩn tương ứng với các mức giá vé mà Quý khách chọn khi đăng ký tour du lịch. Nếu cần thiết thay đổi về bất kỳ lý do nào, khách sạn/dịch vụ thay thế sẽ tương đương với tiêu chuẩn ban đầu và sẽ được báo ngay cho Quý khách trước ngày khởi hành.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>7.2. Vận Chuyển</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Phương tiện vận chuyển tùy theo từng chương trình du lịch.</li>
                        <li>Với chương trình đi bằng ô tô máy lạnh sẽ được FIT TOUR sắp xếp tùy theo số lượng từng đoàn và phục vụ suốt chương trình tham quan.</li>
                        <li>Với chương trình đi bằng xe lửa, máy bay, tàu cánh ngầm (phương tiện vận chuyển công cộng): Trong một số chương trình các nhà cung cấp dịch vụ có thể thay đổi giờ khởi hành mà không báo trước, việc thay đổi này sẽ được FIT TOUR thông báo cho khách hàng nếu thời gian cho phép.</li>
                        <li>FIT TOUR không chịu trách nhiệm bồi hoàn và trách nhiệm pháp lý với những thiệt hại về vật chất & tinh thần do việc chậm trễ giờ giấc khởi hành của các phương tiện vận chuyển công cộng hoặc do sự chậm trễ của chính hành khách gây ra. FIT TOUR chỉ thực hiện hành vi giúp đỡ để giảm bớt tổn thất cho khách hàng.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>7.3. Hành Lý</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Hành lý cần gọn nhẹ, có thẻ ghi tên, số điện thoại lien lạc.</li>
                        <li>Với các chương trình sử dụng dịch vụ hàng không, trọng lượng hành lý miễn cước sẽ do các hãng hàng không qui định.</li>
                        <li>Quý khách tự bảo quản hành lý của mình, FIT TOUR không chịu trách nhiệm về sự thất lạc, hư hỏng hành lý hoặc bất kỳ vật dụng nào của hành khách trong suốt chuyến đi.</li>
                        <li>Trong trường hợp khách hàng mất hay thất lạc hành lý: FIT TOUR sẽ giúp hành khách liên lạc và khai báo với các bộ phận liên quan để truy tìm hành lý bị mất hay thất lạc. Việc bồi thường hành lý mất hay thất lạc sẽ theo qui định của các đơn vị cung cấp dịch vụ hoặc các đơn vị bảo hiểm.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>7.4. Tiếp nhận thông tin về chương trình du lịch</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Trước khi đăng ký, Quý khách hàng vui lòng đọc kỹ chương trình, chi phí, các khoản mục bao gồm cũng như không bao gồm trong chương trình.</li>
                        <li>Khách hàng có thể trực tiếp hoặc nhờ người đại diện đến đăng ký đi du lịch và thanh toán tiền vé tại các văn phòng, chi nhánh của FIT TOUR.</li>
                        <li>FIT TOUR chỉ có trách nhiệm cung cấp thông tin chuyến đi cho khách hàng đến đăng ký trực tiếp hoặc cho người đại diện. FIT TOUR không chịu bất cứ trách nhiệm nào trong trường hợp người đại diện không cung cấp lại hoặc cung cấp không chính xác các thông tin của chuyến đi cho khách hàng.</li>
                    </ul>
                    <h5 style={{ fontWeight: 'bold', margin: '15px 0 10px 0' }}>7.5. Trách nhiệm và những cam kết khác</h5>
                    <p style={{ fontWeight: 'bold', marginLeft: '10px', fontStyle: 'italic', marginBottom: '5px' }}>7.5.1 Về phía FIT TOUR</p>
                    <ul style={{ paddingLeft: '30px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Đảm bảo mọi dịch vụ theo đúng theo chương trình.</li>
                        <li>Phổ biến đầy đủ các thông tin / qui định cần thiết, các khi đi du lịch trong và ngoài nước trước ngày khởi hành.</li>
                        <li>Với các chương trình du lịch nước ngoài, FIT TOUR không chịu trách nhiệm về các hành khách bị cơ quan hữu quan của nước ngoài từ chối cho xuất nhập cảnh. Mọi phát sinh từ việc từ chối này do khách hàng chi trả bao gồm cả chi phí phạt hủy dịch vụ của các nhà cung cấp.</li>
                    </ul>
                    <p style={{ fontWeight: 'bold', marginLeft: '10px', fontStyle: 'italic', marginBottom: '5px' }}>7.5.2 Về phía Khách hàng</p>
                    <ul style={{ paddingLeft: '30px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li>Thanh toán đầy đủ, đúng hạn.</li>
                        <li>Tuân thủ theo chương trình và Hướng dẫn viên trong suốt thời gian đi du lịch.</li>
                        <li>Cung cấp đầy đủ hộ chiếu, hình ảnh và các giấy tờ liên quan đến thủ tục xuất nhập cảnh, đúng hạng theo qui định và khi được yêu cầu.</li>
                        <li>Tuân thủ theo qui định và pháp luật các nước/ địa phương sở tại khi tham quan.</li>
                        <li>FIT TOUR không chịu trách nhiệm pháp lý cũng như vật chất trong trường hợp khách hàng bị phạt do vi phạm pháp luật hoặc qui định của nước sở tại.</li>
                        <li>Khách hàng phải chịu trách nhiệm thanh toán tất cả các chi phí phát sinh do việc vi phạm gây ra. FIT TOUR chỉ có trách nhiệm giúp đỡ khách hàng trong trường hợp này nhằm giảm thiểu mức thiệt hại cho khách.</li>
                        <li>Tùy theo tình hình thực tế, FIT TOUR giữ quyền thay đổi hãng bay, lộ trình, sắp xếp lại thứ tự các điểm tham quan hoặc hủy bỏ chuyến đi du lịch bất cứ lúc nào mà FIT TOUR thấy cần thiết vì sự thuận tiện hoặc an toàn của khách hàng và sẽ thông báo tới Quý khách.</li>
                        <li>Trong quá trình thực hiện, nếu xảy ra tranh chấp, sự việc sẽ được giải quyết trên cơ sở thương lượng. Nếu không đạt được kết quả, vụ việc sẽ được đưa ra toà án theo đúng qui định của pháp luật hiện hành. Mọi chi phí liên quan sẽ do bên thua kiện chịu.</li>
                    </ul>

                    <h4 style={{ fontSize: '16px', margin: '30px 0 10px 0' }}>ĐIỀU 8: ĐIỀU KHOẢN THI HÀNH:</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', textAlign: 'justify' }}>
                        <li><b>THỜI HẠN HỢP ĐỒNG:</b> Hợp đồng này có hiệu lực kể từ ngày ký và tự động thanh lý khi các Bên hoàn tất nghĩa vụ của mình theo quy định của Hợp đồng.</li>
                        <li><b>TÍNH TOÀN DIỆN:</b> Hợp Đồng này sẽ thay thế cho tất cả các thỏa thuận trước đây, dù bằng lời nói hay văn bản, cũng như mọi sự trình bày khác, và sẽ tạo nên sự thỏa thuận toàn diện và duy nhất giữa các Bên.</li>
                        <li><b>TỪ BỎ QUYỀN TRONG HỢP ĐỒNG:</b> Việc từ bỏ không thực hiện bất kỳ quy định nào của Hợp đồng này của một Bên sẽ không được hiểu là sự từ bỏ hoặc hạn chế quyền của Bên đó trong việc yêu cầu Bên kia thực thi và tuân thủ nghiêm chỉnh các quy định khác của Hợp đồng.</li>
                        <li><b>TÍNH ĐỘC LẬP:</b> Mọi điều khoản và mọi phần trong Hợp Đồng này đều riêng biệt và tách rời khỏi các điều khoản khác. Trong trường hợp một điều khoản nào đó của Hợp đồng này bị vô hiệu theo phán quyết của cơ quan có thẩm quyền hoặc do thay đổi pháp luật thì các điều khoản còn lại vẫn giữ nguyên hiệu lực với các Bên. Các Bên sẽ bàn bạc, thỏa thuận để sửa đổi, bổ sung lại điều khoản đó cho phù hợp dựa trên các điều khoản còn lại của Hợp đồng hoặc theo quy định pháp luật. Đối với những vấn đề phát sinh mà Hợp đồng này không quy định thì sẽ áp dụng quy định pháp luật hiện hành của Việt Nam để giải quyết.</li>
                        <li>Các Bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thoả thuận trong Hợp đồng. Bên nào có nhu cầu thay đổi, bổ sung bất kỳ nội dung nào của Hợp đồng này phải thông báo cho Bên còn lại bằng văn bản. Mọi sự thay đổi, bổ sung phải được lập thành văn bản do đại diện có thẩm quyền của các Bên trong Hợp đồng ký tên.</li>
                        <li>Những tài liệu đi kèm Hợp đồng này hoặc để thực hiện Hợp đồng này cũng được coi là phần không tách rời của Hợp đồng này.</li>
                        <li>Hợp đồng được lập thành 02 (hai) bản gốc có giá trị pháp lí như nhau. Mỗi Bên giữ 01 (một) bản.</li>
                    </ul>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 30px', marginTop: '60px' }}>

                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            <p>ĐẠI DIỆN BÊN A</p>
                            <img src="/con-dau-tron-fittour.png" alt="FIT TOUR Stamp" style={{ width: '150px', marginTop: '10px' }} />
                            <p style={{ marginTop: '10px' }}>NGUYỄN NHẤT VŨ</p>
                        </div>
                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            <p>ĐẠI DIỆN BÊN B</p>
                            <p style={{ marginTop: '100px', textTransform: 'uppercase' }} contentEditable suppressContentEditableWarning>{booking.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (No print) */}
            <div className="no-print" style={{ 
                width: '320px', 
                background: 'white', 
                borderLeft: '1px solid #e2e8f0', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <button style={{ 
                    padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', 
                    borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                }}>
                    <CheckCircle size={18} /> Ký xác nhận
                </button>

                <div style={{ background: '#fecdd3', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>MÃ ĐẶT CHỖ</p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>RESERVATION CODE</p>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#e11d48' }}>{reservationCode}</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => window.print()} style={{ 
                        padding: '12px', background: 'white', border: '1px solid #e2e8f0', 
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        color: '#0284c7', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.background = '#f0f9ff'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                        <FileText size={18} /> Tải xuống PDF
                    </button>
                    
                    <button onClick={handleDownloadWord} style={{ 
                        padding: '12px', background: 'white', border: '1px solid #e2e8f0', 
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        color: '#0284c7', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.background = '#f0f9ff'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                        <Download size={18} /> Tải xuống Word
                    </button>
                    
                    <button onClick={() => alert("Tính năng gửi Email cho Khách hàng sẽ sớm ra mắt!")} style={{ 
                        padding: '12px', background: 'white', border: '1px solid #e2e8f0', 
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        color: '#475569', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                        <Mail size={18} /> Gửi Email
                    </button>

                    <button onClick={async () => {
                        if(await swalConfirm('Bạn có chắc chắn muốn xóa mọi chỉnh sửa và đặt lại mẫu Hợp đồng nguyên bản?')) {
                            window.location.reload();
                        }
                    }} style={{ 
                        padding: '12px', background: '#fff1f2', border: '1px solid #fda4af', 
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        color: '#e11d48', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s', marginTop: '10px'
                    }} onMouseOver={e => e.currentTarget.style.background = '#ffe4e6'} onMouseOut={e => e.currentTarget.style.background = '#fff1f2'}>
                        <RotateCcw size={18} /> Đặt lại mẫu gốc
                    </button>
                </div>

                <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontWeight: 'bold', marginBottom: '15px' }}>
                        <CheckCircle size={20} /> Thanh toán
                    </div>
                    <button style={{ 
                        width: '100%', padding: '12px', background: 'white', border: '1px solid #cbd5e1', 
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        color: '#334155', fontWeight: 'bold', fontSize: '13px'
                    }}>
                        Chuyển khoản ngân hàng <Smartphone size={16}/>
                    </button>
                </div>
                
                <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
                    * Bạn có thể bấm thẳng vào các dòng chữ bên trong Hợp Đồng (Bên trái) để chỉnh sửa thủ công trước khi bấm Tải xuống PDF.
                </div>
            </div>
        </div>
    );
}
