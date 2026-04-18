export const formatRoleDisplayName = (roleName) => {
    switch (roleName) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Trưởng phòng';
      case 'sales': return 'Sale';
      case 'marketing': return 'Marketing';
      case 'operations': return 'Điều hành';
      case 'operations_lead': return 'Trưởng ĐH';
      case 'group_staff': return 'Sale BU3';
      case 'group_operations': return 'Điều hành BU3';
      case 'group_manager': return 'Trưởng nhóm BU3';
      case 'group_operations_lead': return 'Trưởng nhóm ĐH BU3';
      default: return roleName ? String(roleName).replace(/_/g, ' ') : 'Nhân viên';
    }
};
