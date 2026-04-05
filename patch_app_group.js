const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'client/src/App.jsx');
let content = fs.readFileSync(appFile, 'utf8');

// ═══════════════════════════════════════════
// PATCH App.jsx: Add Tour Đoàn (Group) modules
// ═══════════════════════════════════════════

// 1. Add imports after InsurancesTab
content = content.replace(
    "import InsurancesTab from './tabs/InsurancesTab';",
    `import InsurancesTab from './tabs/InsurancesTab';
// ═══ Tour Đoàn Tab Imports ═══
import GroupHotelsTab from './tabs/GroupHotelsTab';
import GroupRestaurantsTab from './tabs/GroupRestaurantsTab';
import GroupTransportsTab from './tabs/GroupTransportsTab';
import GroupTicketsTab from './tabs/GroupTicketsTab';
import GroupAirlinesTab from './tabs/GroupAirlinesTab';
import GroupLandtoursTab from './tabs/GroupLandtoursTab';
import GroupInsurancesTab from './tabs/GroupInsurancesTab';`
);

// 2. Add state variables after insuranceToDelete
content = content.replace(
    "const [insuranceToDelete, setInsuranceToDelete] = useState(null);",
    `const [insuranceToDelete, setInsuranceToDelete] = useState(null);
  // ═══ Tour Đoàn Delete States ═══
  const [groupHotelToDelete, setGroupHotelToDelete] = useState(null);
  const [groupRestaurantToDelete, setGroupRestaurantToDelete] = useState(null);
  const [groupTransportToDelete, setGroupTransportToDelete] = useState(null);
  const [groupTicketToDelete, setGroupTicketToDelete] = useState(null);
  const [groupAirlineToDelete, setGroupAirlineToDelete] = useState(null);
  const [groupLandtourToDelete, setGroupLandtourToDelete] = useState(null);
  const [groupInsuranceToDelete, setGroupInsuranceToDelete] = useState(null);`
);

// 3. Add confirmDelete functions after confirmDeleteInsurance
const groupDeleteFunctions = `

  // ═══ Tour Đoàn Delete Confirmation Functions ═══
  const confirmDeleteGroupHotel = async () => {
    if (!groupHotelToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/group/hotels/\${groupHotelToDelete}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
      addToast('Đã xóa KS Đoàn thành công.');
      setGroupHotelToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupHotels'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupHotelToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupRestaurant = async () => {
    if (!groupRestaurantToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/group/restaurants/\${groupRestaurantToDelete}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
      addToast('Đã xóa Nhà hàng Đoàn thành công.');
      setGroupRestaurantToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupRestaurants'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupRestaurantToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupTransport = async () => {
    if (!groupTransportToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/group/transports/\${groupTransportToDelete}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
      addToast('Đã xóa Nhà xe Đoàn thành công.');
      setGroupTransportToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupTransports'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupTransportToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupTicket = async () => {
    if (!groupTicketToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/group/tickets/\${groupTicketToDelete}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
      addToast('Đã xóa Vé TQ Đoàn thành công.');
      setGroupTicketToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupTickets'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupTicketToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupAirline = async () => {
    if (!groupAirlineToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/group/airlines/\${groupAirlineToDelete}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
      addToast('Đã xóa Hãng bay Đoàn thành công.');
      setGroupAirlineToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupAirlines'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupAirlineToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupLandtour = async () => {
    if (!groupLandtourToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/group/landtours/\${groupLandtourToDelete}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
      addToast('Đã xóa Land Tour Đoàn thành công.');
      setGroupLandtourToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupLandtours'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupLandtourToDelete(null);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroupInsurance = async () => {
    if (!groupInsuranceToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/group/insurances/\${groupInsuranceToDelete}?force=true\`, { headers: { Authorization: \`Bearer \${token}\` } });
      addToast('Đã xóa Bảo hiểm Đoàn thành công.');
      setGroupInsuranceToDelete(null);
      window.dispatchEvent(new CustomEvent('reloadGroupInsurances'));
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
      setGroupInsuranceToDelete(null);
    } finally { setLoading(false); }
  };`;

content = content.replace(
    "const confirmDeleteDeparture = async",
    groupDeleteFunctions + "\n\n  const confirmDeleteDeparture = async"
);

