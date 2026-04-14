import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap, 
    addEdge, 
    applyNodeChanges, 
    applyEdgeChanges,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { Save, Plus, Trash2, Edit3, X, User, Target } from 'lucide-react';

// --- CUSTOM NODE COMPONENT ---
const CustomNode = ({ data, selected }) => {
    let bgColor = '#f8fafc';
    let borderColor = '#e2e8f0';
    let labelColor = '#1e293b';

    if (data.roleType === 'CEO') {
        bgColor = '#111827';
        borderColor = '#3b82f6';
        labelColor = '#ffffff';
    } else if (data.roleType === 'VICE_DIRECTOR') {
        bgColor = '#b48e4b';
        borderColor = '#92400e';
        labelColor = '#ffffff';
    } else if (data.roleType === 'MANAGER') {
        bgColor = '#fef3c7';
        borderColor = '#f59e0b';
        labelColor = '#92400e';
    } else if (data.roleType === 'BU') {
        bgColor = '#eff6ff';
        borderColor = '#3b82f6';
        labelColor = '#1e40af';
    } else if (data.roleType === 'STAFF') {
        bgColor = '#f0fdf4';
        borderColor = '#22c55e';
        labelColor = '#166534';
    } else if (data.roleType === 'OPERATIONS') {
        bgColor = '#ccfbf1';
        borderColor = '#14b8a6';
        labelColor = '#0f766e';
    }

    return (
        <div style={{
            background: bgColor,
            border: `2px solid ${selected ? '#ef4444' : borderColor}`,
            borderRadius: '12px',
            padding: '12px 16px',
            minWidth: '200px',
            boxShadow: selected ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s'
        }}>
            <Handle type="target" position={Position.Top} style={{ background: '#94a3b8', width: '8px', height: '8px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: data.avatarUrl ? `url(${data.avatarUrl}) center/cover no-repeat` : 'rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1rem', color: labelColor,
                    overflow: 'hidden', flexShrink: 0
                }}>
                    {!data.avatarUrl && (data.label?.charAt(0).toUpperCase() || <User size={20} />)}
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: labelColor }}>
                        {data.label || 'Chưa đặt tên'}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: labelColor, opacity: 0.8 }}>
                        {data.position || 'Chức vụ'}
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} style={{ background: '#94a3b8', width: '8px', height: '8px' }} />
        </div>
    );
};

