import React from 'react';
import LeaderDashboardView from '../components/LeaderDashboardView';

const DashboardTab = ({ user, leads, setEditingLead }) => {
  // Mở LeaderDashboardView (Tổng quan hệ thống toàn diện) cho TẤT CẢ mọi người theo yêu cầu
  return <LeaderDashboardView user={user} leads={leads} setEditingLead={setEditingLead} />;
};

export default DashboardTab;