// 4. Add sidebar menu "Tour Đoàn" after "Nhà cung cấp" and before "Hệ thống & Nhân sự"
content = content.replace(
    `{(checkView('users') || checkView('settings')) && (
            <>
              <div className="nav-section-title">Hệ thống & Nhân sự</div>`,
    `{/* ═══ TOUR ĐOÀN SECTION ═══ */}
          {(['group_hotels','group_restaurants','group_transports','group_tickets','group_airlines','group_landtours','group_insurances'].some(mod => checkView(mod))) && (
            <>
              <div className="nav-section-title" style={{ color: '#d97706' }}>Tour Đoàn 🔒</div>
              <div 
                className={\`nav-item \${['group-hotels','group-restaurants','group-transports','group-tickets','group-airlines','group-landtours','group-insurances'].includes(activeTab) ? 'active-parent' : ''}\`} 
                onClick={() => { navigate('/group/hotels'); setActiveTab('group-hotels'); }}
                style={{ justifyContent: 'space-between' }}
                onMouseEnter={(e) => {
                  if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredRect(rect);
                  setHoveredMenu('group-suppliers');
                }}
                onMouseLeave={() => {
                  menuTimerRef.current = setTimeout(() => {
                    setHoveredMenu(null);
                  }, 150);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Package /> NCC Đoàn
                </div>
                <ChevronRight size={14} opacity={0.5} />
              </div>
            </>
          )}

          {(checkView('users') || checkView('settings')) && (
            <>
              <div className="nav-section-title">Hệ thống & Nhân sự</div>`
);

// 5. Add the flyout submenu for group-suppliers after the 'suppliers' flyout
content = content.replace(
    "{hoveredMenu === 'manual' && hoveredRect && (",
    `{hoveredMenu === 'group-suppliers' && hoveredRect && (
        <div 
          className="submenu-flyout"
          style={{ 
            position: 'fixed', 
            left: \`\${hoveredRect.right + 5}px\`, 
            top: \`\${hoveredRect.top}px\`, 
            display: 'flex', 
            opacity: 1, 
            transform: 'none',
            pointerEvents: 'auto',
            zIndex: 9999
          }}
          onMouseEnter={() => {
            if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
            setHoveredMenu('group-suppliers');
          }}
          onMouseLeave={() => {
            menuTimerRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 150);
          }}
        >
          {checkView('group_hotels') && <div className={\`submenu-item \${activeTab === 'group-hotels' ? 'active' : ''}\`} onClick={() => { navigate('/group/hotels'); setActiveTab('group-hotels'); setHoveredMenu(null); }}>KS Đoàn</div>}
          {checkView('group_restaurants') && <div className={\`submenu-item \${activeTab === 'group-restaurants' ? 'active' : ''}\`} onClick={() => { navigate('/group/restaurants'); setActiveTab('group-restaurants'); setHoveredMenu(null); }}>Nhà hàng Đoàn</div>}
          {checkView('group_transports') && <div className={\`submenu-item \${activeTab === 'group-transports' ? 'active' : ''}\`} onClick={() => { navigate('/group/transports'); setActiveTab('group-transports'); setHoveredMenu(null); }}>Nhà xe Đoàn</div>}
          {checkView('group_tickets') && <div className={\`submenu-item \${activeTab === 'group-tickets' ? 'active' : ''}\`} onClick={() => { navigate('/group/tickets'); setActiveTab('group-tickets'); setHoveredMenu(null); }}>Vé TQ Đoàn</div>}
          {checkView('group_airlines') && <div className={\`submenu-item \${activeTab === 'group-airlines' ? 'active' : ''}\`} onClick={() => { navigate('/group/airlines'); setActiveTab('group-airlines'); setHoveredMenu(null); }}>Hãng bay Đoàn</div>}
          {checkView('group_landtours') && <div className={\`submenu-item \${activeTab === 'group-landtours' ? 'active' : ''}\`} onClick={() => { navigate('/group/landtours'); setActiveTab('group-landtours'); setHoveredMenu(null); }}>Land Tour Đoàn</div>}
          {checkView('group_insurances') && <div className={\`submenu-item \${activeTab === 'group-insurances' ? 'active' : ''}\`} onClick={() => { navigate('/group/insurances'); setActiveTab('group-insurances'); setHoveredMenu(null); }}>Bảo Hiểm Đoàn</div>}
        </div>
      )}

      {hoveredMenu === 'manual' && hoveredRect && (`
);

