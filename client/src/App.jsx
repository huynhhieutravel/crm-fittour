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

import SettingsTab from './tabs/SettingsTab';
import BookingsTab from './tabs/BookingsTab';
import CustomersTab from './tabs/CustomersTab';
import InboxTab from './tabs/InboxTab';
import ToursTab from './tabs/ToursTab';
import DeparturesTab from './tabs/DeparturesTab';
import DashboardTab from './tabs/DashboardTab';
import LeadsTab from './tabs/LeadsTab';
import GuidesTab from './tabs/GuidesTab';
import AddLeadModal from './components/modals/AddLeadModal';
import { AddCustomerModal, EditCustomerModal } from './components/modals/CustomerModals';
import LeadNotesModal from './components/modals/LeadNotesModal';
import { AddTemplateModal, AddDepartureModal } from './components/modals/TourModals';
import GuideModal from './components/modals/GuideModal';

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
  Edit2,
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
  Eye,
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
  const [editingGuide, setEditingGuide] = useState(null);

  // Gantt Chart / Timeline State
  const [guideActiveTab, setGuideActiveTab] = useState('list');
  const [guideTimelineData, setGuideTimelineData] = useState([]);
  const [guideTimeFilter, setGuideTimeFilter] = useState({
    type: 'month',
    date: new Date(),
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30))
  });
  const [guideFilters, setGuideFilters] = useState({ search: '', status: '', language: '' });


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
    setEditingGuide(null);
    setShowAddGuideModal(false);
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

  const fetchGuideTimeline = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/guides/timeline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuideTimelineData(response.data);
    } catch (err) { console.error(err); }
  };

  const handleEditGuide = (guide) => {
    setEditingGuide(guide);
    setNewGuide({
      ...guide
    });
    setShowAddGuideModal(true);
  };

  const handleUpdateGuide = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/guides/${editingGuide.id}`, newGuide, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGuides();
      setShowAddGuideModal(false);
      setEditingGuide(null);
      setNewGuide({
        name: '', phone: '', email: '', languages: '', rating: 5, status: 'Available'
      });
      addToast('Đã cập nhật thông tin HDV thành công!');
    } catch (err) { addToast('Lỗi khi cập nhật HDV: ' + err.message); }
  };

  const handleDeleteGuide = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá hướng dẫn viên này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/guides/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGuides();
      addToast('Đã xoá hướng dẫn viên!');
    } catch (err) { addToast('Lỗi khi xoá: ' + err.message); }
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
              <DashboardTab 
                leads={leads}
                setEditingLead={setEditingLead}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsTab 
                leads={leads}
                filteredLeads={filteredLeads}
                leadFilters={leadFilters}
                setLeadFilters={setLeadFilters}
                setShowAddLeadModal={setShowAddLeadModal}
                setEditingLead={setEditingLead}
                handleDeleteLead={handleDeleteLead}
                users={users}
                fastLead={fastLead}
                setFastLead={setFastLead}
                handleFastAddLead={handleFastAddLead}
                getSourceIcon={getSourceIcon}
                handleQuickUpdate={handleQuickUpdate}
                hoveredNote={hoveredNote}
                setHoveredNote={setHoveredNote}
                LEAD_STATUSES={LEAD_STATUSES}
                LEAD_SOURCES={LEAD_SOURCES}
                LEAD_CLASSIFICATIONS={LEAD_CLASSIFICATIONS}
              />
            )}

        {activeTab === 'inbox' && (
          <InboxTab 
            conversations={conversations}
            selectedConv={selectedConv}
            setSelectedConv={setSelectedConv}
            fetchMessages={fetchMessages}
            messages={messages}
            setEditingLead={setEditingLead}
            leads={leads}
            handleSendMessage={handleSendMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
          />
        )}


        {activeTab === 'tours' && (
          <ToursTab 
            tourTemplates={tourTemplates}
            tourFilters={tourFilters}
            setTourFilters={setTourFilters}
            setShowAddTemplateModal={setShowAddTemplateModal}
          />
        )}

        {activeTab === 'departures' && (
          <DeparturesTab 
            tourDepartures={tourDepartures}
            tourFilters={tourFilters}
            setTourFilters={setTourFilters}
            setShowAddDepartureModal={setShowAddDepartureModal}
          />
        )}

            {activeTab === 'guides' && (
              <GuidesTab 
                guides={guides}
                guideFilters={guideFilters}
                setGuideFilters={setGuideFilters}
                guideActiveTab={guideActiveTab}
                setGuideActiveTab={setGuideActiveTab}
                fetchGuideTimeline={fetchGuideTimeline}
                setShowAddGuideModal={setShowAddGuideModal}
                handleEditGuide={handleEditGuide}
                handleDeleteGuide={handleDeleteGuide}
                guideTimeFilter={guideTimeFilter}
                setGuideTimeFilter={setGuideTimeFilter}
                guideTimelineData={guideTimelineData}
              />
            )}

        {activeTab === 'bookings' && (
          <BookingsTab 
            bookings={bookings}
            bookingFilters={bookingFilters}
            setBookingFilters={setBookingFilters}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab 
            customers={customers}
            customerFilters={customerFilters}
            setCustomerFilters={setCustomerFilters}
            setShowAddCustomerModal={setShowAddCustomerModal}
            setEditingCustomer={setEditingCustomer}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            metaSettings={metaSettings}
            setMetaSettings={setMetaSettings}
            handleUpdateSettings={handleUpdateSettings}
            handleTestMeta={handleTestMeta}
          />
        )}
      </>
    )}
  </main>

      <AddLeadModal 
        showAddLeadModal={showAddLeadModal}
        setShowAddLeadModal={setShowAddLeadModal}
        handleAddLead={handleAddLead}
        newLead={newLead}
        setNewLead={setNewLead}
        LEAD_SOURCES={LEAD_SOURCES}
        LEAD_CLASSIFICATIONS={LEAD_CLASSIFICATIONS}
        tours={tours}
        users={users}
      />

      <AddCustomerModal 
        showAddCustomerModal={showAddCustomerModal}
        setShowAddCustomerModal={setShowAddCustomerModal}
        handleAddCustomer={handleAddCustomer}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        CITY_OPTIONS={CITY_OPTIONS}
        CUSTOMER_ROLES={CUSTOMER_ROLES}
        CUSTOMER_SEGMENTS={CUSTOMER_SEGMENTS}
      />

      <EditCustomerModal 
        editingCustomer={editingCustomer}
        setEditingCustomer={setEditingCustomer}
        handleUpdateCustomer={handleUpdateCustomer}
        CITY_OPTIONS={CITY_OPTIONS}
        CUSTOMER_ROLES={CUSTOMER_ROLES}
        CUSTOMER_SEGMENTS={CUSTOMER_SEGMENTS}
        newCustomerNote={newCustomerNote}
        setNewCustomerNote={setNewCustomerNote}
        handleAddCustomerNote={handleAddCustomerNote}
      />

      <LeadNotesModal 
        selectedLeadForNotes={selectedLeadForNotes}
        setSelectedLeadForNotes={setSelectedLeadForNotes}
        handleAddNote={handleAddNote}
        newNote={newNote}
        setNewNote={setNewNote}
        leadNotes={leadNotes}
      />

      <AddTemplateModal 
        showAddTemplateModal={showAddTemplateModal}
        setShowAddTemplateModal={setShowAddTemplateModal}
        handleAddTemplate={handleAddTemplate}
        newTemplate={newTemplate}
        setNewTemplate={setNewTemplate}
      />

      <AddDepartureModal 
        showAddDepartureModal={showAddDepartureModal}
        setShowAddDepartureModal={setShowAddDepartureModal}
        handleAddDeparture={handleAddDeparture}
        newDeparture={newDeparture}
        setNewDeparture={setNewDeparture}
        tourTemplates={tourTemplates}
        guides={guides}
      />

      <GuideModal 
        showAddGuideModal={showAddGuideModal}
        setShowAddGuideModal={setShowAddGuideModal}
        editingGuide={editingGuide}
        handleUpdateGuide={handleUpdateGuide}
        handleAddGuide={handleAddGuide}
        newGuide={newGuide}
        setNewGuide={setNewGuide}
      />

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
