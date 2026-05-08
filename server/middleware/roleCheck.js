const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = (req.user?.role || '').toLowerCase();
        if (req.user && allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
            next();
        } else {
            res.status(403).json({ 
                message: `Quyền truy cập bị từ chối. Khu vực này chỉ dành cho: ${allowedRoles.join(', ')}.` 
            });
        }
    };
};

module.exports = roleCheck;