const OrgChartTab = ({ currentUser, addToast }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Editor and View State
    const [selectedNode, setSelectedNode] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [teamsList, setTeamsList] = useState([]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [orgRes, usersRes, teamsRes] = await Promise.all([
                axios.get('/api/org-chart', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                axios.get('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                axios.get('/api/users/teams', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            ]);

            const loadedNodes = orgRes.data.nodes || [];
            const loadedEdges = orgRes.data.edges || [];

            setNodes(loadedNodes);
            setEdges(loadedEdges);
            setUsersList(usersRes.data || []);
            setTeamsList(teamsRes.data || []);
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi tải sơ đồ tổ chức', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await axios.post('/api/org-chart', { nodes, edges }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if(addToast) addToast('Đã lưu sơ đồ tổ chức thành công!', 'success');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi lưu sơ đồ tổ chức', 'error');
        }
    };

    const onNodesChange = useCallback((changes) => {
        if (!isEditing) return; // Prevent drag if not editing
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, [isEditing]);

    const onEdgesChange = useCallback((changes) => {
        if (!isEditing) return;
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, [isEditing]);

    const onConnect = useCallback((params) => {
        if (!isEditing) return;
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds));
    }, [isEditing]);

    const handleAddNode = () => {
        const newNodeId = `node_${Date.now()}`;
        const newNode = {
            id: newNodeId,
            type: 'custom',
            position: { x: 250, y: 100 },
            data: { label: 'Nhân sự mới', position: 'Chức vụ', roleType: 'STAFF', avatarUrl: '' }
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const onNodeClick = (_, node) => {
        if (isEditing) {
            setSelectedNode(node);
        } else {
            if (node.data?.userId) {
                const user = usersList.find(u => u.id === node.data.userId);
                if (user) setViewingUser(user);
            }
        }
    };

    const updateSelectedNodeData = (field, value) => {
        setNodes(nds => nds.map(n => {
            if (n.id === selectedNode.id) {
                const updatedNode = { ...n, data: { ...n.data, [field]: value } };
                setSelectedNode(updatedNode);
                return updatedNode;
            }
            return n;
        }));
    };

    const handleDeleteNode = () => {
        if (!selectedNode) return;
        setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
        setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
        setSelectedNode(null);
    };

    const handleLinkUser = (userId) => {
        const user = usersList.find(u => u.id === parseInt(userId));
        if (user) {
            setNodes(nds => nds.map(n => {
                if (n.id === selectedNode.id) {
                    const updatedNode = { 
                        ...n, 
                        data: { 
                            ...n.data, 
                            label: user.full_name, 
                            position: user.position || user.role_name,
                            avatarUrl: user.avatar_url || '',
                            userId: user.id
                        } 
                    };
                    setSelectedNode(updatedNode);
                    return updatedNode;
                }
                return n;
            }));
        }
    };

    const handleAutoGenerate = () => {
        const newNodes = [];
        const newEdges = [];
        const edgeStyle = { stroke: '#94a3b8', strokeWidth: 2 };
        const greenEdge = { stroke: '#22c55e', strokeWidth: 2 };
        let nodeCounter = 0;
        const mkId = () => `node_auto_${++nodeCounter}`;

        const addNode = (id, x, y, label, position, roleType) => {
            newNodes.push({ id, type: 'custom', position: { x, y }, data: { label, position, roleType, avatarUrl: '' } });
        };
        const addEdge = (src, tgt, style = edgeStyle) => {
            newEdges.push({ id: `edge_${src}_${tgt}`, source: src, target: tgt, animated: true, style });
        };

        // Try to link user by username
        const linkUser = (nodeId, username) => {
            const u = usersList.find(usr => usr.username?.toLowerCase() === username.toLowerCase());
            if (u) {
                const node = newNodes.find(n => n.id === nodeId);
                if (node) {
                    node.data.label = u.full_name || node.data.label;
                    node.data.avatarUrl = u.avatar_url || '';
                    node.data.userId = u.id;
                }
            }
        };

        const getStaffRole = (pos) => pos?.toLowerCase().includes('điều hành') ? 'OPERATIONS' : 'STAFF';

        // ═══════════════════════════════════════════
        //  1. CEO - Max Vũ
        // ═══════════════════════════════════════════
        const ceoId = mkId();
        addNode(ceoId, 650, 30, 'Max Vũ', 'CEO', 'CEO');
        linkUser(ceoId, 'admin');

        // ═══════════════════════════════════════════
        //  2. Phó Giám đốc - Vy Phan
        // ═══════════════════════════════════════════
        const viceId = mkId();
        addNode(viceId, 630, 140, 'Vy Phan', 'Phó Giám đốc', 'VICE_DIRECTOR');
        linkUser(viceId, 'sv1.sale');
        addEdge(ceoId, viceId);

        // ═══════════════════════════════════════════
        //  3. KHỐI SALE BU1
        // ═══════════════════════════════════════════
        const bu1Id = mkId();
        addNode(bu1Id, -50, 280, 'Khối Sale BU1', '', 'BU');
        addEdge(viceId, bu1Id);

        const bu1Head = mkId();
        addNode(bu1Head, -60, 390, 'Trần Quốc Thịnh', 'Trưởng phòng BU1', 'MANAGER');
        linkUser(bu1Head, 'tq1.sale');
        addEdge(bu1Id, bu1Head, greenEdge);

        const bu1Staff = [
            { name: 'Nguyễn Hồ Đông Hải', pos: 'Lead Điều hành', user: 'tq2.sale' },
            { name: 'Đoàn Thủy An', pos: 'sales', user: 'tq3.sale' },
            { name: 'Nguyễn Quỳnh Phương', pos: 'sales', user: 'tq5.sale' },
            { name: 'Trần Minh Dũng', pos: 'Điều hành', user: 'dung.dh' },
            { name: 'Nguyễn Hùng Thịnh', pos: 'sales', user: 'tq4.sale' },
            { name: 'Lâm Mỹ Duyên', pos: 'sales', user: 'tq6.sale' },
        ];
        bu1Staff.forEach((s, i) => {
            const sId = mkId();
            addNode(sId, -60, 510 + i * 100, s.name, s.pos, getStaffRole(s.pos));
            linkUser(sId, s.user);
            addEdge(bu1Head, sId, greenEdge);
        });

        // ═══════════════════════════════════════════
        //  4. KHỐI SALE BU2
        // ═══════════════════════════════════════════
        const bu2Id = mkId();
        addNode(bu2Id, 230, 280, 'Khối Sale BU2', '', 'BU');
        addEdge(viceId, bu2Id);

        const bu2Head = mkId();
        addNode(bu2Head, 220, 390, 'Lê Minh Tuấn', 'Trưởng phòng BU2', 'MANAGER');
        linkUser(bu2Head, 'gu1.sale');
        addEdge(bu2Id, bu2Head, greenEdge);

        const bu2Staff = [
            { name: 'Bùi Ngọc Hiếu', pos: 'Phó phòng sales', user: 'gu2.sale' },
            { name: 'Văn Tâm', pos: 'Visa', user: 'gu3.sale' },
            { name: 'Dương Quỳnh Như', pos: 'sales', user: 'gu4.sale' },
            { name: 'Nguyễn Thị Hằng', pos: 'Điều hành', user: 'hang.dh' },
            { name: 'Lê Thanh Hà', pos: 'Điều hành', user: 'ha.dh' },
        ];
        bu2Staff.forEach((s, i) => {
            const sId = mkId();
            addNode(sId, 220, 510 + i * 100, s.name, s.pos, getStaffRole(s.pos));
            linkUser(sId, s.user);
            addEdge(bu2Head, sId, greenEdge);
        });

        // ═══════════════════════════════════════════
        //  5. KHỐI SALE BU3
        // ═══════════════════════════════════════════
        const bu3Id = mkId();
        addNode(bu3Id, 510, 280, 'Khối Sale BU3', '', 'BU');
        addEdge(viceId, bu3Id);

        const bu3Head = mkId();
        addNode(bu3Head, 500, 390, 'Vy Phan', 'Trưởng phòng BU3', 'MANAGER');
        linkUser(bu3Head, 'sv1.sale');
        addEdge(bu3Id, bu3Head, greenEdge);

        const bu3Staff = [
            { name: 'Hoàng Thị Hoa', pos: 'Lead team sale', user: 'sv4.sale' },
            { name: 'Trần Đức Mẫn', pos: 'Lead Điều hành', user: 'sv2.sale' },
            { name: 'Hậu Quang Hưng', pos: 'sales', user: 'sv3.sale' },
            { name: 'Nguyễn Huỳnh Hồng Trang', pos: 'sales', user: 'sv5.sale' },
            { name: 'Lê Thị Trang', pos: 'sales', user: 'sv6.sale' },
            { name: 'Phạm Thụy', pos: 'Điều hành', user: 'sv7.sale' },
        ];
        bu3Staff.forEach((s, i) => {
            const sId = mkId();
            addNode(sId, 500, 510 + i * 100, s.name, s.pos, getStaffRole(s.pos));
            linkUser(sId, s.user);
            addEdge(bu3Head, sId, greenEdge);
        });

        // ═══════════════════════════════════════════
        //  6. KHỐI SALE BU4
        // ═══════════════════════════════════════════
        const bu4Id = mkId();
        addNode(bu4Id, 790, 280, 'Khối Sale BU4', '', 'BU');
        addEdge(viceId, bu4Id);

        const bu4Head = mkId();
        addNode(bu4Head, 780, 390, 'Hồng Trang', 'Trưởng phòng BU4', 'MANAGER');
        linkUser(bu4Head, 'hi1.sale');
        addEdge(bu4Id, bu4Head, greenEdge);

        const bu4Staff = [
            { name: 'Max Vũ', pos: 'sales', user: 'hi2.sale' },
            { name: 'Huy Ngô', pos: 'sales', user: 'hi3.sale' },
        ];
        bu4Staff.forEach((s, i) => {
            const sId = mkId();
            addNode(sId, 780, 510 + i * 100, s.name, s.pos, getStaffRole(s.pos));
            linkUser(sId, s.user);
            addEdge(bu4Head, sId, greenEdge);
        });

        // ═══════════════════════════════════════════
        //  7. KẾ TOÁN
        // ═══════════════════════════════════════════
        const ktId = mkId();
        addNode(ktId, 1050, 280, 'Kế Toán', '', 'BU');
        addEdge(viceId, ktId);

        const ktHead = mkId();
        addNode(ktHead, 1040, 390, 'Nguyễn Xuân', 'Trưởng phòng', 'MANAGER');
        linkUser(ktHead, 'xuan.kt');
        addEdge(ktId, ktHead, greenEdge);

        const ktStaff = [
            { name: 'Bảo Ngọc', pos: 'kế toán', user: 'bngoc.kt' },
            { name: 'Hiếu Thảo', pos: 'kế toán', user: 'hthao.kt' },
        ];
        ktStaff.forEach((s, i) => {
            const sId = mkId();
            addNode(sId, 1040, 510 + i * 100, s.name, s.pos, getStaffRole(s.pos));
            linkUser(sId, s.user);
            addEdge(ktHead, sId, greenEdge);
        });

        // ═══════════════════════════════════════════
        //  8. MARKETING
        // ═══════════════════════════════════════════
        const mktId = mkId();
        addNode(mktId, 1310, 280, 'Marketing', '', 'BU');
        addEdge(viceId, mktId);

        const mktHead = mkId();
        addNode(mktHead, 1300, 390, 'Trọng Hiếu', 'Trưởng phòng', 'MANAGER');
        linkUser(mktHead, 'hi.mkt');
        addEdge(mktId, mktHead, greenEdge);

        const mktStaff = [
            { name: 'Hải Long', pos: 'Fanpage', user: 'long.mkt' },
            { name: 'Nhân sự', pos: 'marketing', user: 'ns.mkt' },
        ];
        mktStaff.forEach((s, i) => {
            const sId = mkId();
            addNode(sId, 1300, 510 + i * 100, s.name, s.pos, getStaffRole(s.pos));
            linkUser(sId, s.user);
            addEdge(mktHead, sId, greenEdge);
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setIsEditing(true);
        if(addToast) addToast('Đã tự động khởi tạo sơ đồ tổ chức 04/2026! Bạn có thể kéo thả chỉnh sửa rồi Lưu.', 'success');
    };

    if (loading) return <div style={{ padding: '2rem' }}>Đang tải Sơ đồ tổ chức...</div>;

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role_name === 'admin';

    // If not editing and empty chart, show a friendly message
    const isChartEmpty = nodes.length === 0;

    return (
        <div style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>SƠ ĐỒ TỔ CHỨC CÔNG TY</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Luồng báo cáo và cơ cấu phòng ban trực quan</p>
                </div>
                
                {isAdmin && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                <Edit3 size={16} /> Chỉnh sửa sơ đồ
                            </button>
                        ) : (
                            <>
                                <button onClick={handleAutoGenerate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                    ✨ Tạo sơ đồ chuẩn (04/2026)
                                </button>
                                <button onClick={handleAddNode} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                    <Plus size={16} /> Thêm Thẻ Mới
                                </button>
                                <button onClick={() => { loadData(); setIsEditing(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', color: '#475569', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                    <X size={16} /> Hủy bỏ
                                </button>
                                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                    <Save size={16} /> Lưu Thay Đổi
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                {!isEditing && isChartEmpty ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        <Target size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ margin: 0, color: '#64748b' }}>Sơ đồ chưa có dữ liệu</h3>
                        {isAdmin && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>Vui lòng bấm "Chỉnh sửa sơ đồ" để vẽ thủ công.</p>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>hoặc</span>
                                <button onClick={handleAutoGenerate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }}>
                                    ✨ Khởi tạo gợi ý từ Dữ liệu Hệ thống
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        nodesDraggable={isEditing}
                        nodesConnectable={isEditing}
                        elementsSelectable={isEditing}
                        panOnDrag={true} // Bật cả xem và sửa để họ có thể lướt qua lại
                        zoomOnScroll={true} // Bật để họ zoom to nhỏ
                        minZoom={0.2}
                        preventScrolling={!isEditing}
                        style={{ background: isEditing ? 'transparent' : '#fafafa' }} // Nền xám nhạt nhẹ nhàng khi xem
                    >
                        {isEditing && <Background color="#cbd5e1" gap={16} />}
                        {isEditing && <Controls />}
                        {isEditing && (
                            <MiniMap zoomable pannable nodeColor={(node) => {
                                switch (node.data?.roleType) {
                                    case 'CEO': return '#111827';
                                    case 'VICE_DIRECTOR': return '#b48e4b';
                                    case 'MANAGER': return '#f59e0b';
                                    case 'BU': return '#3b82f6';
                                    case 'OPERATIONS': return '#14b8a6';
                                    default: return '#22c55e';
                                }
                            }} />
                        )}
                    </ReactFlow>
                )}

                {/* Editor Panel */}
                {isEditing && selectedNode && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '320px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Chỉnh sửa Thẻ</h3>
                            <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>LIÊN KẾT NHANH TÀI KHOẢN (Tự điền ảnh/tên)</label>
                                <select 
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    onChange={(e) => handleLinkUser(e.target.value)}
                                >
                                    <option value="">-- Chọn user hệ thống --</option>
                                    {usersList.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>TÊN HIỂN THỊ TRÊN THẺ</label>
                                <input 
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    value={selectedNode.data.label}
                                    onChange={e => updateSelectedNodeData('label', e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>CHỨC VỤ / TÊN KHỐI PHÒNG BAN</label>
                                <input 
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    value={selectedNode.data.position}
                                    onChange={e => updateSelectedNodeData('position', e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>MÀU SẮC & CẤP BẬC</label>
                                <select 
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    value={selectedNode.data.roleType}
                                    onChange={e => updateSelectedNodeData('roleType', e.target.value)}
                                >
                                    <option value="CEO">Giám Đốc (Đen/Xanh)</option>
                                    <option value="VICE_DIRECTOR">Phó Giám Đốc (Vàng đồng)</option>
                                    <option value="MANAGER">Trưởng Phòng (Vàng rực)</option>
                                    <option value="BU">Khối BU (Xanh dương)</option>
                                    <option value="OPERATIONS">Điều hành (Xanh ngọc)</option>
                                    <option value="STAFF">Nhân viên (Xanh lá)</option>
                                </select>
                            </div>

                            <button onClick={handleDeleteNode} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={16} /> Xóa thẻ này
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile View Panel for regular click */}
                {!isEditing && viewingUser && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '320px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Hồ sơ tóm tắt</h3>
                            <button onClick={() => setViewingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '20px',
                                background: viewingUser.avatar_url ? `url(${viewingUser.avatar_url}) center/cover no-repeat` : '#e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#64748b',
                                border: '3px solid #f1f5f9'
                            }}>
                                {!viewingUser.avatar_url && viewingUser.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#1e293b' }}>{viewingUser.full_name}</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{viewingUser.position || viewingUser.role_name}</p>
                            </div>

                            <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Email:</span>
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{viewingUser.email}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Điện thoại:</span>
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{viewingUser.phone || 'Chưa cập nhật'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Ngày tham gia:</span>
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString('vi-VN') : '-'}</span>
                                </div>
                            </div>

                            <button onClick={() => { setViewingUser(null); if(addToast) addToast('Đã sao chép liên hệ', 'success'); }} style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#f1f5f9', color: '#475569', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                Đóng hồ sơ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrgChartTab;
