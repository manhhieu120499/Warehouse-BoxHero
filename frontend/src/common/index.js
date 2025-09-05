const convertDateVN = (dateString) => {
    return new Date(dateString).toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace(' ', 'T');
};

export { convertDateVN };
