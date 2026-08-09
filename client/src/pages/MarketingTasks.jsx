import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Bell, Plus, Home, BookOpen, BarChart2, FileText, 
  LayoutTemplate, Star, Image as ImageIcon, MessageSquare, 
  ChevronDown, ArrowRight, ArrowLeft, TrendingUp, ClipboardList,
  CheckCircle2, Circle, Clock, Filter, X
} from 'lucide-react';

const initialTasks = [
  {
    id: "post-tiktok-video",
    title: "Đăng nội dung TikTok",
    frequency: "daily",
    assignee: "Chưa phân công",
    status: "todo",
    category: "Social Media",
    purpose: "Đảm bảo video được đăng tải đầy đủ thông tin và đúng lịch.",
    steps: [
      "Kiểm tra video cuối cùng cùng với Caption, Hashtag, Ảnh bìa",
      "Đăng hoặc lên lịch đăng video",
      "Kiểm tra hiển thị sau khi đăng (âm thanh, text bị che...)",
      "Theo dõi bình luận và hiệu suất sau đăng"
    ],
    completionCriteria: [
      "Video đã được đăng đúng giờ theo lịch content",
      "Caption và hashtag đúng format quy định",
      "Đã thả tim/rep comment 10 bình luận đầu tiên"
    ]
  },
  {
    id: "marketing-ai-check",
    title: "Kiểm tra nội dung AI",
    frequency: "daily",
    assignee: "Chưa phân công",
    status: "todo",
    category: "Kiểm duyệt",
    purpose: "Đảm bảo nội dung trước khi sử dụng đáp ứng tiêu chuẩn chất lượng và hạn chế tỷ lệ AI quá cao.",
    steps: [
      "Tiếp nhận nội dung cần kiểm tra",
      "Thực hiện kiểm tra bằng công cụ ZeroGPT/Scribbr",
      <>Kiểm tra yêu cầu, đưa phương án xử lý (nếu có lỗi/tỷ lệ AI cao) vào <a href="https://docs.google.com/spreadsheets/d/1sSlrtJz6TANIU3Z-dXABE3iXFOkpEOUXD5QHIIb2pok/edit" target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', textDecoration: 'underline'}}>Log File</a></>,
      "Phản hồi lại người phụ trách nội dung để điều chỉnh",
      "Kiểm tra lại sau khi chỉnh sửa trước khi xác nhận hoàn tất"
    ],
    completionCriteria: [
      "Tất cả bài viết trong ngày đều được check tỷ lệ AI",
      "Không có bài nào vượt quá 30% nội dung tạo bằng AI được đăng"
    ]
  },
  {
    id: "post-youtube-shorts",
    title: "Đăng YouTube Shorts",
    frequency: "daily",
    assignee: "Chưa phân công",
    status: "doing",
    category: "Social Media",
    purpose: "Đăng tải YouTube Shorts đúng quy tắc và đầy đủ thông tin.",
    steps: [
      "Tải video lên YouTube Studio",
      "Nhập tiêu đề, Mô tả, Hashtag, Thumbnail",
      "Thêm vào Playlist phù hợp",
      "Xuất bản hoặc Lên lịch",
      "Kiểm tra sau đăng và theo dõi Analytics"
    ],
    completionCriteria: [
      "Video đã publish",
      "Đã điền đầy đủ Thumnail và Playlist"
    ]
  },
  {
    id: "marketing-reply-inbox",
    title: "Trả lời Comment & Inbox",
    frequency: "daily",
    assignee: "Chưa phân công",
    status: "todo",
    category: "Chăm sóc khách hàng",
    purpose: "Đảm bảo phản hồi khách hàng nhanh chóng, đúng thông tin và đúng quy trình.",
    steps: [
      "Theo dõi bình luận và tin nhắn hằng ngày trên các nền tảng",
      "Trả lời các câu hỏi cơ bản theo thông tin đã được thống nhất",
      "Với các trường hợp cần tư vấn chuyên sâu hoặc báo giá, chuyển thông tin cho nhân viên Sale phụ trách"
    ],
    completionCriteria: [
      "100% tin nhắn và bình luận trong ca làm việc được phản hồi",
      "Đã tag/chuyển đúng Sale phụ trách cho các khách hàng có nhu cầu mua tour"
    ]
  },
  {
    id: "marketing-receive-lead",
    title: "Tiếp nhận Lead từ TikTok",
    frequency: "daily",
    assignee: "Chưa phân công",
    status: "todo",
    category: "Sale Support",
    purpose: "Đảm bảo mọi khách hàng từ TikTok được chuyển đến Sale đầy đủ và kịp thời.",
    steps: [
      "Tiếp nhận thông tin khách từ TikTok (qua comment, inbox, bio link)",
      "Xác nhận nhu cầu cơ bản của khách (chặng nào, tháng mấy, mấy người)",
      "Ghi nhận thông tin liên hệ (Số điện thoại / Zalo)",
      "Chuyển Lead trực tiếp cho team Sale",
      "Theo dõi trạng thái tiếp nhận để đảm bảo Sale đã liên hệ khách"
    ],
    completionCriteria: [
      "Lead được chuyển qua nhóm Zalo nội bộ trong thời gian ngắn nhất",
      "Sale phụ trách đã xác nhận 'Đã nhận/Đã tư vấn' đối với Lead đó"
    ]
  },
  {
    id: "marketing-track-kpi",
    title: "Theo dõi KPI và bình luận",
    frequency: "weekly",
    assignee: "Chưa phân công",
    status: "todo",
    category: "Báo cáo & Đo lường",
    purpose: "Theo dõi hiệu quả hoạt động của Facebook và TikTok.",
    steps: [
      "Kiểm tra bình luận chưa phản hồi trên Facebook và TikTok",
      "Theo dõi các chỉ số cơ bản như lượt xem, lượt tiếp cận và mức độ tương tác khi được yêu cầu",
      "Tổng hợp kết quả và báo cáo các trường hợp bất thường"
    ],
    completionCriteria: [
      "Đã kiểm tra và đảm bảo không có bình luận nào bị bỏ sót trong tuần",
      "Đã tổng hợp được file số liệu cơ bản báo cáo cho Leader",
      "Đã báo cáo kịp thời nếu có bài viết/chiến dịch nào giảm tương tác bất thường"
    ]
  }
];

