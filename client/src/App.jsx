import React, { useState, useEffect, useRef } from 'react';
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
import LeadsDashboardTab from './tabs/LeadsDashboardTab';
import StaffPerformanceTab from './tabs/StaffPerformanceTab';
import GuidesTab from './tabs/GuidesTab';
import UsersTab from './tabs/UsersTab';
import AddLeadModal from './components/modals/AddLeadModal';
import EditLeadModal from './components/modals/EditLeadModal';
import { AddCustomerModal, EditCustomerModal } from './components/modals/CustomerModals';
import { AddUserModal, EditUserModal, ChangePasswordModal } from './components/modals/UserModals';
import LeadNotesModal from './components/modals/LeadNotesModal';
import { AddTemplateModal, AddDepartureModal, EditTemplateModal } from './components/modals/TourModals';
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
  Package,
  ShoppingCart,
  UserCheck,
  Settings,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  MoreHorizontal,
  User,
  Lock,
  PieChart,
  FileText
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
    const validTabs = ['dashboard', 'leads', 'leads-dashboard', 'staff-performance', 'inbox', 'tours', 'departures', 'guides', 'bookings', 'customers', 'settings', 'users', 'bus'];
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
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [metaToken, setMetaToken] = useState('');
  const [roles, setRoles] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUserAccount, setEditingUserAccount] = useState(null);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [metaSettings, setMetaSettings] = useState({
    meta_app_id: '',
    meta_app_secret: '',
    meta_verify_token: '',
    meta_page_access_token: '',
    meta_page_id: ''
  });
  const [leadFilters, setLeadFilters] = useState({ status: '', source: '', search: '', bu_group: '', assigned_to: '', timeRange: 'today', startDate: '', endDate: '' });
  const [tourFilters, setTourFilters] = useState({ search: '', tour_type: '', destination: '' });
  const [bookingFilters, setBookingFilters] = useState({ search: '', status: '' });
  const [customerFilters, setCustomerFilters] = useState({ search: '' });
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({ 
    name: '', phone: '', email: '', gender: '', birth_date: '', 
    source: 'Messenger', tour_id: '', consultation_note: '', 
    bu_group: '', assigned_to: '', classification: 'Mới',
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

  // Sidebar Submenu State
  const [isToursMenuOpen, setIsToursMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);
  const menuTimerRef = useRef(null);

  const sidebarRef = useRef(null);

  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
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
  const [bus, setBus] = useState([]);


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
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [tourToDelete, setTourToDelete] = useState(null);

  const LEAD_SOURCES = ['Messenger', 'Zalo', 'Khách giới thiệu', 'Hotline', 'Khác'];
  const LEAD_STATUSES = ['Mới', 'Đang liên hệ', 'Tiềm năng', 'Đặt cọc', 'Chốt đơn', 'Thất bại'];
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
    const validTabs = ['dashboard', 'leads', 'leads-dashboard', 'staff-performance', 'inbox', 'tours', 'departures', 'guides', 'bookings', 'customers', 'settings', 'users', 'bus'];
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
      fetchSettings();
      fetchBUs();
    }
  }, [isLoggedIn]);

  const fetchBUs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/business-units', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBus(res.data);
    } catch (err) { console.error('Error fetching BUs:', err); }
  };

  const handleUpdateBU = async (id, payload) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/business-units/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBUs();
    } catch (err) { console.error('Error updating BU:', err); }
  };

  const handleReorderBUs = async (orders) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/business-units/reorder', { orders }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Cập nhật vị trí thành công!');
      fetchBUs();
    } catch (err) { addToast('Lỗi khi sắp xếp BU'); }
  };

  const handleCreateBU = async (payload) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/business-units', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Tạo BU mới thành công!');
      fetchBUs();
    } catch (err) { addToast('Lỗi khi tạo BU'); }
  };

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
        name: '', destination: '', duration: '', tour_type: 'Group Tour', tags: '',
        itinerary: '', highlights: '', inclusions: '', exclusions: '',
        base_price: 0, internal_cost: 0, expected_margin: 0
      });
      addToast('Đã thêm sản phẩm tour mới thành công!');
    } catch (err) { addToast('Lỗi khi thêm tour: ' + err.message); }
  };

  const handleUpdateTemplate = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/tours/${updatedData.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTourTemplates();
      setEditingTemplate(null);
      addToast('Đã cập nhật sản phẩm tour thành công!');
    } catch (err) { addToast('Lỗi khi cập nhật tour: ' + err.message); }
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
      fetchNotes(editingLead.id);
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

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch (err) { console.error('Fetch roles failed', err); }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === 'admin') {
        fetchRoles();
      }
    }
  }, [isLoggedIn, user]);

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

  const handleEditCustomer = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingCustomer(res.data);
    } catch (err) {
      addToast('Lỗi khi tải thông tin khách hàng');
      console.error(err);
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

  const handleDeleteCustomer = (id) => {
    setCustomerToDelete(id);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/customers/${customerToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa khách hàng thành công');
    } catch (err) {
      addToast('Lỗi khi xóa khách hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setCustomerToDelete(null);
      fetchCustomers();
      setLoading(false);
    }
  };

  const handleDeleteTour = (id) => {
    setTourToDelete(id);
  };

  const confirmDeleteTour = async () => {
    if (!tourToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tours/${tourToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa tour thành công');
    } catch (err) {
      addToast('Lỗi khi xóa tour: ' + (err.response?.data?.message || err.message));
    } finally {
      setTourToDelete(null);
      fetchTours();
      setLoading(false);
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
    if (leadFilters.startDate || leadFilters.endDate) {
      const leadDate = new Date(lead.created_at);
      if (leadFilters.startDate) {
        matchesTime = matchesTime && leadDate >= new Date(leadFilters.startDate);
      }
      if (leadFilters.endDate) {
        const endDate = new Date(leadFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchesTime = matchesTime && leadDate <= endDate;
      }
    } else if (leadFilters.timeRange !== 'all') {
      const now = new Date();
      const leadDate = new Date(lead.created_at);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (leadFilters.timeRange === 'today') {
        matchesTime = leadDate >= today;
      } else if (leadFilters.timeRange === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesTime = leadDate >= yesterday && leadDate < today;
      } else if (leadFilters.timeRange === 'week') {
        const firstDayOfWeek = new Date(today);
        const day = firstDayOfWeek.getDay() || 7; 
        if(day !== 1) firstDayOfWeek.setHours(-24 * (day - 1));
        matchesTime = leadDate >= firstDayOfWeek;
      } else if (leadFilters.timeRange === 'month') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesTime = leadDate >= firstDayOfMonth;
      } else if (leadFilters.timeRange === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        const firstDayOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        matchesTime = leadDate >= firstDayOfQuarter;
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

  const handleTestMeta = async (type = 'messenger') => {
    setTestLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiPath = type === 'capi' ? '/api/settings/test-capi' : '/api/messages/test-meta';
      // Always use current metaSettings value, not stale metaToken state
      const currentPageToken = metaSettings?.meta_page_access_token || metaToken;
      const payload = type === 'capi' ? {} : { token: currentPageToken };
      
      if (type !== 'capi' && !currentPageToken) {
        addToast('Vui lòng nhập Page Access Token trước khi kiểm tra!');
        setTestLoading(false);
        return;
      }

      const res = await axios.post(apiPath, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        addToast(res.data.message || 'Kiểm tra thành công!');
      } else {
        addToast(res.data.error || 'Kiểm tra thất bại.');
      }
    } catch (err) {
      addToast(err.response?.data?.error || err.response?.data?.message || 'Lỗi kết nối Meta.');
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

  const handleDeleteLead = (id) => {
    setLeadToDelete(id);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/leads/${leadToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa Lead thành công');
    } catch (err) {
      addToast('Lỗi khi xóa Lead: ' + (err.response?.data?.message || err.message));
    } finally {
      setLeadToDelete(null);
      fetchLeads();
      setLoading(false);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Thêm nhân viên mới thành công!');
      setShowAddUserModal(false);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi thêm nhân viên');
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Cập nhật nhân viên thành công!');
      setEditingUserAccount(null);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi cập nhật nhân viên');
    }
  };

  const handleChangePasswordAdmin = async (id, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/${id}/password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã đổi mật khẩu nhân viên.');
      setUserToChangePassword(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn tài khoản nhân viên. Bạn có chắc chắn?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa nhân viên.');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi xóa nhân viên');
    }
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

  const renderDashboard = () => {
    const currentUserFull = users.find(u => u.id === user?.id) || {};
    const hasPerms = currentUserFull.permissions || {};
    
    const checkView = (mod) => {
      if (user?.role === 'admin') return true;
      if (hasPerms[mod]) return hasPerms[mod].can_view === true;
      return false;
    };

    return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ padding: '8px', background: 'var(--secondary)', borderRadius: '10px', display: 'flex' }}>
            <Map size={24} color="white" />
          </div>
          FIT TOUR
        </div>

        <div className="sidebar-nav-scroll">
          <div className="nav-section-title">Tổng quan</div>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
            <LayoutDashboard /> Dashboard
          </div>
          
          {(checkView('leads') || checkView('tours')) && (
            <>
              <div className="nav-section-title">Marketing & Sales</div>
              {checkView('leads') && (
                <div 
                  className={`nav-item ${activeTab === 'leads' || activeTab === 'leads-dashboard' ? 'active-parent' : ''}`} 
                  onClick={() => navigate('/leads')}
                  style={{ justifyContent: 'space-between' }}
                  onMouseEnter={(e) => {
                    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRect(rect);
                    setHoveredMenu('leads');
                  }}
                  onMouseLeave={() => {
                    menuTimerRef.current = setTimeout(() => {
                      setHoveredMenu(null);
                    }, 150);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Users /> Lead Marketing
                  </div>
                  <ChevronRight size={14} opacity={0.5} />
                </div>
              )}
              {checkView('leads') && (
                <div className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => navigate('/inbox')}>
                  <MessageSquare /> Messenger
                </div>
              )}
            </>
          )}

          {(checkView('tours') || checkView('departures') || checkView('guides')) && (
            <>
              <div className="nav-section-title">Nghiệp vụ Lõi</div>
              
              {checkView('tours') && (
                <div 
                  className={`nav-item ${activeTab === 'tours' || activeTab === 'bus' ? 'active-parent' : ''}`}
                  onClick={() => navigate('/tours')}
                  style={{ justifyContent: 'space-between' }}
                  onMouseEnter={(e) => {
                    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRect(rect);
                    setHoveredMenu('tours');
                  }}
                  onMouseLeave={() => {
                    menuTimerRef.current = setTimeout(() => {
                      setHoveredMenu(null);
                    }, 150);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Package /> Sản phẩm Tour
                  </div>
                  <ChevronRight size={14} opacity={0.5} />
                </div>
              )}

              {checkView('departures') && (
                <div className={`nav-item ${activeTab === 'departures' ? 'active' : ''}`} onClick={() => navigate('/departures')}>
                  <Calendar /> Lịch khởi hành
                </div>
              )}
              
              {checkView('guides') && (
                <div className={`nav-item ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => navigate('/guides')}>
                  <Map /> Hướng dẫn viên
                </div>
              )}
            </>
          )}

          {(checkView('bookings') || checkView('customers')) && (
            <>
              {checkView('bookings') && (
                <div className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => navigate('/bookings')}>
                  <ShoppingCart /> Đơn hàng/Booking
                </div>
              )}
              {checkView('customers') && (
                <div className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => navigate('/customers')}>
                  <UserCheck /> Khách hàng
                </div>
              )}
            </>
          )}

          {(checkView('users') || checkView('settings')) && (
            <>
              <div className="nav-section-title">Hệ thống & Nhân sự</div>
              {checkView('users') && (
                <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => navigate('/users')}>
                  <UserCheck /> Quản lý Nhân sự
                </div>
              )}
              {checkView('settings') && (
                <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
                  <Settings /> Cấu hình Meta
                </div>
              )}
            </>
          )}

          
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="nav-item" onClick={handleLogout} style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.05)' }}>
              <LogOut size={18} /> <strong>ĐĂNG XUẤT</strong>
            </div>
          </div>
        </div>
      </aside>

      {/* Portal-like Flyout Menus */}
      {hoveredMenu === 'tours' && hoveredRect && (
        <div 
          className="submenu-flyout"
          style={{ 
            position: 'fixed', 
            left: `${hoveredRect.right + 5}px`, 
            top: `${hoveredRect.top}px`, 
            display: 'flex', 
            opacity: 1, 
            transform: 'none',
            pointerEvents: 'auto',
            zIndex: 9999
          }}
          onMouseEnter={() => {
            if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
            setHoveredMenu('tours');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'tours' ? 'active' : ''}`} 
            onClick={() => { navigate('/tours'); setHoveredMenu(null); }}
          >
            Danh sách Sản phẩm
          </div>
          <div 
            className={`submenu-item ${activeTab === 'bus' ? 'active' : ''}`} 
            onClick={() => { navigate('/bus'); setHoveredMenu(null); }} 
          >
            Quản lý Khối BU
          </div>
        </div>
      )}

      {hoveredMenu === 'leads' && hoveredRect && (
        <div 
          className="submenu-flyout"
          style={{ 
            position: 'fixed', 
            left: `${hoveredRect.right + 5}px`, 
            top: `${hoveredRect.top}px`, 
            display: 'flex', 
            opacity: 1, 
            transform: 'none',
            pointerEvents: 'auto',
            zIndex: 9999
          }}
          onMouseEnter={() => {
            if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
            setHoveredMenu('leads');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'leads' ? 'active' : ''}`} 
            onClick={() => { navigate('/leads'); setHoveredMenu(null); }}
          >
            Danh sách Lead
          </div>
          <div 
            className={`submenu-item ${activeTab === 'leads-dashboard' ? 'active' : ''}`} 
            onClick={() => { navigate('/leads-dashboard'); setHoveredMenu(null); }} 
          >
            Dashboard Thống kê
          </div>
          <div 
            className={`submenu-item ${activeTab === 'staff-performance' ? 'active' : ''}`} 
            onClick={() => { navigate('/staff-performance'); setHoveredMenu(null); }} 
          >
            Hiệu suất Nhân viên
          </div>
        </div>
      )}

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
            activeTab === 'leads-dashboard' ? 'Dashboard Lead Marketing' :
            activeTab === 'bus' ? 'Quản lý Khối Kinh doanh (BU)' :
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

        {(activeTab === 'dashboard' || activeTab === 'leads' || activeTab === 'inbox') && editingLead ? (
          <EditLeadModal 
            editingLead={editingLead}
            setEditingLead={setEditingLead}
            handleUpdateLead={handleUpdateLead}
            handleConvertLead={handleConvertLead}
            LEAD_SOURCES={LEAD_SOURCES}
            LEAD_CLASSIFICATIONS={LEAD_CLASSIFICATIONS}
            LEAD_STATUSES={LEAD_STATUSES}
            tours={tourTemplates}
            users={users}
            leadNotes={leadNotes}
            newNote={newNote}
            setNewNote={setNewNote}
            handleAddNoteForLead={handleAddNoteForLead}
            bus={bus.filter(b => b.is_active !== false || b.id === editingLead.bu_group)}
          />
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
                getSourceIcon={getSourceIcon}
                handleQuickUpdate={handleQuickUpdate}
                hoveredNote={hoveredNote}
                setHoveredNote={setHoveredNote}
                LEAD_STATUSES={LEAD_STATUSES}
                LEAD_SOURCES={LEAD_SOURCES}
                LEAD_CLASSIFICATIONS={LEAD_CLASSIFICATIONS}
                tours={tourTemplates}
                bus={bus}
              />
            )}
            {activeTab === 'leads-dashboard' && (
              <LeadsDashboardTab 
                setEditingLead={setEditingLead}
              />
            )}
            {activeTab === 'staff-performance' && (
              <StaffPerformanceTab />
            )}

        {activeTab === 'inbox' && (
          <InboxTab 
            setEditingLead={setEditingLead}
            leads={leads}
          />
        )}


        {activeTab === 'tours' && (
          <ToursTab 
            tourTemplates={tourTemplates}
            tourFilters={tourFilters}
            setTourFilters={setTourFilters}
            setShowAddTemplateModal={setShowAddTemplateModal}
            setEditingTemplate={setEditingTemplate}
            handleDeleteTour={handleDeleteTour}
            bus={bus}
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
            setEditingCustomer={handleEditCustomer}
            handleDeleteCustomer={handleDeleteCustomer}
            users={users}
          />
        )}

        {activeTab === 'users' && (user?.role === 'admin' || user?.role === 'manager') && (
          <UsersTab 
            users={users}
            roles={roles}
            currentUser={user}
            onAddUser={() => setShowAddUserModal(true)}
            onEditUser={(u) => setEditingUserAccount(u)}
            onChangePassword={(u) => setUserToChangePassword(u)}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            metaSettings={metaSettings}
            setMetaSettings={setMetaSettings}
            handleUpdateSettings={handleUpdateSettings}
            handleTestMeta={handleTestMeta}
            bus={bus}
            onUpdateBU={handleUpdateBU}
            onReorderBUs={handleReorderBUs}
            onCreateBU={handleCreateBU}
          />
        )}

        {activeTab === 'bus' && (
          <SettingsTab 
            metaSettings={{}} 
            bus={bus}
            onUpdateBU={handleUpdateBU}
            onReorderBUs={handleReorderBUs}
            onCreateBU={handleCreateBU}
            onlyBU={true}
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
        LEAD_STATUSES={LEAD_STATUSES}
        tours={tourTemplates}
        users={users}
        bus={bus.filter(b => b.is_active !== false)}
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
        users={users}
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
        users={users}
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
        bus={bus.filter(b => b.is_active !== false)}
      />

      <EditTemplateModal 
        template={editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onUpdate={handleUpdateTemplate}
        bus={bus.filter(b => b.is_active !== false || b.id === editingTemplate?.bu_group)}
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

      <AddUserModal 
        show={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSave={handleAddUser}
        roles={roles}
      />

      <EditUserModal 
        user={editingUserAccount}
        onClose={() => setEditingUserAccount(null)}
        onSave={handleUpdateUser}
        roles={roles}
      />

      <ChangePasswordModal 
        user={userToChangePassword}
        onClose={() => setUserToChangePassword(null)}
        onSave={handleChangePasswordAdmin}
      />

      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className="toast">{t.message}</div>)}
      </div>
    </div>
    );
  };

  return (
    <>
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
    {/* MODAL XÁC NHẬN XÓA (CUSTOM) */}
    {(leadToDelete || customerToDelete || tourToDelete) && (
      <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => {
        setLeadToDelete(null);
        setCustomerToDelete(null);
        setTourToDelete(null);
      }}>
        <div className="modal-content animate-slide-up" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: '60px', height: '60px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertTriangle size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Xác nhận xóa dữ liệu?</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bản ghi này khỏi hệ thống?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-pro-cancel" 
              style={{ flex: 1, border: '1px solid #e5e7eb', background: 'white' }}
              disabled={loading}
              onClick={() => {
                setLeadToDelete(null);
                setCustomerToDelete(null);
                setTourToDelete(null);
              }}
            >HỦY BỎ</button>
            <button 
              className="btn-pro-save" 
              style={{ flex: 1, background: '#ef4444', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
              onClick={() => {
                if (leadToDelete) confirmDeleteLead();
                if (customerToDelete) confirmDeleteCustomer();
                if (tourToDelete) confirmDeleteTour();
              }}
            >{loading ? 'ĐANG XÓA...' : 'XÓA THỰC SỰ'}</button>
          </div>
        </div>
      </div>
    )}
  </>
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
