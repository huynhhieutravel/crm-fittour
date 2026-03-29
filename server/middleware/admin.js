const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        next();
    } else {
        res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên hoặc Quản lý.' });
    }
};

module.exports = admin;
