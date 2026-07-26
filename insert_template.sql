INSERT INTO message_templates (name, description, payload) 
VALUES (
  'Thẻ Chuyên Gia - Trần Quốc Thịnh', 
  'Liên hệ Chuyên Gia Tư Vấn. HDV chuyên các tuyến Trung Quốc, Đông Nam Á, Hàn Quốc, Nhật Bản, Đài Loan, Himalaya, Con đường tơ lụa, Ai Cập, Ấn Độ.', 
  '{
    "template_type": "generic",
    "elements": [
      {
        "title": "Trần Quốc Thịnh (Kinh nghiệm 8 năm)",
        "subtitle": "PROJECT MANAGER | GUIDE. Chuyên tuyến Trung Quốc, Đông Nam Á, Himalaya...",
        "image_url": "https://media.fittour.vn/uploads/2024/05/trip-planner-tran-thinh.webp",
        "buttons": [
          {
            "type": "web_url",
            "title": "Liên hệ Chuyên Gia",
            "url": "https://dulichcoguu.com/tran-quoc-thinh/"
          }
        ]
      }
    ]
  }'::jsonb
);
