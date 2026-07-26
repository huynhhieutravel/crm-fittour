with open("client/src/tabs/GlobalChatTab.jsx", "r") as f:
    content = f.read()

import re

# Add state variables
state_vars = """    const [notifications, setNotifications] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [timeRange, setTimeRange] = useState("today");
    const [category, setCategory] = useState("all");
    const messagesEndRef = useRef(null);"""

content = content.replace('const [notifications, setNotifications] = useState([]);\n    const [inputValue, setInputValue] = useState("");\n    const messagesEndRef = useRef(null);', state_vars)

# Update fetchNotifs
fetch_notifs = """        const fetchNotifs = () => {
            axios.get(`/api/notifications?timeRange=${timeRange}&category=${category}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setNotifications(res.data))
                .catch(err => console.error('Error fetching notifications:', err));
        };"""
content = re.sub(r'const fetchNotifs = \(\) => \{[\s\S]*?\};', fetch_notifs, content)

# Update handleClaim refresh
handle_claim = """            axios.get(`/api/notifications?timeRange=${timeRange}&category=${category}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setNotifications(res.data));"""
content = re.sub(r'axios\.get\(\'/api/notifications\', \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \}\)\n                \.then\(res => setNotifications\(res\.data\)\);', handle_claim, content)

# Add the dependency array to useEffect for fetchNotifs
use_effect = """    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchNotifs = () => {
            axios.get(`/api/notifications/in-app?timeRange=${timeRange}&category=${category}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setNotifications(res.data.notifications || []))
                .catch(err => console.error('Error fetching notifications:', err));
        };

        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000);
        return () => clearInterval(interval);
    }, [timeRange, category]);"""

content = re.sub(r'useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);', use_effect, content)

# Also fix the handleClaim fetch URL
handle_claim2 = """            axios.get(`/api/notifications/in-app?timeRange=${timeRange}&category=${category}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setNotifications(res.data.notifications || []));"""
content = content.replace(handle_claim, handle_claim2)


# Inject UI filters before "Chat Body"
filters_ui = """            {/* Chat Filters */}
            <div style={{ display: 'flex', gap: '10px', padding: '10px 20px', background: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                <select 
                    value={timeRange} 
                    onChange={e => setTimeRange(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '13px', color: '#374151', cursor: 'pointer', background: '#fff' }}
                >
                    <option value="today">Hôm nay</option>
                    <option value="yesterday">Hôm qua</option>
                    <option value="this_week">Tuần này</option>
                    <option value="this_month">Tháng này</option>
                    <option value="all">Tất cả thời gian</option>
                </select>
                <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '13px', color: '#374151', cursor: 'pointer', background: '#fff' }}
                >
                    <option value="all">Tất cả thông báo</option>
                    <option value="my_leads">Lead phân cho tôi</option>
                    <option value="unassigned">Lead chưa phân bổ</option>
                    <option value="BU1">BU1</option>
                    <option value="BU2">BU2</option>
                    <option value="BU3">BU3</option>
                    <option value="BU4">BU4</option>
                    <option value="BU5">BU5</option>
                </select>
            </div>

            {/* Chat Body */}"""

content = content.replace("{/* Chat Body */}", filters_ui)

with open("client/src/tabs/GlobalChatTab.jsx", "w") as f:
    f.write(content)
