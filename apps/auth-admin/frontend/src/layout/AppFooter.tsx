import React from 'react';

const AppFooter = () => {
    return (
        <div className="layout-footer">
            <span className="font-medium ml-2">InterLogIQ Fleet Management System</span>
            <span className="font-medium ml-2">© {new Date().getFullYear()} InterLogIQ. All rights reserved.</span>
        </div>
    );
};

export default AppFooter;
