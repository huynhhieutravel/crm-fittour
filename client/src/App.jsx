import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import MarketSettingsTab from './tabs/MarketSettingsTab';
import MediaSettingsTab from './tabs/MediaSettingsTab';
import AuditLogTab from './tabs/AuditLogTab';
import BookingsTab from './tabs/BookingsTab';
import CostingsTab from './tabs/CostingsTab';
import CustomersTab from './tabs/CustomersTab';
import InboxTab from './tabs/InboxTab';
import ToursTab from './tabs/ToursTab';
import DeparturesTab from './tabs/DeparturesTab';
import RemindersTab from './tabs/RemindersTab';
import HotelsTab from './tabs/HotelsTab';
import RestaurantsTab from './tabs/RestaurantsTab';
import TransportsTab from './tabs/TransportsTab';
import TicketsTab from './tabs/TicketsTab';
import AirlinesTab from './tabs/AirlinesTab';
import LandtoursTab from './tabs/LandtoursTab';
import InternalDocsTab from './tabs/InternalDocsTab';
import LicensesTab from './tabs/LicensesTab';
import BURulesTab from './tabs/BURulesTab';
import InsurancesTab from './tabs/InsurancesTab';
import OpToursTab from './tabs/OpToursTab';
import TravelSupportTab from './tabs/TravelSupportTab';
import PaymentVouchersTab from './tabs/PaymentVouchersTab';
// ═══ Tour Đoàn Tab Imports ═══
import GroupProjectsTab from './tabs/GroupProjectsTab';
import GroupLeadersTab from './tabs/GroupLeadersTab';
import B2BCompaniesTab from './tabs/B2BCompaniesTab';
import DashboardTab from './tabs/DashboardTab';
import ManagementDashboardTab from './tabs/ManagementDashboardTab';
import GroupDashboardTab from './tabs/GroupDashboardTab';
import LeadsTab from './tabs/LeadsTab';
import LeadsDashboardTab from './tabs/LeadsDashboardTab';
import StaffPerformanceTab from './tabs/StaffPerformanceTab';
import GuidesTab from './tabs/GuidesTab';
import MarketingAdsTab from './tabs/MarketingAdsTab';
import UsersTab from './tabs/UsersTab';
import StaffCalendarView from './components/StaffCalendarView';
import TeamsTab from './tabs/TeamsTab';
import ManualTab from './tabs/ManualTab';
import MyProfileTab from './tabs/MyProfileTab';
import TeamDirectoryTab from './tabs/TeamDirectoryTab';
import AddLeadModal from './components/modals/AddLeadModal';
import EditLeadModal from './components/modals/EditLeadModal';
import { AddCustomerModal, EditCustomerModal } from './components/modals/CustomerModals';
import { AddBookingModal } from './components/modals/BookingModals';
import { AddUserModal, EditUserModal, ChangePasswordModal } from './components/modals/UserModals';
import { RolePermissionModal, UserPermissionOverrideModal } from './components/modals/PermissionModals';
import LeadNotesModal from './components/modals/LeadNotesModal';
import { AddTemplateModal, AddDepartureModal, EditTemplateModal, EditDepartureModal } from './components/modals/TourModals';
import GuideModal from './components/modals/GuideModal';
import ViewDeparturePage from './pages/ViewDeparturePage';
import AgencySharePage from './pages/AgencySharePage';
import ServiceContractViewer from './pages/ServiceContractViewer';

import { 
  Menu,
  X,
  Users, 
  Map, 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  CalendarClock,
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
  Image as ImageIcon,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  MoreHorizontal,
  User,
  Lock,
  PieChart,
  FileText,
  DollarSign,
  BookOpen,
  Target,
  Shield,
  Briefcase,
  Building,
  Activity,
  MapPin
} from 'lucide-react';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletion from './pages/DataDeletion';
import OrgChartTab from './tabs/OrgChartTab';
import CskhBoardTab from './tabs/CskhBoardTab';
import CskhTodoTab from './tabs/CskhTodoTab';
import CskhSearchTab from './tabs/CskhSearchTab';
import CskhRulesTab from './tabs/CskhRulesTab';

