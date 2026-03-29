const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        if (req.user && allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ 
                message: `Quyền truy cập bị từ chối. Khu vực này chỉ dành cho: ${allowedRoles.join(', ')}.` 
            });
        }
    };
};

module.exports = roleCheck;