// 6. Add activeTab routing after insurances tab rendering
content = content.replace(
    `{activeTab === 'insurances' && (
          <InsurancesTab currentUser={user} addToast={addToast} handleDeleteInsurance={(id) => setInsuranceToDelete(id)} />
        )}`,
    `{activeTab === 'insurances' && (
          <InsurancesTab currentUser={user} addToast={addToast} handleDeleteInsurance={(id) => setInsuranceToDelete(id)} />
        )}

        {/* ═══ Tour Đoàn Tab Rendering ═══ */}
        {activeTab === 'group-hotels' && (
          <GroupHotelsTab currentUser={user} addToast={addToast} handleDeleteHotel={(id) => setGroupHotelToDelete(id)} />
        )}
        {activeTab === 'group-restaurants' && (
          <GroupRestaurantsTab currentUser={user} addToast={addToast} handleDeleteRestaurant={(id) => setGroupRestaurantToDelete(id)} />
        )}
        {activeTab === 'group-transports' && (
          <GroupTransportsTab currentUser={user} addToast={addToast} handleDeleteTransport={(id) => setGroupTransportToDelete(id)} />
        )}
        {activeTab === 'group-tickets' && (
          <GroupTicketsTab currentUser={user} addToast={addToast} handleDeleteTicket={(id) => setGroupTicketToDelete(id)} />
        )}
        {activeTab === 'group-airlines' && (
          <GroupAirlinesTab currentUser={user} addToast={addToast} handleDeleteAirline={(id) => setGroupAirlineToDelete(id)} />
        )}
        {activeTab === 'group-landtours' && (
          <GroupLandtoursTab currentUser={user} addToast={addToast} handleDeleteLandtour={(id) => setGroupLandtourToDelete(id)} />
        )}
        {activeTab === 'group-insurances' && (
          <GroupInsurancesTab currentUser={user} addToast={addToast} handleDeleteInsurance={(id) => setGroupInsuranceToDelete(id)} />
        )}`
);

// 7. Update delete confirmation modal condition
content = content.replace(
    "{(leadToDelete || customerToDelete || tourToDelete || departureToDelete || bookingToDelete || hotelToDelete || restaurantToDelete || transportToDelete || ticketToDelete || airlineToDelete || landtourToDelete || insuranceToDelete) && (",
    "{(leadToDelete || customerToDelete || tourToDelete || departureToDelete || bookingToDelete || hotelToDelete || restaurantToDelete || transportToDelete || ticketToDelete || airlineToDelete || landtourToDelete || insuranceToDelete || groupHotelToDelete || groupRestaurantToDelete || groupTransportToDelete || groupTicketToDelete || groupAirlineToDelete || groupLandtourToDelete || groupInsuranceToDelete) && ("
);

// 8. Add group delete state resets to modal overlay onClick
content = content.replace(
    `setInsuranceToDelete(null);
      }}>`,
    `setInsuranceToDelete(null);
        setGroupHotelToDelete(null);
        setGroupRestaurantToDelete(null);
        setGroupTransportToDelete(null);
        setGroupTicketToDelete(null);
        setGroupAirlineToDelete(null);
        setGroupLandtourToDelete(null);
        setGroupInsuranceToDelete(null);
      }}>`
);

// 9. Add group delete state resets to cancel button onClick 
content = content.replace(
    `setInsuranceToDelete(null);
              }}
            >HỦY BỎ</button>`,
    `setInsuranceToDelete(null);
                setGroupHotelToDelete(null);
                setGroupRestaurantToDelete(null);
                setGroupTransportToDelete(null);
                setGroupTicketToDelete(null);
                setGroupAirlineToDelete(null);
                setGroupLandtourToDelete(null);
                setGroupInsuranceToDelete(null);
              }}
            >HỦY BỎ</button>`
);

// 10. Add group delete confirmations to the delete button onClick
content = content.replace(
    "if (insuranceToDelete) confirmDeleteInsurance();\n              }}",
    `if (insuranceToDelete) confirmDeleteInsurance();
                if (groupHotelToDelete) confirmDeleteGroupHotel();
                if (groupRestaurantToDelete) confirmDeleteGroupRestaurant();
                if (groupTransportToDelete) confirmDeleteGroupTransport();
                if (groupTicketToDelete) confirmDeleteGroupTicket();
                if (groupAirlineToDelete) confirmDeleteGroupAirline();
                if (groupLandtourToDelete) confirmDeleteGroupLandtour();
                if (groupInsuranceToDelete) confirmDeleteGroupInsurance();
              }}`
);

// 11. Update URL-to-activeTab mapping
// Look for the useEffect that maps location to activeTab
const urlMappingSnippet = `if (p.startsWith('/hotels')) return 'hotels';`;
if (content.includes(urlMappingSnippet)) {
    content = content.replace(
        urlMappingSnippet,
        `if (p.startsWith('/group/hotels')) return 'group-hotels';
      if (p.startsWith('/group/restaurants')) return 'group-restaurants';
      if (p.startsWith('/group/transports')) return 'group-transports';
      if (p.startsWith('/group/tickets')) return 'group-tickets';
      if (p.startsWith('/group/airlines')) return 'group-airlines';
      if (p.startsWith('/group/landtours')) return 'group-landtours';
      if (p.startsWith('/group/insurances')) return 'group-insurances';
      if (p.startsWith('/hotels')) return 'hotels';`
    );
}

fs.writeFileSync(appFile, content);
console.log('✅ App.jsx patched successfully with Tour Đoàn modules!');