const MarketingTasks = ({ initialTaskId }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeMenu, setActiveMenu] = useState('Tasks & SOP');
  const [selectedAssignee, setSelectedAssignee] = useState('Tất cả');
  const [teamMembers, setTeamMembers] = useState(["Chưa phân công"]);
  
  const selectedTask = initialTaskId ? tasks.find(t => t.id === initialTaskId) : null;
  const navigate = useNavigate();

  useEffect(() => {
    // If we wanted to handle routing updates, but React Router's URL is the source of truth for initialTaskId
  }, [initialTaskId, tasks]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users', { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        });
        
        // Filter users who belong to Marketing, plus the admin
        const marketingUsers = res.data.filter(u => {
          if (u.username === 'admin' || (u.email && u.email.includes('huynhhieutravel'))) return true;
          
          const searchStr = [
            ...(u.teams || []).map(t => t.name),
            u.position,
            ...(Array.isArray(u.bus) ? u.bus : [u.bus]),
            u.role_name
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchStr.includes('marketing');
        });
        
        // Fallback: If no marketing users found, just use all users for now so it's not empty
        const usersToMap = marketingUsers.length > 0 ? marketingUsers : res.data;
        const userNames = usersToMap.map(u => u.full_name || u.username);
        
        const uniqueNames = ["Chưa phân công", ...new Set(userNames)];
        setTeamMembers(uniqueNames);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const userName = currentUser?.full_name || currentUser?.username || 'Người dùng';
  const userRole = currentUser?.role ? currentUser.role.toUpperCase() : 'NHÂN VIÊN';
  const initial = userName.charAt(0).toUpperCase();

  const menuItems = [
    { section: 'TỔNG QUAN', items: [{ name: 'Tổng quan', icon: <Home size={18} />, url: '/tai-lieu/marketing' }] },
    { 
      section: 'NHIỆM VỤ & CÔNG VIỆC', 
      items: [
        { name: 'Tasks & SOP', icon: <ClipboardList size={18} />, url: '/tai-lieu/marketing/tasks' },
      ] 
    },
    { 
      section: 'TÀI LIỆU MARKETING', 
      items: [
        { name: 'Tài liệu Marketing', icon: <BookOpen size={18} />, url: '/tai-lieu/marketing' },
        { name: 'Log AI Agent', icon: <FileText size={18} />, url: 'https://docs.google.com/spreadsheets/d/1sSlrtJz6TANIU3Z-dXABE3iXFOkpEOUXD5QHIIb2pok/edit?usp=sharing', external: true }
      ] 
    },
    { 
      section: 'DANH MỤC TÀI LIỆU', 
      items: [
        { name: 'Guideline', icon: <FileText size={18} />, url: '/cam-nang-thuong-hieu' },
        { name: 'Logo', icon: <ImageIcon size={18} />, url: 'https://drive.google.com/drive/folders/1KcLWiW6mMnLjxw-xXbiOwmR6Qn9tSs6g?usp=sharing', external: true },
        { name: 'Blueprint & SOP Ads', icon: <Star size={18} />, submenu: [
            { name: 'Xem Blueprint', url: '/tai-lieu/blueprint-meta-ads' },
            { name: 'SOP Đặt Tên', url: '/tai-lieu/quy-tac-dat-ten-quang-cao-meta' },
            { name: 'Quản lý Ads', url: 'https://docs.google.com/spreadsheets/d/15O9hrCdZvVoLwC8fRQCYm5nxs0WGL9s8RQ3XScj0jQo/edit?usp=sharing', external: true }
          ]
        },
        { name: 'Asset', icon: <ImageIcon size={18} />, url: '#' },
        { name: 'Báo Cáo Ads', icon: <BarChart2 size={18} />, url: '/q2-report/index.html', external: true }
      ] 
    }
  ];

  const filteredTasks = selectedAssignee === 'Tất cả' 
    ? tasks 
    : tasks.filter(t => t.assignee === selectedAssignee);

  const dailyTasks = filteredTasks.filter(t => t.frequency === 'daily');
  const weeklyTasks = filteredTasks.filter(t => t.frequency === 'weekly');
  const monthlyTasks = filteredTasks.filter(t => t.frequency === 'monthly');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle2 size={16} color="#16a34a" />;
      case 'doing': return <Clock size={16} color="#f59e0b" />;
      default: return <Circle size={16} color="#94a3b8" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'done': return <span style={{color: '#16a34a'}}>Hoàn thành</span>;
      case 'doing': return <span style={{color: '#f59e0b'}}>Đang làm</span>;
      default: return <span style={{color: '#94a3b8'}}>Chưa làm</span>;
    }
  };

  const TaskCard = ({ task }) => (
    <div 
      onClick={() => navigate(`/tai-lieu/marketing/tasks/${task.id}`)}
      style={{ 
        backgroundColor: '#ffffff', borderRadius: 12, padding: '16px', 
        border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'pointer', transition: 'all 0.2s', marginBottom: '12px',
        borderLeft: `4px solid ${task.status === 'done' ? '#16a34a' : task.status === 'doing' ? '#f59e0b' : '#cbd5e1'}`
      }}
      className="hover:shadow-md hover:-translate-y-1"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{task.title}</h4>
      </div>
      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <img src={`https://ui-avatars.com/api/?name=${task.assignee.replace(' ','+')}&background=e2e8f0&color=475569`} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
        {task.assignee}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 500 }}>
        {getStatusIcon(task.status)} {getStatusText(task.status)}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/tai-lieu')}>
            <div style={{ width: 32, height: 32, backgroundColor: '#2563eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>FIT TOUR®</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Marketing Hub</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((block, idx) => (
            <div key={idx} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: 8, paddingLeft: 12, letterSpacing: '0.5px' }}>{block.section}</div>
              {block.items.map(item => {
                const isActive = activeMenu === item.name;
                const handleClick = () => {
                  if (item.external && item.url && item.url !== '#') {
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                  } else if (item.url && item.url !== '#') {
                    navigate(item.url);
                  } else if (!item.submenu) {
                    setActiveMenu(item.name);
                  }
                };

                return (
                  <div key={item.name}>
                    <div 
                      onClick={handleClick}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
                        cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s',
                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                        color: isActive ? '#2563eb' : '#475569',
                        fontWeight: isActive ? 600 : 500
                      }}
                    >
                      <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>{item.icon}</span>
                      <span style={{ fontSize: '14px', flex: 1 }}>{item.name}</span>
                      {item.submenu && <ChevronDown size={14} color="#94a3b8" />}
                    </div>
                    {item.submenu && (
                      <div style={{ paddingLeft: 34, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {item.submenu.map(sub => {
                          const isSubActive = activeMenu === sub.name;
                          return (
                            <div
                              key={sub.name}
                              onClick={() => {
                                setActiveMenu(sub.name);
                                if (sub.external && sub.url) {
                                  window.open(sub.url, '_blank', 'noopener,noreferrer');
                                } else if (sub.url && sub.url !== '#') {
                                  navigate(sub.url);
                                }
                              }}
                              style={{
                                fontSize: '13px', color: isSubActive ? '#2563eb' : '#64748b', fontWeight: isSubActive ? 600 : 400,
                                padding: '6px 8px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s',
                                backgroundColor: isSubActive ? '#eff6ff' : 'transparent', display: 'flex', alignItems: 'center', gap: 6
                              }}
                            >
                              <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: isSubActive ? '#2563eb' : '#cbd5e1' }} />
                              {sub.name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Header Bar */}
        <header style={{ height: 72, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div 
            onClick={() => navigate('/tai-lieu')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', color: '#475569', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
          >
            <ArrowLeft size={18} /> Về lại kho Tài Liệu chung
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px 4px 16px', borderRadius: 50, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>{userName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{userRole}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            
            {!selectedTask ? (
              <>
                {/* Title & Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Tasks & SOP</h1>
                    <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>Quản lý toàn bộ công việc định kỳ của team Marketing</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: 8 }}>
                      <Filter size={16} color="#64748b" />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Nhân sự:</span>
                      <select 
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '14px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                      >
                        <option value="Tất cả">Tất cả</option>
                        {teamMembers.map(member => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Board Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>
                  
                  {/* Daily */}
                  <div style={{ backgroundColor: '#f1f5f9', borderRadius: 16, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Hằng Ngày</h3>
                      <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: 20, fontSize: '12px', fontWeight: 600 }}>{dailyTasks.length}</span>
                    </div>
                    <div>
                      {dailyTasks.map(task => <TaskCard key={task.id} task={task} />)}
                      {dailyTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '14px' }}>Không có công việc</div>}
                    </div>
                  </div>

                  {/* Weekly */}
                  <div style={{ backgroundColor: '#f1f5f9', borderRadius: 16, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Hằng Tuần</h3>
                      <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: 20, fontSize: '12px', fontWeight: 600 }}>{weeklyTasks.length}</span>
                    </div>
                    <div>
                      {weeklyTasks.map(task => <TaskCard key={task.id} task={task} />)}
                      {weeklyTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '14px' }}>Không có công việc</div>}
                    </div>
                  </div>

                  {/* Monthly */}
                  <div style={{ backgroundColor: '#f1f5f9', borderRadius: 16, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Hằng Tháng</h3>
                      <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: 20, fontSize: '12px', fontWeight: 600 }}>{monthlyTasks.length}</span>
                    </div>
                    <div>
                      {monthlyTasks.map(task => <TaskCard key={task.id} task={task} />)}
                      {monthlyTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '14px' }}>Không có công việc</div>}
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', animation: 'fadeIn 0.3s ease-out' }}>
                <style>{`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
                {/* Header detail */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <div>
                    <button 
                      onClick={() => navigate('/tai-lieu/marketing/tasks')}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 16 }}
                      className="hover:text-blue-600"
                    >
                      <ArrowLeft size={16} /> Quay lại danh sách Tasks
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase' }}>
                        {selectedTask.frequency === 'daily' ? 'Hằng Ngày' : selectedTask.frequency === 'weekly' ? 'Hằng Tuần' : 'Hằng Tháng'}
                      </span>
                      <span style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={`https://ui-avatars.com/api/?name=${selectedTask.assignee.replace(' ','+')}&background=e2e8f0&color=475569`} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                        Phụ trách: 
                        <select 
                          value={selectedTask.assignee}
                          onChange={(e) => {
                            const newTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, assignee: e.target.value } : t);
                            setTasks(newTasks);
                          }}
                          style={{ border: 'none', backgroundColor: '#e2e8f0', borderRadius: 4, padding: '2px 6px', fontSize: '14px', fontWeight: 600, color: '#0f172a', cursor: 'pointer', outline: 'none', marginLeft: 4 }}
                        >
                          {teamMembers.map(member => (
                            <option key={member} value={member}>{member}</option>
                          ))}
                        </select>
                      </span>
                      <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                        {getStatusIcon(selectedTask.status)} {getStatusText(selectedTask.status)}
                      </span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{selectedTask.title.toUpperCase()}</h2>
                  </div>
                  <div>
                    <button style={{ padding: '10px 20px', borderRadius: 8, backgroundColor: '#2563eb', border: 'none', color: '#ffffff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} /> Cập nhật tiến độ
                    </button>
                  </div>
                </div>

                {/* Body detail */}
                <div style={{ padding: '40px 32px' }}>
                  
                  {/* MỤC ĐÍCH */}
                  <div style={{ marginBottom: 40 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#475569', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Star size={20} color="#f59e0b" /> MỤC ĐÍCH
                    </h3>
                    <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '20px', borderRadius: '0 8px 8px 0', fontSize: '16px', color: '#92400e', lineHeight: 1.6 }}>
                      {selectedTask.purpose}
                    </div>
                  </div>

                  {/* QUY TRÌNH THỰC HIỆN */}
                  <div style={{ marginBottom: 40 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#475569', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClipboardList size={20} color="#3b82f6" /> QUY TRÌNH THỰC HIỆN
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {selectedTask.steps.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {idx + 1}
                          </div>
                          <div style={{ fontSize: '16px', color: '#1e293b', paddingTop: 4, lineHeight: 1.6 }}>
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIÊU CHÍ HOÀN THÀNH */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#475569', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={20} color="#16a34a" /> TIÊU CHÍ HOÀN THÀNH
                    </h3>
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '24px' }}>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {selectedTask.completionCriteria.map((criteria, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: '16px', color: '#166534', lineHeight: 1.6 }}>
                            <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingTasks;
