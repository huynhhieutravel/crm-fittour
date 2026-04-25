const db = require('../../db');
const { logActivity } = require('../../utils/logger');

module.exports = {
  declaration: {
    name: "create_travel_support",
    description: "Tạo mới Dịch vụ Hỗ trợ (Lưu trú, Nhà hàng, Phương tiện, Ticket, Hộ Chiếu...). Dùng khi nhân viên nói 'Tạo dịch vụ lưu trú...', 'Thêm nhà hàng...', 'Note tiền dịch vụ'.",
    parameters: {
      type: "OBJECT",
      properties: {
        service_type: {
          type: "STRING",
          enum: [
            "1. Lưu trú", "2. Hàng không", "3. Vận chuyển", "4. Nhà hàng", 
            "5. Vé tham quan", "6. Bảo hiểm du lịch", "7. Thuê SIM", "8. Khác..."
          ],
          description: "BẮT BUỘC chọn đúng 1 trong các mục sau. Ví dụ: book vé/ticket -> chọn '5. Vé tham quan', thuê xe -> '3. Vận chuyển', làm passport/visa -> '8. Khác...'."
        },
        service_name: {
          type: "STRING",
          description: "Tên dịch vụ hoặc chi tiết khách (Ví dụ: 'nhà hàng Local Star ở Nha Trang', 'Làm passport khách Tâm')."
        },
        quantity: {
          type: "NUMBER",
          description: "Số lượng (Ví dụ: 2). Mặc định là 1 nếu không nhắc đến."
        },
        unit_price: {
          type: "NUMBER",
          description: "Giá BÁN (đơn giá tính cho khách). (Ví dụ: 5000000)."
        },
        unit_cost: {
          type: "NUMBER",
          description: "Giá VỐN (giá thu/chi gốc của vendor). Nếu user không nói thì để 0."
        },
        collected_amount: {
          type: "NUMBER",
          description: "Số tiền đã thu của khách. (Ví dụ: 'thu 8.000.000 đồng rồi' -> 8000000). Mặc định 0."
        },
        usage_date: {
          type: "STRING",
          description: "Ngày sử dụng dịch vụ (nếu có nhắc đến, định dạng YYYY-MM-DD)."
        }
      },
      required: ["service_type", "service_name"]
    }
  },
  handler: async (args, user) => {
    let { 
        service_type, 
        service_name, 
        quantity = 1, 
        unit_price = 0, 
        unit_cost = 0, 
        collected_amount = 0,
        usage_date = null
    } = args;

    // RBAC: Check quyền cơ bản (sale hoặc admin)
    // Travel Support thường allow ai cũng được tạo nếu gắn tên họ, nhưng lấy sale_id = id
    
    // Format loại dịch vụ giống CSDL & Dropdown Frontend
    let lowerType = service_type ? service_type.toString().toLowerCase() : '';
    let finalType = "8. Khác..."; // Mặc định nếu không tìm thấy

    if (lowerType.includes('lưu trú') || lowerType.includes('khách sạn') || lowerType.includes('hotel')) finalType = '1. Lưu trú';
    else if (lowerType.includes('hàng không') || lowerType.includes('máy bay') || lowerType.includes('bay')) finalType = '2. Hàng không';
    else if (lowerType.includes('vận chuyển') || lowerType.includes('xe') || lowerType.includes('phương tiện')) finalType = '3. Vận chuyển';
    else if (lowerType.includes('nhà hàng') || lowerType.includes('ăn uống') || lowerType.includes('buffet')) finalType = '4. Nhà hàng';
    else if (lowerType.includes('tham quan') || lowerType.includes('vé') || lowerType.includes('ticket')) finalType = '5. Vé tham quan';
    else if (lowerType.includes('bảo hiểm')) finalType = '6. Bảo hiểm du lịch';
    else if (lowerType.includes('sim')) finalType = '7. Thuê SIM';
    
    // Nếu AI vô tình gõ chính xác các chữ số 1->8 từ frontend thì phải nhận ngay
    const validDropdownOptions = ["1. Lưu trú", "2. Hàng không", "3. Vận chuyển", "4. Nhà hàng", "5. Vé tham quan", "6. Bảo hiểm du lịch", "7. Thuê SIM", "8. Khác..."];
    if (validDropdownOptions.includes(service_type)) {
        finalType = service_type;
    }

    try {
        const qty = parseFloat(quantity) || 1;
        const uPrice = parseFloat(unit_price) || 0;
        const uCost = parseFloat(unit_cost) || 0;
        
        const total_cost = qty * uCost;
        const total_income = qty * uPrice;
        const profit = total_income - total_cost; // Tạm tính không thuế
        
        const insertQuery = `
            INSERT INTO travel_support_services (
                sale_id, service_type, service_name, 
                quantity, unit_cost, total_cost, unit_price, total_income,
                profit, collected_amount, usage_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') RETURNING *
        `;

        const result = await db.query(insertQuery, [
            user.id, finalType, service_name, 
            qty, uCost, total_cost, uPrice, total_income, 
            profit, parseFloat(collected_amount) || 0, usage_date
        ]);
        
        const newDoc = result.rows[0];

        // Log
        await logActivity({
            user_id: user.id,
            action_type: 'CREATE',
            entity_type: 'TRAVEL_SUPPORT',
            entity_id: newDoc.id,
            details: `AI tạo dịch vụ hỗ trợ: ${service_name}`
        });

        // Tạo summary text dễ hiểu thay vì trả nguyên row JSON
        const priceFmt = total_income.toLocaleString('vi-VN');
        const collectedFmt = (parseFloat(collected_amount)||0).toLocaleString('vi-VN');
        const remainFmt = (total_income - (parseFloat(collected_amount)||0)).toLocaleString('vi-VN');

        return {
            action: 'CREATE', status: 'SUCCESS',
            message: `✅ Đã lên phiếu **${finalType}** thành công!\n\n**Tên DV:** ${service_name}\n**Số lượng:** ${qty}\n**Tổng tiền:** ${priceFmt}đ\n**Đã thu:** ${collectedFmt}đ\n**Còn nợ:** ${remainFmt}đ`,
            data: { id: newDoc.id }
        };

    } catch (err) {
        return { action: 'CREATE', status: 'ERROR', message: `Lỗi hệ thống: ${err.message}` };
    }
  }
};
