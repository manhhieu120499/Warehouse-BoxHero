export const styleMessage = {
    style: {
        fontSize: '1.5rem',
    },
};

export const mapperRole = {
    'Quản trị viên': {
        roleID: 1,
        roleName: 'SYSTEM_ADMIN'
    },
    'Quản lý kho': {
        roleID: 2,
       roleName: 'WARE_MANAGER'
    },
    'Nhân viên xuất hàng': {
        roleID: 3,
        roleName:'STOCK_DISPATCHER'
    },
    'Nhân viên nhận hàng': {
        roleID: 4,
        roleName: 'STOCK_RECEIVER'
    },
    'Kế toán': {
        roleID: 5,
        roleName: 'ACCOUNTANT'
    },
};

export const formatRole = {
    'SYSTEM_ADMIN': 'Quản trị viên',
    'WARE_MANAGER': 'Quản lý kho',
    'STOCK_RECEIVER': 'Nhân viên nhận hàng',
    'STOCK_DISPATCHER': 'Nhân viên xuất hàng',
    'ACCOUNTANT': 'Kế toán',
};

export const formatStatusProduct = {
    'AVAILABLE': 'Đang kinh doanh',
    'OUT_OF_STOCK': 'Hàng trong kho đã hết',
    'DISCONTINUED': 'Ngừng kinh doanh'
}
