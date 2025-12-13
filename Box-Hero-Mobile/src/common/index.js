import _ from 'lodash';

const convertDateVN = (dateString) => {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh',
    };

    return new Intl.DateTimeFormat('sv-SE', options).format(date);
};

const handleCopy = (data) => {
    return _.cloneDeep(data);
};

const authIsAdmin = (user) => {
    return user?.empRole?.some((role) => role.roleName === 'SYSTEM_ADMIN' || role.roleName === 'WARE_MANAGER');
};

const authIsAdminOrAccountant = (user) => {
    return user?.empRole?.some(
        (role) =>
            role.roleName === 'SYSTEM_ADMIN' || role.roleName === 'WARE_MANAGER' || role.roleName === 'ACCOUNTANT',
    );
};

const authIsAdminOrReceiver = (user) => {
    return user?.empRole?.some(
        (role) =>
            role.roleName === 'SYSTEM_ADMIN' || role.roleName === 'WARE_MANAGER' || role.roleName === 'STOCK_RECEIVER',
    );
};

const authIsAdminOrDispatcher = (user) => {
    return user?.empRole?.some(
        (role) =>
            role.roleName === 'SYSTEM_ADMIN' ||
            role.roleName === 'WARE_MANAGER' ||
            role.roleName === 'STOCK_DISPATCHER',
    );
};

export {
    convertDateVN,
    handleCopy,
    authIsAdmin,
    authIsAdminOrAccountant,
    authIsAdminOrReceiver,
    authIsAdminOrDispatcher,
};
