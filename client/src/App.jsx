import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { 
  Users, 
  Map, 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  UserPlus,
  LogOut,
  Sun,
  Moon,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Search,
  PlusCircle,
  Send,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Package,
  ShoppingCart,
  UserCheck,
  MoreHorizontal,
  X,
  User,
  Lock,
  PieChart
} from 'lucide-react';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletion from './pages/DataDeletion';

const addToastGlobal = (message, setToasts) => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message }]);
  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, 3000);
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.substring(1);
    const validTabs = ['dashboard', 'leads', 'inbox', 'tours', 'departures', 'guides', 'bookings', 'customers', 'settings'];
    return (path && validTabs.includes(path)) ? path : 'dashboard';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [tours, setTours] = useState([]);
  const [tourTemplates, setTourTemplates] = useState([]);
  const [tourDepartures, setTourDepartures] = useState([]);
  const [guides, setGuides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [metaToken, setMetaToken] = useState('');
  const [metaSettings, setMetaSettings] = useState({
    meta_app_id: '',
    meta_app_secret: '',
    meta_verify_token: '',
    meta_page_access_token: '',
    meta_page_id: ''
  });
  const [leadFilters, setLeadFilters] = useState({ status: '', source: '', search: '', bu_group: '', assigned_to: '', timeRange: 'all' });
  const [tourFilters, setTourFilters] = useState({ search: '' });
  const [bookingFilters, setBookingFilters] = useState({ search: '', status: '' });
  const [customerFilters, setCustomerFilters] = useState({ search: '' });
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({ 
    name: '', phone: '', email: '', gender: '', birth_date: '', 
    source: 'Messenger', tour_id: '', consultation_note: '', 
    bu_group: '', assigned_to: '', classification: 'Mới',
    last_contacted_at: ''
  });
  const [fastLead, setFastLead] = useState({ 
    name: '', phone: '', source: 'Messenger', tour_id: '', 
    status: 'Mới', bu_group: '', assigned_to: '', classification: 'Mới',
    last_contacted_at: ''
  });
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState(null);
  const [leadNotes, setLeadNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newCustomerNote, setNewCustomerNote] = useState('');
  const [hoveredNote, setHoveredNote] = useState({ id: null, content: '', count: 0, date: null, x: 0, y: 0 });
  
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '', phone: '', email: '', gender: '', birth_date: '', 
    nationality: 'Việt Nam', id_card: '', id_expiry: '', address: '', 
    preferred_contact: 'Zalo', role: 'booker', customer_segment: 'New Customer',
    tour_interests: '', special_requests: '', internal_notes: '',
    location_city: '', travel_season: ''
  });

  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [showAddDepartureModal, setShowAddDepartureModal] = useState(false);
  const [showAddGuideModal, setShowAddGuideModal] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    name: '', destination: '', duration: '', tour_type: 'Standard', tags: '',
    itinerary: '', highlights: '', inclusions: '', exclusions: '',
    base_price: 0, internal_cost: 0, expected_margin: 0
  });

  const [newDeparture, setNewDeparture] = useState({
    tour_template_id: '', start_date: '', end_date: '', max_participants: 20, status: 'Open',
    actual_price: 0, discount_price: 0, single_room_supplement: 0, visa_fee: 0, tip_fee: 0,
    guide_id: '', operator_id: '', min_participants: 10, break_even_pax: 12
  });

  const [newGuide, setNewGuide] = useState({
    name: '', phone: '', email: '', languages: '', rating: 5, status: 'Available'
  });

  const handleQuickUpdate = async (leadId, field, value) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { [field]: value };
      
      // If setting status to 'Chốt đơn', also set won_at if not present
      if (field === 'status' && value === 'Chốt đơn') {
        const lead = leads.find(l => l.id === leadId);
        if (lead && !lead.won_at) {
          payload.won_at = new Date();
        }
      }

      await axios.put(`/api/leads/${leadId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeads();
      addToastGlobal('Đã cập nhật thay đổi thành công.', setToasts);
    } catch (err) {
      addToastGlobal('Lỗi khi cập nhật nhanh: ' + err.message, setToasts);
    }
  };
  const [isLightMode, setIsLightMode] = useState(true);
  const [editingLead, setEditingLead] = useState(null);

  const LEAD_SOURCES = ['Messenger', 'Zalo', 'Khách giới thiệu', 'Hotline', 'Khác'];
  const LEAD_STATUSES = ['Mới', 'Đã tư vấn', 'Tư vấn lần 2', 'Chốt đơn', 'Thất Bại'];
  const LEAD_CLASSIFICATIONS = ['Mới', 'Tiềm Năng', 'Tiềm Năng Cao', 'Không Tiềm Năng'];
  const CUSTOMER_ROLES = ['Người đại diện (booker)', 'Khách đi kèm'];
  const CUSTOMER_SEGMENTS = ['New Customer', 'Repeat Customer', 'VIP'];
  const CONTACT_METHODS = ['Zalo', 'Call', 'Email'];
  const CITY_OPTIONS = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Khác'];

  const addToast = (msg) => addToastGlobal(msg, setToasts);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  // Sync activeTab with URL
  useEffect(() => {
    const path = location.pathname.substring(1);
    const validTabs = ['dashboard', 'leads', 'inbox', 'tours', 'departures', 'guides', 'bookings', 'customers', 'settings'];
    if (path && validTabs.includes(path)) {
      setActiveTab(path);
    } else if (location.pathname === '/' && isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, isLoggedIn, navigate]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u) {
          setUser(u);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Session restore failed", err);
      }
    }
  }, []);
  
  // Clean up forms/modals when switching tabs
  useEffect(() => {
    setEditingLead(null);
    setShowAddLeadModal(false);
    setSelectedLeadForNotes(null);
    setEditingCustomer(null);
    setShowAddCustomerModal(false);
  }, [activeTab]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeads();
      fetchTourTemplates();
      fetchTourDepartures();
      fetchGuides();
      fetchBookings();
      fetchCustomers();
      fetchUsers();
      fetchConversations();
      fetchSettings();
    }
  }, [isLoggedIn]);

  const fetchTourTemplates = async () => {
    try {
      const response = await axios.get('/api/tours', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTourTemplates(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchTourDepartures = async () => {
    try {
      const response = await axios.get('/api/departures', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTourDepartures(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/guides', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuides(response.data);
    } catch (err) { console.error(err); }
  };

  const handleAddTemplate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/tours', newTemplate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTourTemplates();
      setShowAddTemplateModal(false);
      setNewTemplate({
        name: '', destination: '', duration: '', tour_type: 'Standard', tags: '',
        itinerary: '', highlights: '', inclusions: '', exclusions: '',
        base_price: 0, internal_cost: 0, expected_margin: 0
      });
      addToast('Đã thêm sản phẩm tour mới thành công!');
    } catch (err) { addToast('Lỗi khi thêm tour: ' + err.message); }
  };

  const handleAddDeparture = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/departures', newDeparture, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTourDepartures();
      setShowAddDepartureModal(false);
      setNewDeparture({
        tour_template_id: '', start_date: '', end_date: '', max_participants: 20, status: 'Open',
        actual_price: 0, discount_price: 0, single_room_supplement: 0, visa_fee: 0, tip_fee: 0,
        guide_id: '', operator_id: '', min_participants: 10, break_even_pax: 12
      });
      addToast('Đã lên lịch khởi hành mới thành công!');
    } catch (err) { addToast('Lỗi khi thêm lịch khởi hành: ' + err.message); }
  };

  const handleAddGuide = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/guides', newGuide, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGuides();
      setShowAddGuideModal(false);
      setNewGuide({
        name: '', phone: '', email: '', languages: '', rating: 5, status: 'Available'
      });
      addToast('Đã thêm hướng dẫn viên mới thành công!');
    } catch (err) { addToast('Lỗi khi thêm HDV: ' + err.message); }
  };

  const getSourceIcon = (source) => {
    const s = (source || '').toLowerCase();
    if (s.includes('messenger')) return <MessageSquare size={14} color="#0084ff" />;
    if (s.includes('zalo')) return <MessageSquare size={14} color="#0068ff" />;
    if (s.includes('hotline')) return <Clock size={14} color="#22c55e" />;
    if (s.includes('giới thiệu')) return <UserCheck size={14} color="#ec4899" />;
    return <TrendingUp size={14} color="#6366f1" />;
  };

  useEffect(() => {
    if (editingLead) {
      fetchLeadNotes(editingLead.id);
    }
  }, [editingLead]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetaSettings(res.data);
      if (res.data.meta_page_access_token) setMetaToken(res.data.meta_page_access_token);
    } catch (err) { console.error('Fetch settings failed', err); }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) { console.error('Fetch customers failed', err); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) { console.error('Fetch users failed', err); }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/settings/update', { settings: metaSettings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã lưu cài đặt Meta thành công!');
    } catch (err) {
      addToast('Lỗi khi lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    await createLead(newLead);
    setShowAddLeadModal(false);
    setNewLead({ 
      name: '', phone: '', email: '', gender: '', birth_date: '', 
      source: 'Messenger', tour_id: '', consultation_note: '', 
      bu_group: '', assigned_to: '', classification: 'Mới',
      last_contacted_at: ''
    });
  };

  const handleFastAddLead = async () => {
    if (!fastLead.name) { addToast('Vui lòng nhập tên khách'); return; }
    await createLead(fastLead);
    setFastLead({ 
      name: '', phone: '', source: 'Messenger', tour_id: '', 
      status: 'Mới', bu_group: '', assigned_to: '', classification: 'Mới',
      last_contacted_at: ''
    });
  };

  const createLead = async (leadData) => {
    setLoading(true);
    const cleanedData = {
      ...leadData,
      tour_id: leadData.tour_id || null,
      assigned_to: leadData.assigned_to || null
    };
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/leads', cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã thêm Lead mới thành công!');
      fetchLeads();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi thêm Lead mới');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/notes/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeadNotes(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/notes', { lead_id: selectedLeadForNotes.id, content: newNote }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewNote('');
      fetchNotes(selectedLeadForNotes.id);
      addToast('Đã lưu ghi chú mới');
    } catch (err) { console.error(err); }
  };

  const handleAddCustomerNote = async (e) => {
    e.preventDefault();
    if (!newCustomerNote.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/notes', { 
        customer_id: editingCustomer.id, 
        content: newCustomerNote 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCustomerNote('');
      addToast('Đã thêm ghi chú mới cho khách hàng.');
      // Refresh customer data to show new note in timeline
      const response = await axios.get(`/api/customers/${editingCustomer.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingCustomer(response.data);
    } catch (err) {
      addToast('Lỗi khi thêm ghi chú: ' + err.message);
    }
  };

  const handleUpdateLead = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${editingLead.id}`, editingLead, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã cập nhật thông tin Lead thành công!');
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi cập nhật Lead');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...newCustomer,
        birth_date: newCustomer.birth_date || null,
        id_expiry: newCustomer.id_expiry || null
      };
      await axios.post('/api/customers', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      setShowAddCustomerModal(false);
      setNewCustomer({
        name: '', phone: '', email: '', gender: '', birth_date: '', 
        nationality: 'Việt Nam', id_card: '', id_expiry: '', address: '', 
        preferred_contact: 'Zalo', role: 'booker', customer_segment: 'New Customer',
        tour_interests: '', special_requests: '', internal_notes: '',
        location_city: '', travel_season: ''
      });
      addToast('Đã thêm khách hàng mới thành công.');
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi thêm khách hàng');
    }
  };

  const handleUpdateCustomer = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...editingCustomer,
        birth_date: editingCustomer.birth_date || null,
        id_expiry: editingCustomer.id_expiry || null
      };
      await axios.put(`/api/customers/${editingCustomer.id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      setEditingCustomer(null);
      addToast('Đã cập nhật thông tin khách hàng.');
    } catch (err) {
      addToast('Lỗi khi cập nhật khách hàng');
    }
  };

  const handleConvertLead = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/customers/convert', { leadId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      fetchLeads();
      setEditingLead(null);
      addToast('Đã chuyển đổi Lead thành Khách hàng thành công!');
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi chuyển đổi Lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = !leadFilters.status || lead.status === leadFilters.status;
    const matchesSource = !leadFilters.source || lead.source === leadFilters.source;
    const matchesBU = !leadFilters.bu_group || lead.bu_group === leadFilters.bu_group;
    const matchesStaff = !leadFilters.assigned_to || lead.assigned_to === Number(leadFilters.assigned_to);
    const matchesSearch = !leadFilters.search || 
      (lead.name?.toLowerCase().includes(leadFilters.search.toLowerCase())) ||
      (lead.phone?.includes(leadFilters.search));
    
    // Time range filtering
    let matchesTime = true;
    if (leadFilters.timeRange !== 'all') {
      const now = new Date();
      const leadDate = new Date(lead.created_at);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (leadFilters.timeRange === 'today') {
        matchesTime = leadDate >= today;
      } else if (leadFilters.timeRange === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        matchesTime = leadDate >= weekAgo;
      } else if (leadFilters.timeRange === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        matchesTime = leadDate >= monthAgo;
      }
    }

    return matchesStatus && matchesSource && matchesSearch && matchesBU && matchesStaff && matchesTime;
  });

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (convId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/messages/send', {
        conversationId: selectedConv.id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (err) { console.error(err); }
  };

  const handleInlineUpdate = async (id, field, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${id}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(leads.map(lead => lead.id === id ? { ...lead, [field]: value } : lead));
      addToast(`Đã tự động lưu ${field}`);
    } catch (err) {
      console.error('Update failed:', err);
      addToast('Lỗi khi lưu dữ liệu');
    }
  };

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tours', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTours(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(res.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', loginData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsLoggedIn(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleTestMeta = async () => {
    if (!metaToken) {
      addToast('Vui lòng dán Page Access Token vào ô bên dưới.');
      return;
    }
    setTestLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/messages/test-meta', 
        { token: metaToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        addToast(res.data.note || 'Kích hoạt API thành công!');
      } else {
        addToast(res.data.message || 'Kích hoạt chưa hoàn tất.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi kết nối Meta.';
      addToast(errorMsg);
    } finally {
      setTestLoading(false);
      fetchSettings();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Lead này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa Lead thành công');
      fetchLeads();
    } catch (err) {
      addToast('Lỗi khi xóa Lead');
    }
  };

  const fetchLeadNotes = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/notes/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeadNotes(res.data);
    } catch (err) { console.error('Fetch notes failed', err); }
  };

  const handleAddNoteForLead = async (leadId) => {
    if (!newNote.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/notes', 
        { lead_id: leadId, content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeadNotes([res.data, ...leadNotes]);
      setNewNote('');
      fetchLeads(); // Refresh dashboard counts
    } catch (err) { addToast('Lỗi khi thêm ghi chú'); }
  };

  const renderDashboard = () => (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ padding: '8px', background: 'var(--secondary)', borderRadius: '10px', display: 'flex' }}>
            <Map size={24} color="white" />
          </div>
          FIT TOUR
        </div>
        
        <div className="nav-section-title">Tổng quan</div>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
          <LayoutDashboard /> Dashboard
        </div>
        
        <div className="nav-section-title">Marketing & Sales</div>
        <div className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => navigate('/leads')}>
          <Users /> Lead Marketing
        </div>
        <div className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => navigate('/inbox')}>
          <MessageSquare /> Messenger
        </div>

        <div className="nav-section-title">Nghiệp vụ lõi</div>
        <div className={`nav-item ${activeTab === 'tours' ? 'active' : ''}`} onClick={() => navigate('/tours')}>
          <Package /> Sản phẩm Tour
        </div>
        <div className={`nav-item ${activeTab === 'departures' ? 'active' : ''}`} onClick={() => navigate('/departures')}>
          <Calendar /> Lịch khởi hành
        </div>
        <div className={`nav-item ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => navigate('/guides')}>
          <Users /> Hướng dẫn viên
        </div>
        <div className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => navigate('/bookings')}>
          <ShoppingCart /> Đơn hàng/Booking
        </div>
        <div className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => navigate('/customers')}>
          <UserCheck /> Khách hàng
        </div>

        <div className="nav-section-title">Hệ thống</div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
          <Settings /> Cấu hình Meta
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={handleLogout} style={{ color: '#f87171' }}>
            <LogOut /> Đăng xuất
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="breadcrumb-container">
          <div className="breadcrumb">CRM / {activeTab.toUpperCase()}</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          </div>
        </div>

        <header className="header">
          <h1>{
            activeTab === 'dashboard' ? 'Tổng quan hệ thống' : 
            activeTab === 'leads' ? 'Quản lý Lead Marketing' : 
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          }</h1>
          <div className="user-profile">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.full_name || 'Người dùng'}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.role?.toUpperCase() || 'NHÂN VIÊN'}</div>
            </div>
            <div className="user-avatar">{user?.username?.substring(0,1).toUpperCase() || 'U'}</div>
          </div>
        </header>

        {(activeTab === 'dashboard' || activeTab === 'leads') && editingLead ? (
          <div className="animate-fade-in" style={{ padding: '2rem', background: 'white', borderRadius: '1.5rem', border: '1px solid #e2e8f0', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>FIT Tour CRM / Leads</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Chỉnh sửa Hồ sơ Lead</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Cập nhật tiến trình chăm sóc và thông tin tư vấn.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <button className="btn-pro-cancel" style={{ width: 'auto', border: 'none', background: '#f8fafc', fontWeight: 800 }} onClick={() => setEditingLead(null)}>
                <ChevronLeft size={18} strokeWidth={3} /> QUAY LẠI DANH SÁCH
              </button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="button" className="btn-pro-save" style={{ width: 'auto', background: '#10b981' }} onClick={() => handleConvertLead(editingLead.id)}>
                   <CheckCircle size={18} strokeWidth={3} /> CHỐT ĐƠN / CHUYỂN KHÁCH HÀNG
                </button>
                <button type="button" onClick={() => setEditingLead(null)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="modal-form-group">
                <label>HỌ VÀ TÊN *</label>
                <input className="modal-input" required value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>SỐ ĐIỆN THOẠI *</label>
                <input className="modal-input" value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>GIỚI TÍNH</label>
                <select className="modal-select" value={editingLead.gender || ''} onChange={e => setEditingLead({...editingLead, gender: e.target.value})}>
                  <option value="">-- Giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>EMAIL</label>
                <input className="modal-input" type="email" value={editingLead.email || ''} onChange={e => setEditingLead({...editingLead, email: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY SINH</label>
                <input className="modal-input" type="date" value={editingLead.birth_date ? (typeof editingLead.birth_date === 'string' ? editingLead.birth_date.split('T')[0] : '') : ''} onChange={e => setEditingLead({...editingLead, birth_date: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGUỒN KHÁCH HÀNG</label>
                <select className="modal-select" value={editingLead.source || ''} onChange={e => setEditingLead({...editingLead, source: e.target.value})}>
                  {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>PHÂN LOẠI KHÁCH HÀNG</label>
                <select className="modal-select" value={editingLead.classification || ''} onChange={e => setEditingLead({...editingLead, classification: e.target.value})}>
                  {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>DỊCH VỤ QUAN TÂM</label>
                <select className="modal-select" value={editingLead.tour_id || ''} onChange={e => setEditingLead({...editingLead, tour_id: e.target.value})}>
                  <option value="">Chọn tour...</option>
                  {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>TƯ VẤN VIÊN (CSKH)</label>
                <select className="modal-select" value={editingLead.assigned_to || ''} onChange={e => setEditingLead({...editingLead, assigned_to: e.target.value})}>
                   <option value="">-- Chọn nhân viên --</option>
                   {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>NHÓM BU (TƯ VẤN)</label>
                <select className="modal-select" value={editingLead.bu_group || ''} onChange={e => setEditingLead({...editingLead, bu_group: e.target.value})}>
                   <option value="">-- Chọn nhóm --</option>
                   <option value="BU1">BU1</option>
                   <option value="BU2">BU2</option>
                   <option value="BU3">BU3</option>
                   <option value="BU4">BU4</option>
                </select>
              </div>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>GHI CHÚ CHI TIẾT</label>
                <textarea className="modal-textarea" style={{ height: '100px' }} value={editingLead.consultation_note || ''} onChange={e => setEditingLead({...editingLead, consultation_note: e.target.value})} />
              </div>

              <div className="consultation-section animate-fade-in" style={{ gridColumn: 'span 2' }}>
                <h2 className="consultation-title">Lịch sử tư vấn & Chăm sóc</h2>
                <p className="consultation-subtitle">Theo dõi các lần trao đổi và ghi chú tiến trình với khách hàng.</p>
                
                <div className="note-input-container">
                  <div className="note-input-label">
                    <PlusCircle size={18} /> THÊM GHI CHÚ MỚI
                  </div>
                  <textarea 
                    className="note-textarea" 
                    placeholder="Nhập nội dung tư vấn..." 
                    value={newNote} 
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <button type="button" className="note-submit-btn" onClick={() => handleAddNoteForLead(editingLead.id)}>
                    <Send size={16} /> Gửi
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {leadNotes.map(note => (
                    <div key={note.id} style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid #eaeff4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#6366f1' }}>
                            {note.creator_name?.charAt(0) || 'U'}
                          </div>
                          <strong>{note.creator_name}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.content}</div>
                    </div>
                  ))}
                  {leadNotes.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '1rem' }}>
                      <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                      <div>Chưa có lịch sử tư vấn nào.</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-form-group">
                <label>THỜI GIAN LIÊN HỆ</label>
                <input className="modal-input" type="datetime-local" value={editingLead.last_contacted_at ? new Date(new Date(editingLead.last_contacted_at).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''} onChange={e => setEditingLead({...editingLead, last_contacted_at: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>THỜI GIAN CHỐT ĐƠN (BOOK)</label>
                <input className="modal-input" type="datetime-local" value={editingLead.won_at ? new Date(new Date(editingLead.won_at).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''} onChange={e => setEditingLead({...editingLead, won_at: e.target.value})} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
                <button type="submit" className="btn-pro-save">
                  <CheckCircle size={18} strokeWidth={3} /> CẬP NHẬT HỒ SƠ
                </button>
                <button type="button" className="btn-pro-save" style={{ background: '#10b981' }} onClick={() => handleConvertLead(editingLead.id)}>
                   <CheckCircle size={18} strokeWidth={3} /> CHỐT ĐƠN & CHUYỂN KHÁCH
                </button>
                <button type="button" className="btn-pro-cancel" onClick={() => setEditingLead(null)}>
                  <LogOut size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in">
                <div className="stats-grid">
                  <div className="stat-card purple">
                    <div className="stat-icon-bg"><UserPlus size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-label">HỒ SƠ MỚI</span>
                      <div className="stat-value">{leads.filter(l => l.status === 'Mới').length}</div>
                    </div>
                  </div>
                  <div className="stat-card orange">
                    <div className="stat-icon-bg"><MessageSquare size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-label">ĐÃ LIÊN HỆ</span>
                      <div className="stat-value">{leads.filter(l => l.status === 'Đã tư vấn' || l.status === 'Tư vấn lần 2').length}</div>
                    </div>
                  </div>
                  <div className="stat-card teal">
                    <div className="stat-icon-bg"><CheckCircle size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-label">CHỐT ĐƠN</span>
                      <div className="stat-value">{leads.filter(l => l.status === 'Chốt đơn').length}</div>
                    </div>
                  </div>
                  <div className="stat-card pink" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
                    <div className="stat-icon-bg"><TrendingUp size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-label">TỈ LỆ CHỐT ĐƠN</span>
                      <div className="stat-value">
                        {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Chốt đơn').length / leads.length) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-grid">
                  {/* Recent Activity Feed */}
                  <div className="analytics-card">
                    <h3><Clock size={20} color="#6366f1" /> Hoạt động gần đây</h3>
                    <div className="activity-list">
                      {leads.slice(0, 5).map(lead => (
                        <div key={lead.id} className="activity-item" onClick={() => { setEditingLead(lead); }}>
                          <div className="activity-icon" style={{ background: lead.status === 'Chốt đơn' ? '#dcfce7' : '#f1f5f9' }}>
                            {lead.status === 'Chốt đơn' ? <CheckCircle size={20} color="#10b981" /> : <User size={20} color="#64748b" />}
                          </div>
                          <div className="activity-details">
                            <div className="activity-name">{lead.name}</div>
                            <div className="activity-meta">
                              {lead.source} • {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div className={`activity-status badge-${lead.status}`}>
                            {lead.status}
                          </div>
                        </div>
                      ))}
                      {leads.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có hoạt động nào.</div>}
                    </div>
                  </div>

                  {/* Lead Source Distribution */}
                  <div className="analytics-card">
                    <h3><PieChart size={20} color="#f59e0b" /> Phân bổ nguồn khách</h3>
                    <div className="source-distribution">
                      {['Messenger', 'Zalo', 'Khách giới thiệu', 'Hotline'].map(source => {
                        const count = leads.filter(l => l.source === source).length;
                        const percent = leads.length > 0 ? (count / leads.length) * 100 : 0;
                        const barColors = {
                          'Messenger': '#3b82f6',
                          'Zalo': '#2563eb',
                          'Khách giới thiệu': '#10b981',
                          'Hotline': '#f59e0b'
                        };
                        return (
                          <div key={source} className="source-row">
                            <div className="source-info">
                              <span>{source}</span>
                              <span>{count} ({Math.round(percent)}%)</span>
                            </div>
                            <div className="source-bar-bg">
                              <div className="source-bar-fill" style={{ width: `${percent}%`, background: barColors[source] || '#64748b' }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <>
                <div className="stats-grid">
                  <div className="stat-card purple">
                    <div className="stat-icon-bg"><UserPlus size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-label">HỒ SƠ MỚI</span>
                      <div className="stat-value">{leads.filter(l => l.status === 'Mới').length}</div>
                    </div>
                  </div>
                  <div className="stat-card orange">
                    <div className="stat-icon-bg"><MessageSquare size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-label">ĐÃ LIÊN HỆ</span>
                      <div className="stat-value">{leads.filter(l => l.status === 'Đã tư vấn' || l.status === 'Tư vấn lần 2').length}</div>
                    </div>
                  </div>
                  <div className="stat-card teal">
                    <div className="stat-icon-bg"><CheckCircle size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-label">CHỐT ĐƠN</span>
                      <div className="stat-value">{leads.filter(l => l.status === 'Chốt đơn').length}</div>
                    </div>
                  </div>
                </div>

                <div className="filter-bar">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="filter-group">
                      <label>TÌM KIẾM</label>
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input className="filter-input" style={{ width: '100%', paddingLeft: '36px' }} placeholder="Tìm tên, SĐT..." value={leadFilters.search} onChange={e => setLeadFilters({...leadFilters, search: e.target.value})} />
                      </div>
                    </div>
                    <div className="filter-group">
                      <label>TRẠNG THÁI</label>
                      <select className="filter-select" value={leadFilters.status} onChange={e => setLeadFilters({...leadFilters, status: e.target.value})}>
                        <option value="">-- Trạng thái --</option>
                        {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>NHÓM BU</label>
                      <select className="filter-select" value={leadFilters.bu_group} onChange={e => setLeadFilters({...leadFilters, bu_group: e.target.value})}>
                        <option value="">-- Nhóm BU --</option>
                        <option value="BU1">BU1</option>
                        <option value="BU2">BU2</option>
                        <option value="BU3">BU3</option>
                        <option value="BU4">BU4</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>TƯ VẤN VIÊN</label>
                      <select className="filter-select" value={leadFilters.assigned_to} onChange={e => setLeadFilters({...leadFilters, assigned_to: e.target.value})}>
                        <option value="">-- Tư vấn viên --</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                      </select>
                    </div>
                    <button className="login-btn" style={{ 
                      width: 'auto', 
                      height: '42px', 
                      padding: '0 1.5rem', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      background: '#2563eb', 
                      color: 'white', 
                      fontWeight: '800',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                    }} onClick={() => setShowAddLeadModal(true)}>
                      <Plus size={18} strokeWidth={3} /> <span style={{ letterSpacing: '0.5px' }}>THÊM LEAD</span>
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>THỜI GIAN:</span>
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'today', label: 'Hôm nay' },
                      { id: 'week', label: 'Tuần' },
                      { id: 'month', label: 'Tháng' }
                    ].map(p => (
                      <button key={p.id} className={`preset-btn ${leadFilters.timeRange === p.id ? 'active' : ''}`} onClick={() => setLeadFilters({...leadFilters, timeRange: p.id})}>
                        {p.label}
                      </button>
                    ))}
                    <div style={{ marginLeft: 'auto', color: '#94a3b8', fontWeight: 600, background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px' }}>{filteredLeads.length} Lead</div>
                  </div>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="col-date">NGÀY TẠO</th>
                        <th className="col-info">THÔNG TIN LEAD</th>
                        <th className="col-source">NGUỒN & NHÓM</th>
                        <th className="col-staff">TƯ VẤN VIÊN</th>
                        <th className="col-status">TRẠNG THÁI TƯ VẤN</th>
                        <th className="col-contact">THỜI GIAN LIÊN HỆ</th>
                        <th className="col-actions">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="fast-add-row">
                        <td><div className="fast-add-tag"><Plus size={12} /> Nhanh</div></td>
                        <td><input className="cell-input" style={{ width: '150px' }} placeholder="Tên..." value={fastLead.name} onChange={e => setFastLead({...fastLead, name: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleFastAddLead()} /></td>
                        <td style={{ display: 'flex', gap: '2px', padding: '1rem 4px' }}>
                          <select className="cell-select" style={{ fontSize: '0.75rem', padding: '4px' }} value={fastLead.source} onChange={e => setFastLead({...fastLead, source: e.target.value})}>
                            {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <select className="cell-select" style={{ fontSize: '0.75rem', padding: '4px' }} value={fastLead.bu_group} onChange={e => setFastLead({...fastLead, bu_group: e.target.value})}>
                            <option value="">-- BU --</option>
                            <option value="BU1">BU1</option>
                            <option value="BU2">BU2</option>
                            <option value="BU3">BU3</option>
                            <option value="BU4">BU4</option>
                          </select>
                        </td>
                        <td>
                          <select className="cell-select" value={fastLead.assigned_to || ''} onChange={e => setFastLead({...fastLead, assigned_to: e.target.value})}>
                            <option value="">-- Nhân viên --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="cell-select" value={fastLead.status} onChange={e => setFastLead({...fastLead, status: e.target.value})}>
                            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>-</td>
                        <td><button className="icon-btn primary" style={{ width: '100%', background: '#4f46e5' }} onClick={handleFastAddLead}>LƯU</button></td>
                      </tr>

                      {filteredLeads.map(lead => (
                        <tr key={lead.id}>
                          <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(lead.created_at).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <div className="lead-info">
                              <span className="lead-name" style={{ fontWeight: 700 }}>
                                {lead.name}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span className="lead-phone" style={{ color: '#6366f1', fontSize: '0.85rem' }}>{lead.phone || 'Chưa có SĐT'}</span>
                                {Number(lead.notes_count) > 0 && (
                                  <div 
                                    className="note-icon-wrapper"
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      position: 'relative',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      background: '#f1f5f9',
                                      borderRadius: '6px',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setHoveredNote({ 
                                        id: lead.id, 
                                        content: lead.latest_note, 
                                        count: lead.notes_count,
                                        date: lead.latest_note_at,
                                        x: rect.left, 
                                        y: rect.top 
                                      });
                                    }} 
                                    onMouseLeave={() => setHoveredNote({ id: null, content: '', x: 0, y: 0 })}
                                  >
                                    <FileText size={16} color="#2563eb" strokeWidth={2.5} />
                                    <div className="note-badge" style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e11d48', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                      {lead.notes_count}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {getSourceIcon(lead.source)}
                                <select className="table-select-ghost" value={lead.source} onChange={e => handleQuickUpdate(lead.id, 'source', e.target.value)}>
                                  {['Messenger', 'Zalo', 'Khách giới thiệu', 'Hotline', 'Khác'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Package size={12} color="#6366f1" />
                                <select className="table-select-ghost" style={{ color: '#6366f1', fontWeight: 600 }} value={lead.bu_group || ''} onChange={e => handleQuickUpdate(lead.id, 'bu_group', e.target.value)}>
                                  <option value="">-- Nhóm --</option>
                                  {['BU1', 'BU2', 'BU3', 'BU4'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select className="table-select-ghost" style={{ fontWeight: 600 }} value={lead.assigned_to || ''} onChange={e => handleQuickUpdate(lead.id, 'assigned_to', e.target.value)}>
                              <option value="">Chưa giao</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select className={`status-select badge-${lead.status}`} value={lead.status} onChange={e => handleQuickUpdate(lead.id, 'status', e.target.value)}>
                                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <select className={`table-select-ghost classification-${lead.classification}`} style={{ fontSize: '0.65rem', padding: '2px 6px', fontWeight: 700 }} value={lead.classification || 'Mới'} onChange={e => handleQuickUpdate(lead.id, 'classification', e.target.value)}>
                                {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: '#64748b' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={10} /> LH: {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ArrowUpRight size={10} /> BOOK: {lead.won_at ? new Date(lead.won_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="icon-btn-square" title="Chỉnh sửa" onClick={() => { setEditingLead(lead); }}><Edit3 size={14} /></button>
                              <button className="icon-btn-square danger" title="Xóa" onClick={() => handleDeleteLead(lead.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hoveredNote.id && (
                  <div className="dark-tooltip animate-fade-in" style={{ 
                    position: 'fixed',
                    top: hoveredNote.y - 8,
                    left: hoveredNote.x + 20,
                    transform: 'translateY(-100%)',
                    pointerEvents: 'none',
                    zIndex: 9999
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <FileText size={14} color="#3b82f6" strokeWidth={3} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ghi chú gần nhất ({hoveredNote.count})</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#e2e8f0', fontWeight: 400, whiteSpace: 'pre-wrap' }}>
                      {hoveredNote.content || 'Không có nội dung ghi chú.'}
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(hoveredNote.date).toLocaleString('vi-VN')}</span>
                      <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>FIT Tour CRM</span>
                    </div>
                  </div>
                )}
              </>
            )}

        {activeTab === 'inbox' && (
          <div className="animate-fade-in" style={{ height: 'calc(100vh - 220px)', background: 'white', borderRadius: '1.25rem', overflow: 'hidden', display: 'grid', gridTemplateColumns: '320px 1fr', border: '1px solid #eaeff4' }}>
            <div style={{ borderRight: '1px solid #eaeff4', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff4', fontWeight: 700 }}>Hội thoại gần đây</div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.map(conv => (
                  <div key={conv.id} onClick={() => { setSelectedConv(conv); fetchMessages(conv.id); }} style={{ padding: '1.25rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc', background: selectedConv?.id === conv.id ? '#f1f5f9' : 'transparent', borderLeft: selectedConv?.id === conv.id ? '4px solid #6366f1' : '4px solid transparent' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{conv.lead_name || 'Khách Facebook'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.last_message}</div>
                  </div>
                ))}
              </div>
            </div>
            {selectedConv ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eaeff4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{selectedConv.lead_name || 'Khách vãng lai'}</div>
                  <button className="icon-btn" onClick={() => { setEditingLead(leads.find(l => l.id === selectedConv.lead_id)); }}><UserPlus size={16} /></button>
                </div>
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f8fafc' }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{ marginBottom: '1.5rem', textAlign: msg.sender_type === 'customer' ? 'left' : 'right' }}>
                      <div style={{ display: 'inline-block', padding: '0.75rem 1.25rem', borderRadius: '1rem', background: msg.sender_type === 'customer' ? 'white' : '#6366f1', color: msg.sender_type === 'customer' ? '#1e293b' : 'white', boxShadow: msg.sender_type === 'customer' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', maxWidth: '70%' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #eaeff4', display: 'flex', gap: '1rem' }}>
                  <input className="filter-input" style={{ flex: 1 }} placeholder="Nhập tin nhắn..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                  <button type="submit" className="login-btn" style={{ width: 'auto', padding: '0 1.5rem' }}>GỬI</button>
                </form>
              </div>
            ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Chọn một hội thoại để xem tin nhắn</div>}
          </div>
        )}


        {activeTab === 'tours' && (
          <div className="animate-fade-in">
            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
                <label>DANH MỤC SẢN PHẨM TOUR</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="filter-input" style={{ width: '100%', paddingLeft: '36px' }} placeholder="Tìm tên tour, điểm đến..." value={tourFilters.search} onChange={e => setTourFilters({...tourFilters, search: e.target.value})} />
                </div>
              </div>
              <button className="btn-pro-save" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setShowAddTemplateModal(true)}>
                <Plus size={18} strokeWidth={3} /> THIẾT KẾ SẢN PHẨM MỚI
              </button>
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TÊN SẢN PHẨM</th>
                    <th>ĐIỂM ĐẾN</th>
                    <th>THỜI LƯỢNG</th>
                    <th>LOẠI TOUR</th>
                    <th>GIÁ NIÊM YẾT</th>
                    <th>TAGS</th>
                  </tr>
                </thead>
                <tbody>
                  {tourTemplates.filter(t => (t.name || '').toLowerCase().includes(tourFilters.search.toLowerCase())).map(template => (
                    <tr key={template.id}>
                      <td style={{ fontWeight: 700 }}>{template.name}</td>
                      <td>{template.destination}</td>
                      <td>{template.duration}</td>
                      <td><span className="status-badge badge-potential" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>{template.tour_type || 'Standard'}</span></td>
                      <td style={{ color: 'var(--secondary)', fontWeight: 700 }}>{Number(template.base_price || template.price).toLocaleString('vi-VN')}đ</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(template.tags || '').split(',').map(tag => tag.trim() && (
                            <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#eef2ff', color: '#6366f1', borderRadius: '4px', fontWeight: 600 }}>{tag}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tourTemplates.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có sản phẩm tour nào. Hãy thiết kế sản phẩm đầu tiên!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'departures' && (
          <div className="animate-fade-in">
             <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card purple">
                <div className="stat-icon-bg"><Calendar size={24} /></div>
                <div className="stat-content">
                  <span className="stat-label">TOUR SẮP KHỞI HÀNH</span>
                  <div className="stat-value">{tourDepartures.filter(d => new Date(d.start_date) > new Date()).length}</div>
                </div>
              </div>
              <div className="stat-card teal">
                <div className="stat-icon-bg"><TrendingUp size={24} /></div>
                <div className="stat-content">
                  <span className="stat-label">LOAD FACTOR TB</span>
                  <div className="stat-value">
                    {tourDepartures.length > 0 
                      ? Math.round(tourDepartures.reduce((acc, d) => acc + (d.sold_pax / (d.max_participants || 1) * 100), 0) / tourDepartures.length) 
                      : 0}%
                  </div>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon-bg"><UserCheck size={24} /></div>
                <div className="stat-content">
                  <span className="stat-label">TOUR ĐÃ CHỐT (GUARANTEED)</span>
                  <div className="stat-value">{tourDepartures.filter(d => d.status === 'Guaranteed').length}</div>
                </div>
              </div>
            </div>

            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
                <label>LỊCH TRÌNH KHỞI HÀNH</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="filter-input" style={{ width: '100%', paddingLeft: '36px' }} placeholder="Tìm theo tên tour..." value={tourFilters.search} onChange={e => setTourFilters({...tourFilters, search: e.target.value})} />
                </div>
              </div>
              <button className="btn-pro-save" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setShowAddDepartureModal(true)}>
                <PlusCircle size={18} strokeWidth={3} /> LÊN LỊCH KHỞI HÀNH
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>NGÀY KHỞI HÀNH</th>
                    <th>TOUR / SẢN PHẨM</th>
                    <th>SL KHÁCH / MAX</th>
                    <th>LOAD FACTOR</th>
                    <th>HƯỚNG DẪN VIÊN</th>
                    <th>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {tourDepartures.filter(d => (d.template_name || '').toLowerCase().includes(tourFilters.search.toLowerCase())).map(dep => {
                    const lf = Math.round((dep.sold_pax / (dep.max_participants || 1)) * 100);
                    return (
                      <tr key={dep.id}>
                        <td style={{ fontWeight: 800, color: '#1e293b' }}>{new Date(dep.start_date).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{dep.template_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{dep.template_duration}</div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{dep.sold_pax} / {dep.max_participants}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(lf, 100)}%`, height: '100%', background: lf >= 100 ? '#10b981' : (lf >= 70 ? '#3b82f6' : '#f59e0b') }}></div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: lf >= 70 ? '#10b981' : '#64748b' }}>{lf}%</span>
                          </div>
                          {dep.break_even_pax > 0 && (
                            <div style={{ fontSize: '0.7rem', color: dep.sold_pax >= dep.break_even_pax ? '#10b981' : '#f59e0b', marginTop: '4px', fontWeight: 600 }}>
                              {dep.sold_pax >= dep.break_even_pax ? '✓ ĐÃ HÒA VỐN' : `Thiếu ${dep.break_even_pax - dep.sold_pax} khách để hòa vốn`}
                            </div>
                          )}
                        </td>
                        <td>
                          {dep.guide_name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '24px', height: '24px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#6366f1' }}>{dep.guide_name.charAt(0)}</div>
                              <span style={{ fontWeight: 600 }}>{dep.guide_name}</span>
                            </div>
                          ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa gán HDV</span>}
                        </td>
                        <td>
                          <div className={`status-badge badge-${dep.status === 'Open' ? 'potential' : (dep.status === 'Guaranteed' ? 'won' : 'lost')}`}>
                            {dep.status === 'Open' ? 'Đang nhận khách' : (dep.status === 'Guaranteed' ? 'Chắc chắn khởi hành' : dep.status)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'guides' && (
          <div className="animate-fade-in">
            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
                <label>DANH SÁCH HƯỚNG DẪN VIÊN</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="filter-input" style={{ width: '100%', paddingLeft: '36px' }} placeholder="Tìm tên, ngôn ngữ..." value={tourFilters.search} onChange={e => setTourFilters({...tourFilters, search: e.target.value})} />
                </div>
              </div>
              <button className="btn-pro-save" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setShowAddGuideModal(true)}>
                <Plus size={18} strokeWidth={3} /> THÊM HDV MỚI
              </button>
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>HỌ VÀ TÊN</th>
                    <th>LIÊN HỆ</th>
                    <th>NGÔN NGỮ</th>
                    <th>ĐÁNH GIÁ</th>
                    <th>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {guides.filter(g => (g.name || '').toLowerCase().includes(tourFilters.search.toLowerCase())).map(guide => (
                    <tr key={guide.id}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>{guide.name.charAt(0)}</div>
                          {guide.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{guide.phone}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{guide.email}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(guide.languages || '').split(',').map(lang => lang.trim() && (
                            <span key={lang} style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '4px' }}>{lang}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 800 }}>
                           <TrendingUp size={14} /> {guide.rating}
                         </div>
                      </td>
                      <td>
                        <div className={`status-badge badge-${guide.status === 'Available' ? 'won' : 'lost'}`}>
                          {guide.status === 'Available' ? 'Sẵn sàng' : guide.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="animate-fade-in">
            <div className="filter-bar">
              <div className="filter-group" style={{ flex: 1 }}>
                <label>TÌM BOOKING</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="filter-input" style={{ paddingLeft: '36px' }} placeholder="Mã booking, tên khách..." value={bookingFilters.search} onChange={e => setBookingFilters({...bookingFilters, search: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MÃ ĐƠN</th>
                    <th>KHÁCH HÀNG</th>
                    <th>TOUR</th>
                    <th>TỔNG TIỀN</th>
                    <th>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.filter(b => (b.booking_code || '').toLowerCase().includes(bookingFilters.search.toLowerCase())).map(booking => (
                    <tr key={booking.id}>
                      <td style={{ fontWeight: 700, color: '#6366f1' }}>{booking.booking_code}</td>
                      <td>{booking.customer_name}</td>
                      <td>{booking.tour_name}</td>
                      <td style={{ fontWeight: 700 }}>{Number(booking.total_price).toLocaleString('vi-VN')}đ</td>
                      <td><div className={`status-badge badge-${booking.booking_status === 'confirmed' ? 'won' : 'potential'}`}>{booking.booking_status}</div></td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có dữ liệu booking.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="animate-fade-in">
            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
                <label>TÌM KHÁCH HÀNG</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="filter-input" style={{ paddingLeft: '36px' }} placeholder="Tên, SĐT, Email..." value={customerFilters.search} onChange={e => setCustomerFilters({...customerFilters, search: e.target.value})} />
                </div>
              </div>
              <button className="btn-pro-save" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setShowAddCustomerModal(true)}>
                <UserPlus size={18} strokeWidth={3} /> THÊM KHÁCH HÀNG MỚI
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>HỌ TÊN</th>
                    <th>LIÊN HỆ / ĐỊA CHỈ</th>
                    <th>PHÂN KHÚC</th>
                    <th>LTV (TỔNG CHI)</th>
                    <th>VAI TRÒ</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.filter(c => 
                    (c.name || '').toLowerCase().includes(customerFilters.search.toLowerCase()) ||
                    (c.phone || '').includes(customerFilters.search)
                  ).map(customer => (
                    <tr key={customer.id}>
                      <td style={{ fontWeight: 700 }}>{customer.name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{customer.phone || 'N/A'}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.email || ''}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.address || ''}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${customer.customer_segment === 'VIP' ? 'badge-priority-high' : customer.customer_segment === 'Repeat Customer' ? 'badge-priority-medium' : 'badge-priority-low'}`}>
                          {customer.customer_segment}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.total_spent || 0)}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{customer.role || 'Booker'}</td>
                      <td>
                        <button className="icon-btn" onClick={() => setEditingCustomer(customer)}><Edit3 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có dữ liệu khách hàng.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <div className="stat-card" style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Cấu hình Meta Webhook</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="modal-form-group">
                  <label>APP ID</label>
                  <input className="modal-input" value={metaSettings.meta_app_id} onChange={e => setMetaSettings({...metaSettings, meta_app_id: e.target.value})} />
                </div>
                <div className="modal-form-group">
                  <label>APP SECRET</label>
                  <input className="modal-input" type="password" value={metaSettings.meta_app_secret} onChange={e => setMetaSettings({...metaSettings, meta_app_secret: e.target.value})} />
                </div>
              </div>
              <div className="modal-form-group" style={{ marginBottom: '1.5rem' }}>
                <label>PAGE ACCESS TOKEN (LONGLIVED)</label>
                <textarea className="modal-textarea" style={{ height: '100px' }} value={metaSettings.meta_page_access_token} onChange={e => setMetaSettings({...metaSettings, meta_page_access_token: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="login-btn" onClick={handleUpdateSettings}>LƯU CẤU HÌNH</button>
                <button className="login-btn" style={{ background: '#f8fafc', color: '#6366f1', border: '1px solid #6366f1' }} onClick={handleTestMeta}>KÍCH HOẠT KẾT NỐI</button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {showAddLeadModal && (
        <div className="modal-overlay" onClick={() => setShowAddLeadModal(false)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '800px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddLeadModal(false)}>
              <X size={18} strokeWidth={3} />
            </button>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hệ thống Quản lý Lead</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Thêm Lead Marketing Mới</h2>
            
            <form onSubmit={handleAddLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="modal-form-group">
                <label>TÊN KHÁCH HÀNG *</label>
                <input className="modal-input" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="Nguyễn Văn A..." />
              </div>
              <div className="modal-form-group">
                <label>SỐ ĐIỆN THOẠI</label>
                <input className="modal-input" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="0901 234..." />
              </div>

              <div className="modal-form-group">
                <label>GENDER / GIỚI TÍNH</label>
                <select className="modal-select" value={newLead.gender} onChange={e => setNewLead({...newLead, gender: e.target.value})}>
                  <option value="">-- Giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>EMAIL</label>
                <input className="modal-input" type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="email@example.com" />
              </div>

              <div className="modal-form-group">
                <label>NGÀY SINH</label>
                <input className="modal-input" type="date" value={newLead.birth_date} onChange={e => setNewLead({...newLead, birth_date: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGUỒN KHÁCH HÀNG</label>
                <select className="modal-select" value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                  {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="modal-form-group">
                <label>PHÂN LOẠI KHÁCH HÀNG</label>
                <select className="modal-select" value={newLead.classification} onChange={e => setNewLead({...newLead, classification: e.target.value})}>
                  {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>DỊCH VỤ QUAN TÂM</label>
                <select className="modal-select" value={newLead.tour_id || ''} onChange={e => setNewLead({...newLead, tour_id: e.target.value})}>
                  <option value="">Chọn tour...</option>
                  {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="modal-form-group">
                <label>TƯ VẤN VIÊN (CSKH)</label>
                <select className="modal-select" value={newLead.assigned_to || ''} onChange={e => setNewLead({...newLead, assigned_to: e.target.value})}>
                  <option value="">-- Chọn nhân viên --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>NHÓM BU (TƯ VẤN)</label>
                <select className="modal-select" value={newLead.bu_group || ''} onChange={e => setNewLead({...newLead, bu_group: e.target.value})}>
                  <option value="">-- Chọn nhóm --</option>
                  <option value="BU1">BU1</option>
                  <option value="BU2">BU2</option>
                  <option value="BU3">BU3</option>
                  <option value="BU4">BU4</option>
                </select>
              </div>
              
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>THỜI GIAN LIÊN HỆ</label>
                <input className="modal-input" type="datetime-local" value={newLead.last_contacted_at ? new Date(new Date(newLead.last_contacted_at).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''} onChange={e => setNewLead({...newLead, last_contacted_at: e.target.value})} />
              </div>

              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>GHI CHÚ BAN ĐẦU</label>
                <textarea className="modal-textarea" value={newLead.consultation_note} onChange={e => setNewLead({...newLead, consultation_note: e.target.value})} placeholder="Nội dung tư vấn sơ bộ..." />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button type="submit" className="btn-pro-save">
                  <PlusCircle size={18} strokeWidth={3} /> LƯU HỒ SƠ MỚI
                </button>
                <button type="button" className="btn-pro-cancel" onClick={() => setShowAddLeadModal(false)}>
                  <LogOut size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Thêm Khách Hàng */}
      {showAddCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🧾 THÊM KHÁCH HÀNG MỚI</h2>
              <button className="icon-btn" onClick={() => setShowAddCustomerModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddCustomer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>HỌ TÊN KHÁCH HÀNG (VIẾT HOA) *</label>
                <input className="modal-input" required 
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  value={newCustomer.name} 
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value.toUpperCase()})} 
                  placeholder="VÍ DỤ: NGUYỄN VĂN A"
                />
              </div>

              <div className="modal-form-group">
                <label>SỐ ĐIỆN THOẠI (unique) *</label>
                <input className="modal-input" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="090..." />
              </div>
              <div className="modal-form-group">
                <label>EMAIL</label>
                <input className="modal-input" type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
              </div>

              <div className="modal-form-group">
                <label>QUỐC TỊCH</label>
                <input className="modal-input" value={newCustomer.nationality} onChange={e => setNewCustomer({...newCustomer, nationality: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY SINH</label>
                <input className="modal-input" type="date" value={newCustomer.birth_date} onChange={e => setNewCustomer({...newCustomer, birth_date: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>GIỚI TÍNH</label>
                <select className="modal-select" value={newCustomer.gender} onChange={e => setNewCustomer({...newCustomer, gender: e.target.value})}>
                  <option value="">-- Giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>CCCD / PASSPORT</label>
                <input className="modal-input" value={newCustomer.id_card} onChange={e => setNewCustomer({...newCustomer, id_card: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY HẾT HẠN PASSPORT</label>
                <input className="modal-input" type="date" value={newCustomer.id_expiry} onChange={e => setNewCustomer({...newCustomer, id_expiry: e.target.value})} />
              </div>

              <div className="modal-form-group">
                <label>NƠI ĐANG Ở *</label>
                <select className="modal-select" required value={newCustomer.location_city} onChange={e => setNewCustomer({...newCustomer, location_city: e.target.value})}>
                  <option value="">-- Chọn thành phố --</option>
                  {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="modal-form-group">
                <label>ĐỊA CHỈ CHI TIẾT</label>
                <input className="modal-input" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              </div>

              <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Vai trò & Insight</div>

              <div className="modal-form-group">
                <label>VAI TRÒ</label>
                <select className="modal-select" value={newCustomer.role} onChange={e => setNewCustomer({...newCustomer, role: e.target.value})}>
                  {CUSTOMER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>PHÂN KHÚC</label>
                <select className="modal-select" value={newCustomer.customer_segment} onChange={e => setNewCustomer({...newCustomer, customer_segment: e.target.value})}>
                  {CUSTOMER_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="modal-form-group">
                <label>SỞ THÍCH TOUR (Insight)</label>
                <input className="modal-input" value={newCustomer.tour_interests} onChange={e => setNewCustomer({...newCustomer, tour_interests: e.target.value})} placeholder="Trung Quốc, Tây Tạng, Mông Cổ..." />
              </div>
              <div className="modal-form-group">
                <label>THỜI GIAN HAY ĐI (Tháng/Mùa)</label>
                <input className="modal-input" value={newCustomer.travel_season || ''} onChange={e => setNewCustomer({...newCustomer, travel_season: e.target.value})} placeholder="Tháng 10, Mùa Thu..." />
              </div>

              <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Vận hành & Ghi chú</div>

              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>YÊU CẦU ĐẶC BIỆT (Ăn chay, Sức khỏe, Visa...)</label>
                <textarea className="modal-textarea" value={newCustomer.special_requests} onChange={e => setNewCustomer({...newCustomer, special_requests: e.target.value})} placeholder="Ăn chay / dị ứng / cần chăm sóc đặc biệt..." />
              </div>

              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>GHI CHÚ NỘI BỘ (Vũ khí bí mật)</label>
                <textarea className="modal-textarea" value={newCustomer.internal_notes} onChange={e => setNewCustomer({...newCustomer, internal_notes: e.target.value})} placeholder="Tính cách: kỹ tính, khách VIP..." />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>LƯU HỒ SƠ KHÁCH HÀNG</button>
                <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddCustomerModal(false)}>HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Khách Hàng (Tương tự Thêm nhưng binding editingCustomer) */}
      {editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📝 CHỈNH SỬA KHÁCH HÀNG</h2>
              <button className="icon-btn" onClick={() => setEditingCustomer(null)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdateCustomer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>HỌ TÊN KHÁCH HÀNG (VIẾT HOA) *</label>
                <input className="modal-input" required 
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  value={editingCustomer.name} 
                  onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value.toUpperCase()})} 
                />
              </div>

              <div className="modal-form-group">
                <label>SỐ ĐIỆN THOẠI *</label>
                <input className="modal-input" required value={editingCustomer.phone} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>EMAIL</label>
                <input className="modal-input" type="email" value={editingCustomer.email || ''} onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})} />
              </div>

              <div className="modal-form-group">
                <label>QUỐC TỊCH</label>
                <input className="modal-input" value={editingCustomer.nationality || ''} onChange={e => setEditingCustomer({...editingCustomer, nationality: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY SINH</label>
                <input className="modal-input" type="date" value={editingCustomer.birth_date ? editingCustomer.birth_date.split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, birth_date: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>GIỚI TÍNH</label>
                <select className="modal-select" value={editingCustomer.gender || ''} onChange={e => setEditingCustomer({...editingCustomer, gender: e.target.value})}>
                  <option value="">-- Giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>CCCD / PASSPORT</label>
                <input className="modal-input" value={editingCustomer.id_card || ''} onChange={e => setEditingCustomer({...editingCustomer, id_card: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY HẾT HẠN PASSPORT</label>
                <input className="modal-input" type="date" value={editingCustomer.id_expiry ? editingCustomer.id_expiry.split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, id_expiry: e.target.value})} />
              </div>

              <div className="modal-form-group">
                <label>NƠI ĐANG Ở</label>
                <select className="modal-select" value={editingCustomer.location_city || ''} onChange={e => setEditingCustomer({...editingCustomer, location_city: e.target.value})}>
                  <option value="">-- Chọn thành phố --</option>
                  {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="modal-form-group">
                <label>ĐỊA CHỈ CHI TIẾT</label>
                <input className="modal-input" value={editingCustomer.address || ''} onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})} />
              </div>

              <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Vai trò & Insight</div>

              <div className="modal-form-group">
                <label>VAI TRÒ</label>
                <select className="modal-select" value={editingCustomer.role || 'booker'} onChange={e => setEditingCustomer({...editingCustomer, role: e.target.value})}>
                  {CUSTOMER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>PHÂN KHÚC</label>
                <select className="modal-select" value={editingCustomer.customer_segment || 'New Customer'} onChange={e => setEditingCustomer({...editingCustomer, customer_segment: e.target.value})}>
                  {CUSTOMER_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="modal-form-group">
                <label>SỞ THÍCH TOUR (Insight)</label>
                <input className="modal-input" value={editingCustomer.tour_interests || ''} onChange={e => setEditingCustomer({...editingCustomer, tour_interests: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>THỜI GIAN HAY ĐI (Tháng/Mùa)</label>
                <input className="modal-input" value={editingCustomer.travel_season || ''} onChange={e => setEditingCustomer({...editingCustomer, travel_season: e.target.value})} />
              </div>

              <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Lịch sử tư vấn & Chăm sóc (từ Lead)</div>
              
              <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'white', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <input 
                    className="modal-input" 
                    style={{ flex: 1, border: '1px solid #e2e8f0' }} 
                    placeholder="Nhập nội dung tư vấn mới cho khách hàng này..." 
                    value={newCustomerNote} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomerNote(e); } }}
                    onChange={e => setNewCustomerNote(e.target.value)} 
                  />
                  <button type="button" onClick={handleAddCustomerNote} className="login-btn" style={{ width: 'auto', padding: '0 1.5rem' }}>GỬI</button>
                </div>
                {editingCustomer.interaction_history && editingCustomer.interaction_history.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editingCustomer.interaction_history.map(note => (
                      <div key={note.id} style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', borderLeft: '3px solid #6366f1' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{note.creator_name}</strong>
                          <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>{note.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có lịch sử chuyển đổi hoặc ghi chú cũ.</div>
                )}
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>CẬP NHẬT THÔNG TIN</button>
                <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setEditingCustomer(null)}>ĐÓNG</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLeadForNotes && (
        <div className="modal-overlay" onClick={() => setSelectedLeadForNotes(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedLeadForNotes(null)}>
              <X size={18} strokeWidth={3} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Timeline: {selectedLeadForNotes.name}</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input className="filter-input" style={{ flex: 1 }} placeholder="Ghi chú mới..." value={newNote} onChange={e => setNewNote(e.target.value)} />
                <button type="submit" className="login-btn" style={{ width: 'auto' }}>GỬI</button>
              </form>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {leadNotes.map(note => (
                  <div key={note.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{note.creator_name}</strong>
                      <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>{note.content}</div>
                  </div>
                ))}
                {leadNotes.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Chưa có lịch sử tư vấn.</div>}
              </div>
            </div>
          </div>
        </div>
      )}


      {showAddTemplateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📦 THIẾT KẾ SẢN PHẨM TOUR MỚI</h2>
              <button className="icon-btn" onClick={() => setShowAddTemplateModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddTemplate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>TÊN TOUR / SẢN PHẨM *</label>
                <input className="modal-input" required value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Vd: Tour Bắc Kinh - Thượng Hải - Hàng Châu" />
              </div>
              <div className="modal-form-group">
                <label>ĐIỂM ĐẾN *</label>
                <input className="modal-input" required value={newTemplate.destination} onChange={e => setNewTemplate({...newTemplate, destination: e.target.value})} placeholder="Vd: Trung Quốc" />
              </div>
              <div className="modal-form-group">
                <label>THỜI LƯỢNG *</label>
                <input className="modal-input" required value={newTemplate.duration} onChange={e => setNewTemplate({...newTemplate, duration: e.target.value})} placeholder="Vd: 6N5Đ" />
              </div>
              <div className="modal-form-group">
                <label>LOẠI TOUR</label>
                <select className="modal-select" value={newTemplate.tour_type} onChange={e => setNewTemplate({...newTemplate, tour_type: e.target.value})}>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Budget">Budget</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>TAGS (CÁCH NHAU BẰNG DẤU PHẨY)</label>
                <input className="modal-input" value={newTemplate.tags} onChange={e => setNewTemplate({...newTemplate, tags: e.target.value})} placeholder="Trekking, Văn hóa, Nghỉ dưỡng..." />
              </div>
              <div className="modal-form-group">
                 <label>GIÁ NIÊM YẾT DỰ KIẾN</label>
                 <input className="modal-input" type="number" value={newTemplate.base_price} onChange={e => setNewTemplate({...newTemplate, base_price: e.target.value})} />
              </div>
              <div className="modal-form-group">
                 <label>GIÁ COST NỘI BỘ</label>
                 <input className="modal-input" type="number" value={newTemplate.internal_cost} onChange={e => setNewTemplate({...newTemplate, internal_cost: e.target.value})} />
              </div>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>MÔ TẢ NGẮN / ĐIỂM NỔI BẬT</label>
                <textarea className="modal-textarea" value={newTemplate.highlights} onChange={e => setNewTemplate({...newTemplate, highlights: e.target.value})} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>LƯU THIẾT KẾ SẢN PHẨM</button>
                <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddTemplateModal(false)}>HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddDepartureModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📅 LÊN LỊCH KHỞI HÀNH THỰC TẾ</h2>
              <button className="icon-btn" onClick={() => setShowAddDepartureModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddDeparture} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>SẢN PHẨM TOUR *</label>
                <select className="modal-select" required value={newDeparture.tour_template_id} onChange={e => setNewDeparture({...newDeparture, tour_template_id: e.target.value})}>
                  <option value="">-- Chọn sản phẩm thiết kế --</option>
                  {tourTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>NGÀY KHỞI HÀNH *</label>
                <input className="modal-input" type="date" required value={newDeparture.start_date} onChange={e => setNewDeparture({...newDeparture, start_date: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY KẾT THÚC (DỰ KIẾN)</label>
                <input className="modal-input" type="date" value={newDeparture.end_date} onChange={e => setNewDeparture({...newDeparture, end_date: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>GIÁ TOUR THỰC TẾ *</label>
                <input className="modal-input" type="number" required value={newDeparture.actual_price} onChange={e => setNewDeparture({...newDeparture, actual_price: e.target.value})} />
              </div>
              <div className="modal-form-group">
                 <label>SỐ KHÁCH TỐI ĐA (CAPACITY)</label>
                 <input className="modal-input" type="number" value={newDeparture.max_participants} onChange={e => setNewDeparture({...newDeparture, max_participants: e.target.value})} />
              </div>
              <div className="modal-form-group">
                 <label>ĐIỂM HÒA VỐN (PAX)</label>
                 <input className="modal-input" type="number" value={newDeparture.break_even_pax} onChange={e => setNewDeparture({...newDeparture, break_even_pax: e.target.value})} />
              </div>
              <div className="modal-form-group">
                 <label>HƯỚNG DẪN VIÊN</label>
                 <select className="modal-select" value={newDeparture.guide_id} onChange={e => setNewDeparture({...newDeparture, guide_id: e.target.value})}>
                    <option value="">-- Chưa gán HDV --</option>
                    {guides.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                 </select>
              </div>
              <div className="modal-form-group">
                <label>TRẠNG THÁI VẬN HÀNH</label>
                <select className="modal-select" value={newDeparture.status} onChange={e => setNewDeparture({...newDeparture, status: e.target.value})}>
                  <option value="Open">Mở bán (Open)</option>
                  <option value="Guaranteed">Chắc chắn đi (Guaranteed)</option>
                  <option value="Full">Đã đầy (Full)</option>
                  <option value="Cancelled">Hủy tour (Cancelled)</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>XÁC NHẬN KHỞI HÀNH</button>
                <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddDepartureModal(false)}>HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddGuideModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>👤 THÊM HƯỚNG DẪN VIÊN</h2>
              <button className="icon-btn" onClick={() => setShowAddGuideModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddGuide} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="modal-form-group">
                <label>HỌ VÀ TÊN HDV *</label>
                <input className="modal-input" required value={newGuide.name} onChange={e => setNewGuide({...newGuide, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>SỐ ĐIỆN THOẠI *</label>
                  <input className="modal-input" required value={newGuide.phone} onChange={e => setNewGuide({...newGuide, phone: e.target.value})} />
                </div>
                <div className="modal-form-group">
                  <label>EMAIL</label>
                  <input className="modal-input" type="email" value={newGuide.email} onChange={e => setNewGuide({...newGuide, email: e.target.value})} />
                </div>
              </div>
              <div className="modal-form-group">
                <label>NGÔN NGỮ (CÁCH NHAU BẰNG DẤU PHẨY)</label>
                <input className="modal-input" value={newGuide.languages} onChange={e => setNewGuide({...newGuide, languages: e.target.value})} placeholder="Tiếng Việt, Tiếng Trung, Tiếng Anh..." />
              </div>
              <div className="modal-form-group">
                <label>TRẠNG THÁI</label>
                <select className="modal-select" value={newGuide.status} onChange={e => setNewGuide({...newGuide, status: e.target.value})}>
                  <option value="Available">Sẵn sàng (Available)</option>
                  <option value="Busy">Đang dẫn tour (Busy)</option>
                  <option value="Inactive">Tạm nghỉ (Inactive)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>LƯU THÔNG TIN HDV</button>
                <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddGuideModal(false)}>HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className="toast">{t.message}</div>)}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/deletion" element={<DataDeletion />} />
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to={`/${activeTab}`} replace /> : (
          <div className="login-page-wrapper">
            <div className="login-glass-card shadow-2xl">
              <div className="login-brand">
                <div className="login-logo-icon">
                  <Map size={36} />
                </div>
                <h1>FIT TOUR</h1>
              </div>

              <h2>Đăng nhập hệ thống</h2>
              
              {error && (
                <div className="error-msg animate-shake mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="login-form-group">
                  <label>Tên đăng nhập</label>
                  <div className="login-input-wrapper">
                    <User size={18} />
                    <input 
                      type="text" 
                      className="login-input"
                      placeholder="Nhập username..."
                      required 
                      value={loginData.username} 
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label>Mật khẩu</label>
                  <div className="login-input-wrapper">
                    <Lock size={18} />
                    <input 
                      type="password" 
                      className="login-input"
                      placeholder="••••••••"
                      required 
                      value={loginData.password} 
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
                    />
                  </div>
                </div>

                <button type="submit" className="login-submit-btn">
                  Đăng nhập
                </button>
              </form>

              <div className="login-footer-links">
                <button type="button" onClick={() => navigate('/privacy')} className="login-footer-link">
                  Chính sách bảo mật
                </button>
                <div className="login-footer-sub">
                  <button type="button" onClick={() => navigate('/terms')} className="login-footer-link">
                    Điều khoản dịch vụ
                  </button>
                  <button type="button" className="login-footer-link" onClick={() => navigate('/deletion')}>
                    Xóa dữ liệu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} 
      />
      <Route 
        path="/:tab" 
        element={isLoggedIn ? renderDashboard() : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