const addToastGlobal = (message, setToasts, type = 'success') => {
  const id = Date.now();
  // Nếu có chữ "lỗi" hoặc "error" tự xem như type = 'error' để giữ lâu hơn
  const isError = type === 'error' || message.toLowerCase().includes('lỗi');
  setToasts(prev => [...prev, { id, message, type: isError ? 'error' : type }]);
  
  if (!isError) {
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000); // 5s cho thành công
  } else {
    // Thông báo lỗi cho hiển thị 15 giây hoặc đến khi user tự tắt (sẽ thêm nút X)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 15000);
  }
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.substring(1);
    if (path.startsWith('guides')) return 'guides';
    if (path.startsWith('manual')) return 'manual';
    if (path.startsWith('group/')) return path.replace('/', '-');
    const validTabs = ['dashboard', 'management-dashboard', 'leads', 'leads-dashboard', 'marketing-ads', 'staff-performance', 'inbox', 'tours', 'departures', 'guides', 'bookings', 'customers', 'settings', 'market-settings', 'media-settings', 'users', 'staff-calendar', 'teams', 'bus', 'costings', 'manual', 'hotels', 'restaurants', 'transports', 'tickets', 'airlines', 'insurances', 'internal-docs', 'licenses', 'bu-rules', 'op-tours', 'vouchers', 'travel-support', 'group-dashboard', 'group-projects', 'group-leaders', 'b2b-companies', 'accountants', 'team-directory', 'org-chart', 'my-profile', 'audit-logs'];
    return (path && validTabs.includes(path)) ? path : 'dashboard';
  });

  useEffect(() => {
    const path = location.pathname.substring(1);
    if (!path) {
      setActiveTab('dashboard');
      return;
    }
    if (path.startsWith('guides')) { setActiveTab('guides'); return; }
    if (path.startsWith('manual')) { setActiveTab('manual'); return; }
    if (path.startsWith('group/')) { setActiveTab(path.replace('/', '-')); return; }
    const validTabs = ['dashboard', 'management-dashboard', 'leads', 'leads-dashboard', 'marketing-ads', 'staff-performance', 'inbox', 'tours', 'departures', 'guides', 'bookings', 'customers', 'settings', 'market-settings', 'media-settings', 'users', 'staff-calendar', 'teams', 'bus', 'costings', 'manual', 'hotels', 'restaurants', 'transports', 'tickets', 'airlines', 'insurances', 'internal-docs', 'licenses', 'bu-rules', 'op-tours', 'vouchers', 'travel-support', 'group-dashboard', 'group-projects', 'group-leaders', 'b2b-companies', 'accountants', 'team-directory', 'org-chart', 'my-profile', 'audit-logs'];
    
    // Extracted base path (e.g., departures/view/1 -> departures)
    const basePath = path.split('/')[0];
    if (validTabs.includes(path)) {
       setActiveTab(path);
    } else if (validTabs.includes(basePath)) {
       setActiveTab(basePath);
    }
  }, [location.pathname]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inboxPsid, setInboxPsid] = useState(null);
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
  const [myPermissions, setMyPermissions] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [metaToken, setMetaToken] = useState('');
  const [roles, setRoles] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRolePermModal, setShowRolePermModal] = useState(false);
  const [userToEditPerms, setUserToEditPerms] = useState(null);
  const [editingUserAccount, setEditingUserAccount] = useState(null);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [showChangeMyPassword, setShowChangeMyPassword] = useState(false);
  const [metaSettings, setMetaSettings] = useState({
    meta_app_id: '',
    meta_app_secret: '',
    meta_verify_token: '',
    meta_page_access_token: '',
    meta_page_id: ''
  });
  const [leadFilters, setLeadFilters] = useState({ status: '', source: '', search: '', bu_group: '', assigned_to: '', timeRange: 'today', startDate: '', endDate: '', tours: [], hasPhone: '' });
  const [tourFilters, setTourFilters] = useState({ search: '', tour_type: '', destination: '', status: '', guide_id: '', timeRange: 'all', startDate: '', endDate: '' });
  const [bookingFilters, setBookingFilters] = useState({ search: '', status: '', bookingStatus: '', paymentStatus: '' });
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [customerFilters, setCustomerFilters] = useState({ search: '' });
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
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
    location_city: '', travel_season: '', created_at: new Date().toLocaleDateString('en-CA')
  });

  // Sidebar Submenu State
  const [isToursMenuOpen, setIsToursMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);
  const menuTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const sidebarRef = useRef(null);

  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showAddDepartureModal, setShowAddDepartureModal] = useState(false);
  const [showEditDepartureModal, setShowEditDepartureModal] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState(null);
  const [viewingDeparture, setViewingDeparture] = useState(null);
  const [showViewDepartureModal, setShowViewDepartureModal] = useState(false);

  const handleViewDeparture = (dep) => {
    const depId = dep.id || dep.tour_departure_id;
    navigate(`/departures/view/${depId}`);
  };

  const handleViewBookingsForDeparture = (depCode) => {
    setBookingFilters({ search: depCode, bookingStatus: '', paymentStatus: '' });
    setActiveTab('bookings');
    navigate('/bookings');
  };

  const handleOpenCustomer = async (customerId) => {
    let cust = customers.find(c => c.id === customerId);
    if (!cust) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
        cust = res.data;
      } catch (err) {
        console.error("Lỗi khi tải thông tin Khách hàng:", err);
        return;
      }
    }
    if (cust) {
      setEditingCustomer(cust);
    }
  };

  const [showAddGuideModal, setShowAddGuideModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '', destination: '', duration: '', tour_type: 'Standard', tags: '',
    itinerary: '', highlights: '', inclusions: '', exclusions: '',
    base_price: 0, internal_cost: 0, expected_margin: 0
  });

  const [newDeparture, setNewDeparture] = useState({
    tour_template_id: '', start_date: '', end_date: '', max_participants: 20, status: 'Mở bán',
    actual_price: 0, discount_price: 0,
    guide_id: '', operator_id: '', min_participants: 10, break_even_pax: 12,
    price_rules: [
      { id: Math.random().toString(36).substring(7), name: 'Người lớn', price: 0, is_default: true },
      { id: Math.random().toString(36).substring(7), name: 'Trẻ em (06-11 tuổi)', price: 0, is_default: false },
      { id: Math.random().toString(36).substring(7), name: 'Trẻ em (< 02 tuổi)', price: 0, is_default: false }
    ],
    additional_services: [],
    notes: ''
  });

  const [newGuide, setNewGuide] = useState({
    name: '', phone: '', email: '', languages: '', rating: 5, status: 'Available'
  });
  const [editingGuide, setEditingGuide] = useState(null);

  // Gantt Chart / Timeline State
  const [guideActiveTab, setGuideActiveTab] = useState(() => {
    const p = window.location.pathname.substring(1);
    if (p === 'guides/timeline') return 'timeline';
    if (p === 'guides/dashboard') return 'dashboard';
    return 'list';
  });
  const [guideTimelineData, setGuideTimelineData] = useState([]);
  const [guideStats, setGuideStats] = useState(null);
  const [guideTimeFilter, setGuideTimeFilter] = useState({
    type: 'month',
    date: new Date(),
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30))
  });
  const [guideFilters, setGuideFilters] = useState({ search: '', status: '', language: '' });
  const [customerActiveTab, setCustomerActiveTab] = useState('list');
  const [groupLeaderActiveTab, setGroupLeaderActiveTab] = useState('list');
  const [b2bActiveTab, setB2bActiveTab] = useState('list');
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
  const [leadToConvert, setLeadToConvert] = useState(null); // Fix popup close
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [tourToDelete, setTourToDelete] = useState(null);
  const [departureToDelete, setDepartureToDelete] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [transportToDelete, setTransportToDelete] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [airlineToDelete, setAirlineToDelete] = useState(null);
  const [landtourToDelete, setLandtourToDelete] = useState(null);
  const [insuranceToDelete, setInsuranceToDelete] = useState(null);
  const [b2bCompanyToDelete, setB2bCompanyToDelete] = useState(null);
  const [groupLeaderToDelete, setGroupLeaderToDelete] = useState(null);
  const [groupProjectToDelete, setGroupProjectToDelete] = useState(null);
  const [bookingToEdit, setBookingToEdit] = useState(null);

  const LEAD_SOURCES = ['Messenger', 'Zalo', 'Khách giới thiệu', 'Hotline', 'Khác'];
  const LEAD_STATUSES = ['Mới', 'Đang liên hệ', 'Tiềm năng', 'Đặt cọc', 'Chốt đơn', 'Thất bại'];
  const LEAD_CLASSIFICATIONS = ['Mới', 'Tiềm Năng', 'Tiềm Năng Cao', 'Không Tiềm Năng'];
  const CUSTOMER_ROLES = ['Người đại diện (booker)', 'Khách đi kèm'];
  const CUSTOMER_SEGMENTS = ['New Customer', 'Repeat Customer', 'VIP 3', 'VIP 2', 'VIP 1'];
  const CONTACT_METHODS = ['Zalo', 'Call', 'Email'];
  const CITY_OPTIONS = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Khác'];

  const addToast = (msg, type) => addToastGlobal(msg, setToasts, type);

  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token && config.url !== '/api/auth/login') {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const resInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Do not auto logout on 403 (Permission Denied). Only logout on 401 (Unauthorized/Token Expired)
        if (error.response && [401].includes(error.response.status)) {
          if (error.config && error.config.url !== '/api/auth/login') {
            console.error('Logout triggered by 401 on URL:', error.config.url);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setUser(null);
            navigate('/login');
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [navigate]);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  // Global listener for navigating to company detail from Calendar
  useEffect(() => {
    const handleSwitch = (e) => {
      sessionStorage.setItem('pendingCompanyOpen', e.detail);
      navigate('/group/companies');
      setActiveTab('b2b-companies');
      setB2bActiveTab('list');
    };
    const handleSwitchProject = (e) => {
      sessionStorage.setItem('pendingProjectOpen', e.detail);
      navigate('/group/projects');
      setActiveTab('group-projects');
    };
    const handleJumpToDeparture = (e) => {
      sessionStorage.setItem('pendingOpenDepartureId', e.detail);
      navigate('/op-tours');
      setActiveTab('op-tours');
    };
    window.addEventListener('switchAndOpenCompany', handleSwitch);
    window.addEventListener('switchAndOpenProject', handleSwitchProject);
    window.addEventListener('jumpToDeparture', handleJumpToDeparture);
    return () => {
      window.removeEventListener('switchAndOpenCompany', handleSwitch);
      window.removeEventListener('switchAndOpenProject', handleSwitchProject);
      window.removeEventListener('jumpToDeparture', handleJumpToDeparture);
    };
  }, [navigate]);

  // Sync activeTab with URL
  useEffect(() => {
    const fullPath = location.pathname.substring(1);
    if (fullPath.startsWith('group/')) {
      if (fullPath === 'group/companies') {
        setActiveTab('b2b-companies');
        if (location.search.includes('tab=calendar')) {
          setB2bActiveTab('calendar');
        } else {
          setB2bActiveTab('list');
        }
      } else {
        setActiveTab(fullPath.replace('/', '-'));
      }
      return;
    }
    const path = fullPath.split('/')[0];
    const validTabs = ['dashboard', 'management-dashboard', 'leads', 'leads-dashboard', 'staff-performance', 'inbox', 'tours', 'departures', 'reminders', 'guides', 'bookings', 'customers', 'settings', 'media-settings', 'users', 'staff-calendar', 'teams', 'bus', 'costings', 'manual', 'hotels', 'restaurants', 'transports', 'tickets', 'internal-docs', 'licenses', 'bu-rules', 'op-tours', 'vouchers', 'group-dashboard'];
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
      fetchMyPermissions();
    }
  }, [isLoggedIn]);

  const fetchMyPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/permissions/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPermissions(res.data.permissions);
    } catch (err) { console.error('Fetch permissions failed', err); }
  };

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

  const fetchGuideTimeline = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/guides/timeline/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuideTimelineData(response.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchGuideStats = useCallback(async (start, end) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/guides/stats', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: start, endDate: end }
      });
      setGuideStats(response.data);
    } catch (err) { 
      console.error(err); 
      setGuideStats({ error: err.response?.data?.message || err.message });
      addToast(err.response?.data?.message || err.message, 'error');
    }
  }, []);

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
    } catch (err) {
      // 409 = HDV đang gắn với tour, hỏi lại lần nữa
      if (err.response && err.response.status === 409 && err.response.data.has_deps) {
        if (window.confirm(`⚠️ ${err.response.data.message}\n\nBạn vẫn muốn xóa?`)) {
          try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/guides/${id}?force=true`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchGuides();
            addToast('Đã xoá hướng dẫn viên!');
          } catch (err2) { addToast('Lỗi khi xoá: ' + (err2.response?.data?.message || err2.message)); }
        }
      } else {
        addToast('Lỗi khi xoá: ' + (err.response?.data?.message || err.message));
      }
    }
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
        tour_template_id: '', start_date: '', end_date: '', max_participants: 20, status: 'Mở bán',
        actual_price: 0, discount_price: 0,
        guide_id: '', operator_id: '', min_participants: 10, break_even_pax: 12,
        price_rules: [
          { id: Math.random().toString(36).substring(7), name: 'Người lớn', price: 0, is_default: true },
          { id: Math.random().toString(36).substring(7), name: 'Trẻ em (06-11 tuổi)', price: 0, is_default: false },
          { id: Math.random().toString(36).substring(7), name: 'Trẻ em (< 02 tuổi)', price: 0, is_default: false }
        ],
        additional_services: [],
        notes: ''
      });
      addToast('Đã lên lịch khởi hành mới thành công!');
    } catch (err) { addToast('Lỗi khi thêm lịch khởi hành: ' + (err.response?.data?.message || err.message)); }
  };

  const handleEditDeparture = (dep) => {
    setEditingDeparture(dep);
    setShowEditDepartureModal(true);
  };

  const handleUpdateDeparture = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/departures/${updatedData.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTourDepartures();
      setShowEditDepartureModal(false);
      setEditingDeparture(null);
      addToast('Đã cập nhật lịch khởi hành thành công!');
      return null;
    } catch (err) { 
      const errorStr = err.response?.data?.message || err.message;
      addToast('Lỗi khi cập nhật lịch khởi hành: ' + errorStr); 
      return errorStr;
    }
  };

  const handleDeleteDeparture = (id) => {
    setDepartureToDelete(id);
  };

  const handleEditBooking = (booking) => {
    setBookingToEdit(booking);
    setShowAddBookingModal(true);
  };

  const handleDeleteBooking = (id) => {
    setBookingToDelete(id);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/bookings/${bookingToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
      addToast('Đã xoá đơn hàng.');
      setBookingToDelete(null);
    } catch (err) {
      if (err.response && err.response.status === 409 && err.response.data.has_transactions) {
        if (window.confirm(`⚠️ ${err.response.data.message}\n\nBạn vẫn muốn xóa?`)) {
          try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/bookings/${bookingToDelete}?force=true`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchBookings();
            addToast('Đã xoá đơn hàng.');
          } catch (err2) { addToast('Lỗi khi xoá: ' + (err2.response?.data?.message || err2.message)); }
        }
        setBookingToDelete(null);
      } else {
        addToast('Lỗi khi xoá: ' + (err.response?.data?.message || err.message)); 
        setBookingToDelete(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteHotel = async () => {
    if (!hotelToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Luôn gọi force=true vì user đã xác nhận ở modal "XÓA THỰC SỰ"
      await axios.delete(`/api/hotels/${hotelToDelete}?force=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa khách sạn thành công.');
      setHotelToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadHotels'));
    } catch (err) {
      addToast('Lỗi khi xóa khách sạn: ' + (err.response?.data?.message || err.message), 'error');
      setHotelToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteRestaurant = async () => {
    if (!restaurantToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Luôn gọi force=true vì user đã xác nhận ở modal "XÓA THỰC SỰ"
      await axios.delete(`/api/restaurants/${restaurantToDelete}?force=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa nhà hàng thành công.');
      setRestaurantToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadRestaurants'));
    } catch (err) {
      addToast('Lỗi khi xóa nhà hàng: ' + (err.response?.data?.message || err.message), 'error');
      setRestaurantToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTransport = async () => {
    if (!transportToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/transports/${transportToDelete}?force=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa nhà xe thành công.');
      setTransportToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadTransports'));
    } catch (err) {
      addToast('Lỗi khi xóa nhà xe: ' + (err.response?.data?.message || err.message), 'error');
      setTransportToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tickets/${ticketToDelete}?force=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa vé tham quan thành công.');
      setTicketToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadTickets'));
    } catch (err) {
      addToast('Lỗi khi xóa vé: ' + (err.response?.data?.message || err.message), 'error');
      setTicketToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAirline = async () => {
    if (!airlineToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/airlines/${airlineToDelete}?force=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa hãng hàng không thành công.');
      setAirlineToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadAirlines'));
    } catch (err) {
      addToast('Lỗi khi xóa: ' + (err.response?.data?.message || err.message), 'error');
      setAirlineToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteLandtour = async () => {
    if (!landtourToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/landtours/${landtourToDelete}?force=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa Land Tour thành công.');
      setLandtourToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadLandtours'));
    } catch (err) {
      addToast('Lỗi khi xóa: ' + (err.response?.data?.message || err.message), 'error');
      setLandtourToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteInsurance = async () => {
    if (!insuranceToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/insurances/${insuranceToDelete}?force=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã xóa Bảo Hiểm thành công.');
      setInsuranceToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadInsurances'));
    } catch (err) {
      addToast('Lỗi khi xóa: ' + (err.response?.data?.message || err.message), 'error');
      setInsuranceToDelete(null);
    } finally {
      setLoading(false);
    }
  };



  const confirmDeleteB2bCompany = async () => {
    if (!b2bCompanyToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/b2b-companies/${b2bCompanyToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      addToast('Đã xóa Doanh nghiệp thành công.');
      setB2bCompanyToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadB2bCompanies'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setB2bCompanyToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupLeader = async () => {
    if (!groupLeaderToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/group-leaders/${groupLeaderToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      addToast('Đã xóa Trưởng đoàn thành công.');
      setGroupLeaderToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupLeaders'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupLeaderToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupProject = async () => {
    if (!groupProjectToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/group-projects/${groupProjectToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      addToast('Đã xóa Dự án Tour thành công.');
      setGroupProjectToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupProjects'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupProjectToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteDeparture = async () => {
    if (!departureToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/departures/${departureToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTourDepartures();
      addToast('Đã xoá lịch khởi hành.');
      setDepartureToDelete(null);
    } catch (err) { 
      addToast('Lỗi khi xoá: ' + (err.response?.data?.message || err.message)); 
      setDepartureToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateDeparture = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/departures/${id}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTourDepartures();
      addToast('Đã nhân bản lịch khởi hành thành công!');
    } catch (err) { addToast('Lỗi khi nhân bản: ' + (err.response?.data?.message || err.message)); }
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
    if (!leadId) return;
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
    if (!editingLead?.id) {
       addToast('Lỗi: Lead không có ID hợp lệ.');
       return;
    }
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
        location_city: '', travel_season: '', created_at: new Date().toLocaleDateString('en-CA')
      });
      addToast('Đã thêm khách hàng mới thành công.');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert('⚠️ LỖI TRÙNG DỮ LIỆU: ' + err.response.data.message);
      } else {
        addToast(err.response?.data?.message || 'Lỗi khi thêm khách hàng');
      }
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
      };
      if (dataToSend.created_at && dataToSend.created_at.includes('T')) delete dataToSend.created_at;
      if (dataToSend.first_deal_date && dataToSend.first_deal_date.includes('T')) delete dataToSend.first_deal_date;
      if (dataToSend.birth_date) dataToSend.birth_date = new Date(dataToSend.birth_date).toLocaleDateString('en-CA');
      if (dataToSend.id_expiry) dataToSend.id_expiry = new Date(dataToSend.id_expiry).toLocaleDateString('en-CA');
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
      const res = await axios.post('/api/customers/convert', { leadId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      fetchLeads();
      setEditingLead(null);
      if (res.data && res.data.customer && res.data.customer.was_existing_customer) {
        alert('TING TING 🌱 - Gắn KPI thành công!\n\nLưu ý: Hệ thống phát hiện đây là Khách Hàng Cũ quay lại nên đã tự động gộp Nhật Ký Tư Vấn và Thông tin đơn hàng mới vào Hồ Sơ Gốc của khách này để tăng LTV (Không tạo thêm Khách rác). Quá tuyệt vời!');
        addToast('Đã gộp Lead vào Khách quen thành công!');
      } else {
        addToast('Đã chuyển đổi Lead thành Khách hàng mới thành công!');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi chuyển đổi Lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = !leadFilters.status || lead.status === leadFilters.status;
    const matchesSource = !leadFilters.source || lead.source === leadFilters.source;
    const matchesBU = !leadFilters.bu_group || (leadFilters.bu_group === 'NO_BU' ? !lead.bu_group : lead.bu_group === leadFilters.bu_group);
    const matchesStaff = !leadFilters.assigned_to || (leadFilters.assigned_to === 'NO_STAFF' ? !lead.assigned_to : lead.assigned_to === Number(leadFilters.assigned_to));
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

    let matchesTours = true;
    if (leadFilters.tours && leadFilters.tours.length > 0) {
      if (leadFilters.tours.includes('NO_TOUR')) {
        matchesTours = !lead.tour_id || leadFilters.tours.includes(String(lead.tour_id));
      } else {
        matchesTours = leadFilters.tours.includes(String(lead.tour_id));
      }
    }

    const matchesPhone = !leadFilters.hasPhone || 
      (leadFilters.hasPhone === 'yes' ? (lead.phone && lead.phone.trim() !== '') : (!lead.phone || lead.phone.trim() === ''));

    return matchesStatus && matchesSource && matchesSearch && matchesBU && matchesStaff && matchesTime && matchesTours && matchesPhone;
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

  const fetchBookings = async (page = bookingCurrentPage, filters = bookingFilters) => {
    try {
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams();
      qs.append('page', page);
      qs.append('limit', 30);
      if (filters.search) qs.append('search', filters.search);
      if (filters.bookingStatus) qs.append('status', filters.bookingStatus);
      if (filters.paymentStatus) qs.append('payment_status', filters.paymentStatus);

      const res = await axios.get(`/api/bookings?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings(res.data.data);
        setBookingTotalPages(res.data.totalPages);
        setBookingCurrentPage(res.data.page);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setTimeout(() => {
      fetchBookings(bookingCurrentPage, bookingFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [bookingFilters, bookingCurrentPage, isLoggedIn]);

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
      let apiPath = '/api/messages/test-meta';
      const currentPageToken = metaSettings?.meta_page_access_token || metaToken;
      let payload = { token: currentPageToken };

      if (type === 'capi') {
        apiPath = '/api/settings/test-capi';
        payload = {};
      } else if (type === 'catalog') {
        apiPath = '/api/meta/catalog/sync-all';
        payload = {};
      }

      if (type === 'messenger' && !currentPageToken) {
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
    
    // Hàm check quyền V2
    const checkPerm = (mod, action = 'view') => {
      if (user?.role === 'admin') return true;
      if (!myPermissions || !myPermissions[mod]) return false;
      return myPermissions[mod][action] === true;
    };

    const checkPermAny = (mod, actions = []) => {
      if (user?.role === 'admin') return true;
      if (!myPermissions || !myPermissions[mod]) return false;
      return actions.some(act => myPermissions[mod][act] === true);
    };

    const checkView = (mod) => {
      if (user?.role === 'admin') return true;
      // Trải nghiệm V2 mượt mà hơn cho Sidebar
      if (myPermissions) {
        return checkPermAny(mod, ['view', 'view_own', 'view_all']);
      }
      if (hasPerms[mod]) return hasPerms[mod].can_view === true;
      return false;
    };



  return (
    <div className="app-container">
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`} ref={sidebarRef}>
        <button className="mobile-sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={20} />
        </button>
        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title="Thu/Phóng Menu">
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', overflow: 'hidden' }}>
          <img src="/logo.png" alt="FIT TOUR" style={{ height: '40px', width: isSidebarCollapsed ? '32px' : 'auto', objectFit: isSidebarCollapsed ? 'cover' : 'contain', objectPosition: 'left' }} />
        </div>

        <div className="sidebar-nav-scroll">
          <div className="nav-section-title">Tổng quan</div>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}>
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

              <div 
                className={`nav-item ${activeTab === 'travel-support' ? 'active' : ''}`}
                onClick={() => navigate('/travel-support')}
              >
                <Briefcase /> Dịch vụ Hỗ trợ
              </div>
              {checkView('leads') && (
                <div 
                  className={`nav-item ${(activeTab === 'marketing-ads' || activeTab === 'management-dashboard') ? 'active' : ''}`} 
                  onClick={() => navigate('/marketing-ads')}
                  onMouseEnter={(e) => {
                    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRect(rect);
                    setHoveredMenu('marketing-ads');
                  }}
                  onMouseLeave={() => {
                    menuTimerRef.current = setTimeout(() => {
                      setHoveredMenu(null);
                    }, 150);
                  }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target /> Marketing Ads
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

              {checkView('op_tours') && (
                <div 
                  className={`nav-item ${activeTab === 'op-tours' || activeTab === 'costings' || activeTab === 'reminders' ? 'active-parent' : ''}`}
                  onClick={() => navigate('/op-tours')}
                  style={{ justifyContent: 'space-between' }}
                  onMouseEnter={(e) => {
                    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRect(rect);
                    setHoveredMenu('op-tours');
                  }}
                  onMouseLeave={() => {
                    menuTimerRef.current = setTimeout(() => {
                      setHoveredMenu(null);
                    }, 150);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar /> Lịch khởi hành
                  </div>
                  <ChevronRight size={14} opacity={0.5} />
                </div>
              )}

              {checkView('op_tours') && (
                <div 
                  className={`nav-item ${activeTab === 'vouchers' ? 'active' : ''}`}
                  onClick={() => navigate('/vouchers')}
                >
                  <DollarSign /> Phiếu Thu / Chi
                </div>
              )}

              {/* Old Lịch khởi hành tab removed — merged into OpTours above */}
              
              {checkView('guides') && (
                <div 
                  className={`nav-item ${activeTab === 'guides' ? 'active-parent' : ''}`} 
                  onClick={() => { navigate('/guides'); setActiveTab('guides'); setGuideActiveTab('list'); }}
                  style={{ justifyContent: 'space-between' }}
                  onMouseEnter={(e) => {
                    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRect(rect);
                    setHoveredMenu('guides');
                  }}
                  onMouseLeave={() => {
                    menuTimerRef.current = setTimeout(() => {
                      setHoveredMenu(null);
                    }, 150);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Map /> Hướng dẫn viên
                  </div>
                  <ChevronRight size={14} opacity={0.5} />
                </div>
              )}
            </>
          )}

          {(checkView('bookings') || checkView('customers')) && (
            <>
              {/* Old Đơn hàng/Booking tab removed — merged into OpTours */}
              {false && checkView('bookings') && (
                <div className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => navigate('/bookings')}>
                  <ShoppingCart /> Đơn hàng/Booking
                </div>
              )}
              {checkView('customers') && (
                <div 
                  className={`nav-item ${activeTab === 'customers' ? 'active-parent' : ''}`} 
                  onClick={() => { navigate('/customers'); setActiveTab('customers'); setCustomerActiveTab('list'); }}
                  style={{ justifyContent: 'space-between' }}
                  onMouseEnter={(e) => {
                    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRect(rect);
                    setHoveredMenu('customers');
                  }}
                  onMouseLeave={() => {
                    menuTimerRef.current = setTimeout(() => {
                      setHoveredMenu(null);
                    }, 150);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserCheck /> Khách hàng
                  </div>
                  <ChevronRight size={14} opacity={0.5} />
                </div>
              )}
            </>
          )}

          <div className="nav-section-title">Đối tác & Dịch vụ</div>
          <div 
            className={`nav-item ${['hotels', 'restaurants', 'transports', 'tickets', 'airlines', 'landtours'].includes(activeTab) ? 'active-parent' : ''}`} 
            onClick={() => { navigate('/hotels'); setActiveTab('hotels'); }}
            style={{ justifyContent: 'space-between' }}
            onMouseEnter={(e) => {
              if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredRect(rect);
              setHoveredMenu('suppliers');
            }}
            onMouseLeave={() => {
              menuTimerRef.current = setTimeout(() => {
                setHoveredMenu(null);
              }, 150);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Package /> Nhà cung cấp
            </div>
            <ChevronRight size={14} opacity={0.5} />
          </div>

          {/* ═══ TOUR ĐOÀN SECTION ═══ */}
          {(['group_projects', 'group_leaders'].some(mod => checkView(mod))) && (
            <>
              <div className="nav-section-title" style={{ color: '#d97706' }}>Tour Đoàn 🔒</div>
              {checkView('group_projects') && (
                <div 
                  className={`nav-item ${activeTab === 'group-dashboard' ? 'active' : ''}`} 
                  onClick={() => { navigate('/group/dashboard'); setActiveTab('group-dashboard'); }}
                >
                  <Activity /> Dashboard MICE
                </div>
              )}
              {checkView('group_leaders') && (
                <>
                  <div 
                    className={`nav-item ${activeTab === 'b2b-companies' ? 'active' : ''}`} 
                    onClick={() => { navigate('/group/companies'); setActiveTab('b2b-companies'); setB2bActiveTab('list'); }}
                    style={{ justifyContent: 'space-between' }}
                    onMouseEnter={(e) => {
                      if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                      setHoveredMenu('b2b-companies');
                      setHoveredRect(e.currentTarget.getBoundingClientRect());
                    }}
                    onMouseLeave={() => {
                      menuTimerRef.current = setTimeout(() => {
                        setHoveredMenu(null);
                      }, 150);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Building /> Doanh nghiệp
                    </div>
                    <ChevronRight size={14} opacity={0.5} />
                  </div>
                  <div 
                    className={`nav-item ${activeTab === 'group-leaders' ? 'active' : ''}`} 
                    onClick={() => { navigate('/group/leaders'); setActiveTab('group-leaders'); }}
                  >
                    <Users /> Trưởng đoàn
                  </div>
                </>
              )}
              {checkView('group_projects') && (
                <div 
                  className={`nav-item ${activeTab === 'group-projects' ? 'active' : ''}`} 
                  onClick={() => { navigate('/group/projects'); setActiveTab('group-projects'); }}
                >
                  <Briefcase /> Dự án Tour (MICE)
                </div>
              )}

            </>
          )}

          {(checkView('users') || checkView('settings')) && (
            <>
              <div className="nav-section-title">Hệ thống & Nhân sự</div>
              {checkView('users') && (
                <div 
                  className={`nav-item ${['users','staff-calendar','teams'].includes(activeTab) ? 'active' : ''}`} 
                  onClick={() => { navigate('/users'); setActiveTab('users'); }}
                  style={{ justifyContent: 'space-between' }}
                  onMouseEnter={(e) => {
                    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRect(rect);
                    setHoveredMenu('hr-menu');
                  }}
                  onMouseLeave={() => {
                    menuTimerRef.current = setTimeout(() => {
                      setHoveredMenu(null);
                    }, 150);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserCheck /> Quản lý Nhân sự
                  </div>
                  <ChevronRight size={14} opacity={0.5} />
                </div>
              )}
              {checkView('settings') && (
                <div className={`nav-item ${activeTab === 'market-settings' ? 'active' : ''}`} onClick={() => navigate('/market-settings')}>
                  <MapPin /> Quản lý Thị trường
                </div>
              )}
              {checkView('settings') && (
                <>
                  <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
                    <Settings /> Cấu hình Meta
                  </div>
                  <div className={`nav-item ${activeTab === 'media-settings' ? 'active' : ''}`} onClick={() => navigate('/media-settings')}>
                    <ImageIcon /> Quản lý Media (Rác)
                  </div>
                  <div className={`nav-item ${activeTab === 'audit-logs' ? 'active' : ''}`} onClick={() => navigate('/audit-logs')}>
                    <Activity /> Nhật ký hệ thống
                  </div>
                </>
              )}
            </>
          )}

          <div className="nav-section-title">Tài Liệu Nội Bộ</div>
          <div className={`nav-item ${activeTab === 'internal-docs' ? 'active' : ''}`} onClick={() => navigate('/internal-docs')}>
            <FileText /> Quy chế lương HDV
          </div>
          <div className={`nav-item ${activeTab === 'licenses' ? 'active' : ''}`} onClick={() => navigate('/licenses')}>
            <FileText /> Biểu Mẫu Văn Phòng
          </div>
          <div className={`nav-item ${activeTab === 'bu-rules' ? 'active' : ''}`} onClick={() => navigate('/bu-rules')}>
            <FileText /> Quy tắc chọn BU
          </div>

          <div className="nav-section-title">Trợ giúp & Hướng dẫn</div>
          <div 
            className={`nav-item ${activeTab === 'manual' ? 'active-parent' : ''}`} 
            onClick={() => navigate('/manual/overview')}
            style={{ justifyContent: 'space-between' }}
            onMouseEnter={(e) => {
              if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredRect(rect);
              setHoveredMenu('manual');
            }}
            onMouseLeave={() => {
              menuTimerRef.current = setTimeout(() => {
                setHoveredMenu(null);
              }, 150);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BookOpen size={18} /> Sổ tay Hướng dẫn
            </div>
            <ChevronRight size={14} opacity={0.5} />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className={`nav-item ${activeTab === 'team-directory' ? 'active' : ''}`} onClick={() => { navigate('/team-directory'); setActiveTab('team-directory'); }} style={{ color: '#f59e0b', background: activeTab === 'team-directory' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.03)', marginBottom: '5px' }}>
              <Users size={18} /> <strong>NHÂN SỰ FIT TOUR</strong>
            </div>
            <div className={`nav-item ${activeTab === 'org-chart' ? 'active' : ''}`} onClick={() => { navigate('/org-chart'); setActiveTab('org-chart'); }} style={{ color: '#10b981', background: activeTab === 'org-chart' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.03)', marginBottom: '5px' }}>
              <Target size={18} /> <strong>SƠ ĐỒ TỔ CHỨC</strong>
            </div>
            <div className={`nav-item ${activeTab === 'my-profile' ? 'active' : ''}`} onClick={() => { navigate('/my-profile'); setActiveTab('my-profile'); }} style={{ color: '#a78bfa', background: activeTab === 'my-profile' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(167, 139, 250, 0.03)', marginBottom: '5px' }}>
              <User size={18} /> <strong>TRANG CÁ NHÂN</strong>
            </div>
            <div className="nav-item" onClick={() => setShowChangeMyPassword(true)} style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.05)', marginBottom: '5px' }}>
              <Lock size={18} /> <strong>ĐỔI MẬT KHẨU</strong>
            </div>
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

      {hoveredMenu === 'marketing-ads' && hoveredRect && (
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
            setHoveredMenu('marketing-ads');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'marketing-ads' ? 'active' : ''}`} 
            onClick={() => { navigate('/marketing-ads'); setHoveredMenu(null); }} 
          >
            Quản trị Chiến dịch (Data/KPI)
          </div>
          <div 
            className={`submenu-item ${activeTab === 'management-dashboard' ? 'active' : ''}`} 
            onClick={() => { navigate('/management-dashboard'); setHoveredMenu(null); }} 
            style={{ borderTop: '1px solid #e2e8f0', marginTop: '4px', paddingTop: '8px', color: '#db2777', fontWeight: 'bold' }}
          >
            📈 Tổng Quan Marketing
          </div>
        </div>
      )}

      {/* Old departures flyout removed — replaced by op-tours flyout */}

      {hoveredMenu === 'op-tours' && hoveredRect && (
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
            setHoveredMenu('op-tours');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'op-tours' ? 'active' : ''}`} 
            onClick={() => { navigate('/op-tours'); setHoveredMenu(null); }}
          >
            Danh sách Lịch khởi hành
          </div>
          {(user?.role === 'admin' || user?.role === 'operations' || user?.role === 'manager') && (
            <div 
              className={`submenu-item ${activeTab === 'costings' ? 'active' : ''}`} 
              onClick={() => { navigate('/costings'); setHoveredMenu(null); }} 
            >
              Bảng Dự Toán Tour
            </div>
          )}
          <div 
            className={`submenu-item ${activeTab === 'reminders' ? 'active' : ''}`} 
            onClick={() => { navigate('/reminders'); setHoveredMenu(null); }}
          >
            Tiến độ Chăm sóc (Tour Care)
          </div>
        </div>
      )}

      {hoveredMenu === 'guides' && hoveredRect && (
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
            setHoveredMenu('guides');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'guides' && guideActiveTab === 'list' ? 'active' : ''}`} 
            onClick={() => { navigate('/guides'); setActiveTab('guides'); setGuideActiveTab('list'); setHoveredMenu(null); }}
          >
            Danh sách HDV
          </div>
          <div 
            className={`submenu-item ${activeTab === 'guides' && guideActiveTab === 'timeline' ? 'active' : ''}`} 
            onClick={() => { navigate('/guides/timeline'); setActiveTab('guides'); setGuideActiveTab('timeline'); setHoveredMenu(null); }}
          >
            Lịch phân công
          </div>
          <div 
            className={`submenu-item ${activeTab === 'guides' && guideActiveTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => { navigate('/guides/dashboard'); setActiveTab('guides'); setGuideActiveTab('dashboard'); setHoveredMenu(null); }}
          >
            Dashboard Thống kê
          </div>
        </div>
      )}

      {hoveredMenu === 'customers' && hoveredRect && (
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
            setHoveredMenu('customers');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'customers' && customerActiveTab === 'list' ? 'active' : ''}`} 
            onClick={() => { navigate('/customers'); setActiveTab('customers'); setCustomerActiveTab('list'); setHoveredMenu(null); }}
          >
            📋 Danh sách Khách hàng
          </div>
          <div 
            className={`submenu-item ${activeTab === 'customers' && customerActiveTab === 'calendar' ? 'active' : ''}`} 
            onClick={() => { navigate('/customers'); setActiveTab('customers'); setCustomerActiveTab('calendar'); setHoveredMenu(null); }}
          >
            📅 Lịch Chăm sóc
          </div>
          <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
          <div 
            className={`submenu-item ${activeTab === 'customers' && customerActiveTab === 'cskh-board' ? 'active' : ''}`} 
            onClick={() => { navigate('/customers'); setActiveTab('customers'); setCustomerActiveTab('cskh-board'); setHoveredMenu(null); }}
          >
            🏥 CSKH Board
          </div>
          <div 
            className={`submenu-item ${activeTab === 'customers' && customerActiveTab === 'cskh-todo' ? 'active' : ''}`} 
            onClick={() => { navigate('/customers'); setActiveTab('customers'); setCustomerActiveTab('cskh-todo'); setHoveredMenu(null); }}
          >
            ✅ Todo List
          </div>
          <div 
            className={`submenu-item ${activeTab === 'customers' && customerActiveTab === 'cskh-search' ? 'active' : ''}`} 
            onClick={() => { navigate('/customers'); setActiveTab('customers'); setCustomerActiveTab('cskh-search'); setHoveredMenu(null); }}
          >
            🔍 Tìm KH hàng loạt
          </div>
          <div 
            className={`submenu-item ${activeTab === 'customers' && customerActiveTab === 'cskh-rules' ? 'active' : ''}`} 
            onClick={() => { navigate('/customers'); setActiveTab('customers'); setCustomerActiveTab('cskh-rules'); setHoveredMenu(null); }}
          >
            ⚙️ Cấu hình Rules
          </div>
        </div>
      )}

      {hoveredMenu === 'suppliers' && hoveredRect && (
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
            setHoveredMenu('suppliers');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'hotels' ? 'active' : ''}`} 
            onClick={() => { navigate('/hotels'); setActiveTab('hotels'); setHoveredMenu(null); }}
          >
            Quản lý Khách sạn
          </div>
          <div 
            className={`submenu-item ${activeTab === 'restaurants' ? 'active' : ''}`} 
            onClick={() => { navigate('/restaurants'); setActiveTab('restaurants'); setHoveredMenu(null); }}
          >
            Quản lý Nhà hàng
          </div>
          <div 
            className={`submenu-item ${activeTab === 'transports' ? 'active' : ''}`} 
            onClick={() => { navigate('/transports'); setActiveTab('transports'); setHoveredMenu(null); }}
          >
            Quản lý Nhà xe
          </div>
          <div 
            className={`submenu-item ${activeTab === 'tickets' ? 'active' : ''}`} 
            onClick={() => { navigate('/tickets'); setActiveTab('tickets'); setHoveredMenu(null); }}
          >
            Quản lý Vé Tham Quan
          </div>
          <div 
            className={`submenu-item ${activeTab === 'airlines' ? 'active' : ''}`} 
            onClick={() => { navigate('/airlines'); setActiveTab('airlines'); setHoveredMenu(null); }}
          >
            Quản lý Vé máy bay
          </div>
          <div 
            className={`submenu-item ${activeTab === 'landtours' ? 'active' : ''}`} 
            onClick={() => { navigate('/landtours'); setActiveTab('landtours'); setHoveredMenu(null); }}
          >
            Quản lý Land Tour
          </div>
          <div 
            className={`submenu-item ${activeTab === 'insurances' ? 'active' : ''}`} 
            onClick={() => { navigate('/insurances'); setActiveTab('insurances'); setHoveredMenu(null); }}
          >
            Quản lý Bảo Hiểm
          </div>
        </div>
      )}

      {hoveredMenu === 'hr-menu' && hoveredRect && (
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
            setHoveredMenu('hr-menu');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => { navigate('/users'); setActiveTab('users'); setHoveredMenu(null); }}
          >
            👥 Danh sách Nhân sự
          </div>
          <div 
            className={`submenu-item ${activeTab === 'staff-calendar' ? 'active' : ''}`} 
            onClick={() => { navigate('/staff-calendar'); setActiveTab('staff-calendar'); setHoveredMenu(null); }}
          >
            🎂 Lịch Nhân sự
          </div>
          {(user?.role === 'admin') && (
            <div 
              className={`submenu-item ${activeTab === 'teams' ? 'active' : ''}`} 
              onClick={() => { navigate('/teams'); setActiveTab('teams'); setHoveredMenu(null); }}
            >
              🏢 Quản lý Team
            </div>
          )}
        </div>
      )}

      {hoveredMenu === 'b2b-companies' && hoveredRect && (
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
            setHoveredMenu('b2b-companies');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div 
            className={`submenu-item ${activeTab === 'b2b-companies' && b2bActiveTab === 'list' ? 'active' : ''}`} 
            onClick={() => { navigate('/group/companies'); setActiveTab('b2b-companies'); setB2bActiveTab('list'); setHoveredMenu(null); }}
          >
            Danh sách Doanh nghiệp
          </div>
          <div 
            className={`submenu-item ${activeTab === 'b2b-companies' && b2bActiveTab === 'calendar' ? 'active' : ''}`} 
            onClick={() => { navigate('/group/companies?tab=calendar'); setActiveTab('b2b-companies'); setB2bActiveTab('calendar'); setHoveredMenu(null); }}
          >
            Lịch Chăm Sóc B2B
          </div>
        </div>
      )}

      
      {hoveredMenu === 'manual' && hoveredRect && (
        <div 
          className="submenu-flyout"
          style={{ 
            position: 'fixed', 
            left: `${hoveredRect.right + 5}px`, 
            top: `${Math.min(hoveredRect.top, window.innerHeight - 400)}px`, 
            display: 'flex', 
            opacity: 1, 
             transform: 'none',
            pointerEvents: 'auto',
            zIndex: 9999,
            maxHeight: '400px',
            flexDirection: 'column',
            overflowY: 'auto'
          }}
          onMouseEnter={() => {
            if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
            setHoveredMenu('manual');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          <div className="submenu-item" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', padding: '8px 16px', background: 'transparent' }}>
            Giới thiệu & Cơ Bản
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && (!pathParts[1] || pathParts[1] === 'overview') ? 'active' : ''}`} onClick={() => { navigate('/manual/overview'); setHoveredMenu(null); }}>
            Phân quyền hệ thống
          </div>
          
          <div className="submenu-item" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', padding: '8px 16px', background: 'transparent', marginTop: '4px' }}>
            Sales & Marketing
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'leads-sop' ? 'active' : ''}`} onClick={() => { navigate('/manual/leads-sop'); setHoveredMenu(null); }}>
            Lead - Quy Định (SOP)
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'leads-guide' ? 'active' : ''}`} onClick={() => { navigate('/manual/leads-guide'); setHoveredMenu(null); }}>
            Lead - HD Sử Dụng
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'customers-sop' ? 'active' : ''}`} onClick={() => { navigate('/manual/customers-sop'); setHoveredMenu(null); }}>
            Khách Hàng - Quy Định
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'customers-guide' ? 'active' : ''}`} onClick={() => { navigate('/manual/customers-guide'); setHoveredMenu(null); }}>
            Khách Hàng - HD Sử Dụng
          </div>

          <div className="submenu-item" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', padding: '8px 16px', background: 'transparent', marginTop: '4px' }}>
            Điều hành & Lõi
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'bookings' ? 'active' : ''}`} onClick={() => { navigate('/manual/bookings'); setHoveredMenu(null); }}>
            Đơn hàng & Dòng tiền
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'tours-sop' ? 'active' : ''}`} onClick={() => { navigate('/manual/tours-sop'); setHoveredMenu(null); }}>
            Tour - Quy Định (SOP)
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'tours-guide' ? 'active' : ''}`} onClick={() => { navigate('/manual/tours-guide'); setHoveredMenu(null); }}>
            Tour - HD Sử Dụng
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'departures-sop' ? 'active' : ''}`} onClick={() => { navigate('/manual/departures-sop'); setHoveredMenu(null); }}>
            Lịch KH - Quy Định
          </div>
          <div className={`submenu-item ${activeTab === 'manual' && pathParts[1] === 'departures-guide' ? 'active' : ''}`} onClick={() => { navigate('/manual/departures-guide'); setHoveredMenu(null); }}>
            Lịch KH - HD Sử Dụng
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="breadcrumb-container">
          <div className="breadcrumb">CRM / {
              activeTab === 'op-tours' ? 'LỊCH KHỞI HÀNH' : 
              activeTab === 'management-dashboard' ? 'TỔNG QUAN MARKETING' : 
              activeTab.toUpperCase()
          }</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          </div>
        </div>

        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="mobile-header-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <h1>{
            activeTab === 'dashboard' ? 'Tổng quan hệ thống' : 
            activeTab === 'leads' ? 'Quản lý Lead Marketing' : 
            activeTab === 'leads-dashboard' ? 'Dashboard Lead Marketing' :
            activeTab === 'management-dashboard' ? 'Tổng quan Marketing' :
            activeTab === 'bus' ? 'Quản lý Khối Kinh doanh (BU)' :
            activeTab === 'internal-docs' ? 'Quy chế lương HDV' :
            activeTab === 'licenses' ? 'Biểu Mẫu Văn Phòng' :
            activeTab === 'bu-rules' ? 'Quy tắc chọn BU cho Lead' :
            activeTab === 'manual' ? 'Sổ tay HDSD CRM' :
            activeTab === 'op-tours' ? 'Lịch khởi hành' :
            activeTab === 'team-directory' ? 'Nhân Sự FIT Tour' :
            activeTab === 'my-profile' ? 'Trang cá nhân' :
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          }</h1>
          </div>
          <div className="user-profile" onClick={() => navigate('/my-profile')} style={{ cursor: 'pointer' }} title="Trang cá nhân">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.username || 'Người dùng'}</div>
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
            handleConvertLead={(leadId) => setLeadToConvert(leads.find(l => l.id === leadId))}
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
            loading={loading}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab 
                leads={leads}
                setEditingLead={setEditingLead}
              />
            )}
            
            {/* Management Dashboard now standalone route from the sub-menu */}
            {activeTab === 'management-dashboard' && (
              <ManagementDashboardTab user={user} />
            )}

            {activeTab === 'manual' && <ManualTab />}
            {activeTab === 'internal-docs' && <InternalDocsTab />}
            {activeTab === 'licenses' && <LicensesTab currentUser={user} addToast={addToast} />}
            {activeTab === 'bu-rules' && <BURulesTab currentUser={user} />}

            {activeTab === 'leads' && (
              <LeadsTab 
                currentUser={user}
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
                fetchLeads={fetchLeads}
                handleConvertLead={(leadId) => setLeadToConvert(leads.find(l => l.id === leadId))}
                navigateToInbox={(psid) => { setInboxPsid(psid); navigate('/inbox'); setActiveTab('inbox'); }}
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

            {activeTab === 'marketing-ads' && (
              <MarketingAdsTab addToast={addToast} currentUser={user} bus={bus.filter(b => b.is_active !== false)} />
            )}

        {activeTab === 'inbox' && (
          <InboxTab 
            setEditingLead={setEditingLead}
            leads={leads}
            initialPsid={inboxPsid}
            clearInitialPsid={() => setInboxPsid(null)}
            onGoBack={() => {
              setInboxPsid(null);
              navigate('/leads');
              setActiveTab('leads');
            }}
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
            handleUpdateTemplate={handleUpdateTemplate}
            bus={bus}
            currentUser={user}
          />
        )}

        {activeTab === 'op-tours' && (
          <OpToursTab currentUser={user} />
        )}

        {activeTab === 'vouchers' && (
          <PaymentVouchersTab currentUser={user} />
        )}

        {activeTab === 'travel-support' && (
          <TravelSupportTab users={users} currentUser={user} checkPerm={checkPerm} />
        )}

        {activeTab === 'departures' && pathParts[1] === 'view' && pathParts[2] && (
          <ViewDeparturePage departureId={pathParts[2]} handleOpenCustomer={handleOpenCustomer} guides={guides} handleEditDeparture={handleEditDeparture} />
        )}

        {activeTab === 'departures' && (!pathParts[1]) && (
          <DeparturesTab 
            tourDepartures={tourDepartures}
            tourFilters={tourFilters}
            setTourFilters={setTourFilters}
            setShowAddDepartureModal={setShowAddDepartureModal}
            handleEditDeparture={handleEditDeparture}
            handleDeleteDeparture={handleDeleteDeparture}
            handleDuplicateDeparture={handleDuplicateDeparture}
            handleUpdateDeparture={handleUpdateDeparture}
            handleViewDeparture={handleViewDeparture}
            handleViewBookingsForDeparture={handleViewBookingsForDeparture}
            guides={guides}
            currentUser={user}
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
                guideStats={guideStats}
                fetchGuideStats={fetchGuideStats}
                hoveredNote={hoveredNote}
                setHoveredNote={setHoveredNote}
                tourDepartures={tourDepartures}
                handleEditDeparture={handleEditDeparture}
              />
            )}

        {activeTab === 'bookings' && (
          <BookingsTab 
            bookings={bookings}
            bookingFilters={bookingFilters}
            setBookingFilters={setBookingFilters}
            bookingCurrentPage={bookingCurrentPage}
            setBookingCurrentPage={setBookingCurrentPage}
            bookingTotalPages={bookingTotalPages}
            setShowAddBookingModal={setShowAddBookingModal}
            handleDeleteBooking={handleDeleteBooking}
            handleEditBooking={handleEditBooking}
          />
        )}

        {activeTab === 'costings' && (
          <CostingsTab user={user} />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab handleViewDeparture={handleViewDeparture} />
        )}

        {activeTab === 'customers' && customerActiveTab !== 'cskh-board' && customerActiveTab !== 'cskh-todo' && customerActiveTab !== 'cskh-search' && customerActiveTab !== 'cskh-rules' && (
          <CustomersTab 
            customers={customers}
            customerFilters={customerFilters}
            setCustomerFilters={setCustomerFilters}
            setShowAddCustomerModal={setShowAddCustomerModal}
            setEditingCustomer={handleEditCustomer}
            handleDeleteCustomer={handleDeleteCustomer}
            users={users}
            customerActiveTab={customerActiveTab}
          />
        )}

        {activeTab === 'customers' && customerActiveTab === 'cskh-board' && (
          <CskhBoardTab users={users} />
        )}

        {activeTab === 'customers' && customerActiveTab === 'cskh-todo' && (
          <CskhTodoTab users={users} customers={customers} />
        )}

        {activeTab === 'customers' && customerActiveTab === 'cskh-search' && (
          <CskhSearchTab users={users} tourTemplates={tourTemplates} />
        )}

        {activeTab === 'customers' && customerActiveTab === 'cskh-rules' && (
          <CskhRulesTab />
        )}

        {activeTab === 'users' && (checkPerm('users', 'view') || user?.role === 'admin' || user?.role === 'manager') && (
          <UsersTab 
            users={users}
            roles={roles}
            currentUser={user}
            checkPerm={checkPerm}
            onAddUser={() => setShowAddUserModal(true)}
            onEditUser={(u) => setEditingUserAccount(u)}
            onChangePassword={(u) => setUserToChangePassword(u)}
            onDeleteUser={handleDeleteUser}
            onEditRolePerms={() => setShowRolePermModal(true)}
            onEditUserPerms={(u) => setUserToEditPerms(u)}
          />
        )}

        {activeTab === 'staff-calendar' && (checkPerm('users', 'view') || user?.role === 'admin' || user?.role === 'manager') && (
          <div className="content-area">
            <div className="content-header">
              <h1>Lịch Sinh nhật & Kỷ niệm Nhân sự</h1>
            </div>
            <StaffCalendarView users={users} />
          </div>
        )}

        {activeTab === 'teams' && user?.role === 'admin' && (
          <TeamsTab addToast={addToast} users={users} />
        )}

        {activeTab === 'my-profile' && (
          <MyProfileTab currentUser={user} addToast={addToast} />
        )}

        {activeTab === 'team-directory' && (
          <TeamDirectoryTab users={users} />
        )}

        {activeTab === 'org-chart' && (
          <OrgChartTab currentUser={user} addToast={addToast} />
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
        
        {activeTab === 'market-settings' && (
          <MarketSettingsTab />
        )}

        {activeTab === 'media-settings' && (
          <MediaSettingsTab addToast={addToast} />
        )}

        {activeTab === 'audit-logs' && (
          <AuditLogTab />
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

        {activeTab === 'hotels' && (
          <HotelsTab currentUser={user} addToast={addToast} handleDeleteHotel={(id) => setHotelToDelete(id)} />
        )}
        {activeTab === 'restaurants' && (
          <RestaurantsTab currentUser={user} addToast={addToast} handleDeleteRestaurant={(id) => setRestaurantToDelete(id)} />
        )}
        {activeTab === 'transports' && (
          <TransportsTab currentUser={user} addToast={addToast} handleDeleteTransport={(id) => setTransportToDelete(id)} />
        )}
        {activeTab === 'tickets' && (
          <TicketsTab currentUser={user} addToast={addToast} handleDeleteTicket={(id) => setTicketToDelete(id)} />
        )}
        {activeTab === 'airlines' && (
          <AirlinesTab currentUser={user} addToast={addToast} handleDeleteAirline={(id) => setAirlineToDelete(id)} />
        )}
        {activeTab === 'landtours' && (
          <LandtoursTab currentUser={user} addToast={addToast} handleDeleteLandtour={(id) => setLandtourToDelete(id)} />
        )}
        {activeTab === 'insurances' && (
          <InsurancesTab currentUser={user} addToast={addToast} handleDeleteInsurance={(id) => setInsuranceToDelete(id)} />
        )}

        {/* ═══ Tour Đoàn Tab Rendering ═══ */}
                                                                {activeTab === 'companies' && (
          <B2BCompaniesTab currentUser={user} addToast={addToast} handleDeleteCompany={(id) => setB2bCompanyToDelete(id)} />
        )}
        {activeTab === 'group-leaders' && (
          <GroupLeadersTab currentUser={user} addToast={addToast} users={users} handleDeleteLeader={(id) => setGroupLeaderToDelete(id)} />
        )}
        {activeTab === 'group-dashboard' && (
          <GroupDashboardTab />
        )}
        {activeTab === 'group-projects' && (
          <GroupProjectsTab currentUser={user} addToast={addToast} users={users} handleDeleteProject={(id) => setGroupProjectToDelete(id)} />
        )}

        {activeTab === 'b2b-companies' && (
          b2bActiveTab === 'calendar' ? 
            <GroupLeadersTab currentUser={user} addToast={addToast} users={users} activeView="calendar" /> :
            <B2BCompaniesTab currentUser={user} addToast={addToast} users={users} handleDeleteCompany={(id) => setB2bCompanyToDelete(id)} />
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

      <AddBookingModal
        show={showAddBookingModal}
        bookingToEdit={bookingToEdit}
        onClose={() => {
          setShowAddBookingModal(false);
          setBookingToEdit(null);
        }}
        onSave={async (bookingData) => {
          try {
            let finalCustomerId = bookingData.customer_id;
            
            if (bookingData.is_new_customer) {
              const custRes = await axios.post('/api/customers', {
                name: bookingData.new_customer_info.name,
                phone: bookingData.new_customer_info.phone,
                preferred_contact: 'Zalo',
                role: 'booker'
              }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
              finalCustomerId = custRes.data.id;
            }

            if (bookingToEdit) {
              await axios.put(`/api/bookings/${bookingToEdit.id}`, {
                ...bookingData,
                customer_id: finalCustomerId
              }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
              addToastGlobal('Cập nhật đơn hàng thành công!', setToasts);
            } else {
              await axios.post('/api/bookings', {
                ...bookingData,
                customer_id: finalCustomerId
              }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
              addToastGlobal('Lưu đơn hàng thành công!', setToasts);
            }
            
            const updatedBookings = await axios.get('/api/bookings', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setBookings(updatedBookings.data);
            setShowAddBookingModal(false);
            setBookingToEdit(null);
          } catch (err) {
            console.error(err);
            alert('Lỗi lưu đơn hàng: ' + (err.response?.data?.message || err.message));
          }
        }}
        customers={customers}
        departures={tourDepartures}
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
        currentUser={user}
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
        tourDepartures={tourDepartures}
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

      <EditDepartureModal 
        showEditDepartureModal={showEditDepartureModal}
        setShowEditDepartureModal={setShowEditDepartureModal}
        handleUpdateDeparture={handleUpdateDeparture}
        editingDeparture={editingDeparture}
        setEditingDeparture={setEditingDeparture}
        tourTemplates={tourTemplates}
        guides={guides}
        handleOpenCustomer={handleOpenCustomer}
      />

      <GuideModal 
        showAddGuideModal={showAddGuideModal}
        setShowAddGuideModal={setShowAddGuideModal}
        editingGuide={editingGuide}
        handleUpdateGuide={handleUpdateGuide}
        handleAddGuide={handleAddGuide}
        newGuide={newGuide}
        setNewGuide={setNewGuide}
        guideTimelineData={guideTimelineData}
        tourDepartures={tourDepartures}
        handleEditDeparture={handleEditDeparture}
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

      <RolePermissionModal 
        open={showRolePermModal} 
        onClose={() => setShowRolePermModal(false)}
        addToast={addToast}
      />
      
      <UserPermissionOverrideModal 
        open={!!userToEditPerms} 
        user={userToEditPerms}
        onClose={() => setUserToEditPerms(null)}
        addToast={addToast}
      />

      <ChangePasswordModal 
        user={showChangeMyPassword ? user : userToChangePassword}
        onClose={() => {
          setUserToChangePassword(null);
          setShowChangeMyPassword(false);
        }}
        onSave={async (id, newPassword) => {
          if (showChangeMyPassword) {
            try {
              const token = localStorage.getItem('token');
              await axios.put(`/api/users/${id}/password`, { newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              addToast('Đã đổi mật khẩu cá nhân thành công.');
              setShowChangeMyPassword(false);
            } catch (err) {
              addToast(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
            }
          } else {
            handleChangePasswordAdmin(id, newPassword);
          }
        }}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast" style={t.type === 'error' ? { background: '#ef4444', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } : {}}>
             <span style={{marginRight: '12px'}}>{t.message}</span>
             {t.type === 'error' && (
               <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{background:'transparent', border:'none', color:'white', cursor:'pointer', fontSize:'16px', fontWeight:'bold', padding:'0 4px', lineHeight: 1}}>×</button>
             )}
          </div>
        ))}
      </div>
    </div>
    );
  };

  return (
    <>
      <Routes>
      <Route path="/simple-list-share/lich_dai_ly" element={<AgencySharePage />} />
      <Route path="/service-confirm/:tourId/:bookingId" element={<ServiceContractViewer />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/deletion" element={<DataDeletion />} />
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to={`/${activeTab}`} replace /> : (
          <div className="login-page-wrapper">
            <div className="login-glass-card shadow-2xl">
              <div className="login-brand" style={{ display: 'flex', justifyContent: 'center' }}>
                <img src="/logo.png" alt="FIT TOUR" style={{ height: '80px', marginBottom: '1rem', objectFit: 'contain' }} />
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
        path="/:tab/:subtab" 
        element={isLoggedIn ? renderDashboard() : <Navigate to="/login" />} 
      />
      <Route 
        path="/:tab/:subtab/:id" 
        element={isLoggedIn ? renderDashboard() : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    {/* MODAL XÁC NHẬN CHUYỂN ĐỔI LEAD SANG KHÁCH HÀNG */}
    {leadToConvert && (
      <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => setLeadToConvert(null)}>
        <div className="modal-content animate-slide-up" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: '60px', height: '60px', background: '#d1fae5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <UserPlus size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Chuyển đổi thành Khách Hàng?</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
            Bạn đang chuyển <strong>{leadToConvert.name}</strong> sang dạng Khách Hàng chính thức. Trạng thái tư vấn của Lead này sẽ được tự động đổi sang "Chốt đơn".
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-pro-cancel" 
              style={{ flex: 1, border: '1px solid #e5e7eb', background: 'white' }}
              disabled={loading}
              onClick={() => setLeadToConvert(null)}
            >HỦY BỎ</button>
            <button 
              className="btn-pro-save" 
              style={{ flex: 1, background: '#10b981', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await handleConvertLead(leadToConvert.id);
                setLeadToConvert(null);
                setLoading(false);
              }}
            >{loading ? 'ĐANG CHUYỂN...' : 'CHUYỂN ĐỔI'}</button>
          </div>
        </div>
      </div>
    )}

    {/* MODAL XÁC NHẬN XÓA (CUSTOM) */}
    {(leadToDelete || customerToDelete || tourToDelete || departureToDelete || bookingToDelete || hotelToDelete || restaurantToDelete || transportToDelete || ticketToDelete || airlineToDelete || landtourToDelete || insuranceToDelete || b2bCompanyToDelete || groupLeaderToDelete || groupProjectToDelete) && (
      <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => {
        setLeadToDelete(null);
        setCustomerToDelete(null);
        setTourToDelete(null);
        setDepartureToDelete(null);
        setBookingToDelete(null);
        setHotelToDelete(null);
        setRestaurantToDelete(null);
        setTransportToDelete(null);
        setTicketToDelete(null);
        setAirlineToDelete(null);
        setLandtourToDelete(null);
        setInsuranceToDelete(null);
        setB2bCompanyToDelete(null);
        setGroupLeaderToDelete(null);
        setGroupProjectToDelete(null);
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
                setDepartureToDelete(null);
                setBookingToDelete(null);
                setHotelToDelete(null);
                setRestaurantToDelete(null);
                setTransportToDelete(null);
                setTicketToDelete(null);
                setAirlineToDelete(null);
                setLandtourToDelete(null);
                setInsuranceToDelete(null);
                setB2bCompanyToDelete(null);
                setGroupLeaderToDelete(null);
                setGroupProjectToDelete(null);
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
                if (departureToDelete) confirmDeleteDeparture();
                if (bookingToDelete) confirmDeleteBooking();
                if (hotelToDelete) confirmDeleteHotel();
                if (restaurantToDelete) confirmDeleteRestaurant();
                if (transportToDelete) confirmDeleteTransport();
                if (ticketToDelete) confirmDeleteTicket();
                if (airlineToDelete) confirmDeleteAirline();
                if (landtourToDelete) confirmDeleteLandtour();
                if (insuranceToDelete) confirmDeleteInsurance();
                if (b2bCompanyToDelete) confirmDeleteB2bCompany();
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
