import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './AuthPage.module.scss';
import { Image, Button, ModalCreateAccount, ModalEmployee, ModelFilter } from '@/components';
import { MyTable } from '@/components';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import Tippy from '@tippyjs/react';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import request, { post } from '../../utils/httpRequest';
import { uploadImage } from '../../utils/uploadImage';
import { useDispatch } from 'react-redux';
import { startLoading, stopLoading } from '../../lib/redux/loading/slice';
import { isOver18 } from '../../utils/validate';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);
const tableColumns = [
    {
        title: 'Mã nhân viên',
        dataIndex: 'empId',
        key: 'empId',
    },
    {
        title: 'Tên nhân viên',
        dataIndex: 'empName',
        key: 'empName',
    },
    {
        title: 'CCCD',
        dataIndex: 'empCCCD',
        key: 'empCCCD',
    },
    {
        title: 'Ngày sinh',
        dataIndex: 'empDob',
        key: 'empDob',
    },
    {
        title: 'Giới tính',
        dataIndex: 'gender',
        key: 'gender',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'empPhone',
        key: 'empPhone',
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'empAddress',
        key: 'empAddress',
    },
    {
        title: 'Ngày vào làm',
        dataIndex: 'empStartDate',
        key: 'empStartDate',
    },
    {
        title: 'Mã kho',
        dataIndex: 'warehouseId',
        key: 'warehouseId',
    },
    {
        title: 'Chức vụ',
        dataIndex: 'empRole',
        key: 'empRole',
    },
    {
        title: 'Trạng thái',
        dataIndex: 'empStatus',
        key: 'empStatus',
    },
    {
        title: 'Thao tác',
        dataIndex: 'action',
        key: 'action',
        render: (_, record) => {
            return (
                <div className={cxGlobal('action-table')}>
                    <Tippy content={'Xem lịch sử hoạt động'} placement="bottom-end">
                        <button className={cxGlobal('action-table-icon')} onClick={() => console.log(record.empId)}>
                            <Eye size={20} />
                        </button>
                    </Tippy>
                </div>
            );
        },
    },
];

const dataSource = [
    {
        key: '1',
        empId: 'NV001',
        empName: 'Nguyễn Văn A',
        empCCCD: '012345678901',
        empDob: '1990-01-01',
        gender: 'Nam',
        empPhone: '0901234567',
        empAddress: 'Hà Nội',
        empStartDate: '2020-05-01',
        warehouseId: 'K01',
        empRole: 'Quản trị viên',
        empStatus: 'Đang làm',
        empImage:
            'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    },
    {
        key: '2',
        empId: 'NV002',
        empName: 'Trần Thị B',
        empCCCD: '012345678902',
        empDob: '1992-03-15',
        gender: 'Nữ',
        empPhone: '0902345678',
        empAddress: 'TP.HCM',
        empStartDate: '2021-06-15',
        warehouseId: 'K02',
        empRole: 'Nhân viên xuất hàng',
        empStatus: 'Đang làm',
        empImage:
            'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    },
    {
        key: '3',
        empId: 'NV003',
        empName: 'Lê Văn C',
        empCCCD: '012345678903',
        empDob: '1995-07-20',
        gender: 'Nam',
        empPhone: '0903456789',
        empAddress: 'Đà Nẵng',
        empStartDate: '2022-01-10',
        warehouseId: 'K01',
        empRole: 'Nhân viên nhận hàng',
        empStatus: 'Nghỉ việc',
        empImage:
            'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    },
    {
        key: '4',
        empId: 'NV004',
        empName: 'Phạm Thị D',
        empCCCD: '012345678904',
        empDob: '1998-12-05',
        gender: 'Nữ',
        empPhone: '0904567890',
        empAddress: 'Cần Thơ',
        empStartDate: '2023-03-01',
        warehouseId: 'K03',
        empRole: 'Quản lý kho',
        empStatus: 'Đang làm',
        empImage:
            'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    },
    {
        key: '5',
        empId: 'NV005',
        empName: 'Đỗ Văn E',
        empCCCD: '012345678905',
        empDob: '2000-10-12',
        gender: 'Nam',
        empPhone: '0905678901',
        empAddress: 'Hải Phòng',
        empStartDate: '2024-01-20',
        warehouseId: 'K02',
        empRole: 'Kế toán',
        empStatus: 'Đang làm',
        empImage:
            'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    },
];

const columnsFilter = [
    {
        id: 1,
        label: 'Mã nhân viên',
    },
    {
        id: 2,
        label: 'Số điện thoại',
    },
    {
        id: 3,
        label: 'Chức vụ',
    },
];

const resetData = {
    empId: '',
    empName: '',
    empCCCD: '',
    empDob: '',
    gender: '',
    empPhone: '',
    empAddress: '',
    empStartDate: '',
    warehouseId: '',
    empRole: [],
    empStatus: '',
    empImage: '',
};

const AuthPage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [action, setAction] = useState({
        add: false,
        update: false,
        createAccount: false,
    });

    const [empData, setEmpData] = useState(resetData);
    const [showModalAccount, setShowModalAccount] = useState(false);
    const [account, setAccount] = useState({
        email: '',
        password: '',
        statusWork: 'Đang làm',
    });
    const dispatch = useDispatch();

    const [statusCreateAccount, setStatusCreateAccount] = useState(false);

    const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
            setAction((prev) => ({
                add: false,
                update: true,
                createAccount: false,
            }));
            window.scrollTo(top);
        },
    };

    const validateEmployeeData = (data) => {
        const {
            empId,
            empName,
            empCCCD,
            empDob,
            gender,
            empPhone,
            empAddress,
            empStartDate,
            warehouseId,
            empRole,
            empStatus,
            empImage,
        } = data;
        if (
            !empId ||
            !empName ||
            !empCCCD ||
            !empDob ||
            !gender ||
            !empPhone ||
            !empAddress ||
            !empStartDate ||
            !warehouseId ||
            empRole.length < 0 ||
            !empStatus ||
            !empImage
        ) {
            toast.error('Vui lòng điền đầy đủ thông tin!', {
                ...styleMessage
            });
            return false;
        }
        if (!/^[\p{L}\s]+$/u.test(empName)) {
            toast.error('Tên chỉ chứa chữ và khoảng trắng', {
                ...styleMessage
            });
            return false;
        }
        if (!/^\d{12}$/.test(empCCCD)) {
            toast.error('Căn cước công dân bắt buộc có độ dài 12 chữ số', {
                ...styleMessage
            });
            return false;
        }
        if (!/^(03|05|07|08|09)\d{8}$/.test(empPhone)) {
            toast.error('Số điện thoại có độ dài 10 chữ số và bắt đầu bằng 03 hoặc 05 hoặc 07 hoặc 08 hoặc 09', {
                ...styleMessage
            });
            return false;
        }
        if(new Date(empDob) > Date.now()) { 
            toast.error('Ngày sinh phải trước ngày hôm nay', {
                ...styleMessage
            });
            return false;
        }
        if(new Date(empDob) < Date.now()) {
            if(!isOver18(empDob)) {
                toast.error('Nhân viên phải bằng hoặc trên 18 tuổi', {
                    ...styleMessage
                })
                return false;
            }
        }
        if(new Date(empStartDate) < Date.now()) {
            toast.error('Ngày vào làm phải sau ngày hôm nay', {
                ...styleMessage
            })
            return false;
        }
        return true;
    };

    const handleAddEmployee = async () => {
        console.log(empData);
        if (!statusCreateAccount) {
            toast.error('Vui lòng tạo tài khoản cho nhân viên trước khi thêm nhân viên', {
                ...styleMessage,
            });
            return;
        }
        // validate dữ liệu
        if (!validateEmployeeData(empData)) return;
        try {
            dispatch(startLoading());
            const token = JSON.parse(localStorage.getItem('tokenUser'));
            const imageUrl = await uploadImage(empData.empImage);
            const requestData = {
                employeeID: empData.empId,
                email: account.email,
                password: account.password,
                confirmPassword: account.password,
                statusWork: account.statusWork == 'Đang làm' ? 'active' : 'inactive',
                employeeName: empData.empName,
                cccd: empData.empCCCD,
                dob: empData.empDob,
                phoneNumber: empData.empPhone,
                gender: empData.gender == 'Nam' ? 'male' : 'female',
                image: imageUrl,
                address: empData.empAddress,
                startDate: empData.empStartDate,
                endDate: null,
                roles: empData.empRole,
                warehouseID: empData.warehouseId,
            };
            //call api thêm nhân viên
            const response = await request.post('/api/account/sign-up', requestData, {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: requestData.warehouseID,
                },
            });
            dispatch(stopLoading());
            toast.success('Thêm nhân viên mới thành công', styleMessage);
            setEmpData(resetData);
            setAccount({
                email: '',
                password: '',
                statusWork: 'Đang làm',
            });
            setStatusCreateAccount(false);
        } catch (err) {
            dispatch(stopLoading())
            console.log(err);
            const message = typeof err.response.data.message == Object ? err.response.data.message.map((item) => item).join(',') : err.response.data.message

            toast.error(message, styleMessage);

        }
    };

    const handleCloseModal = (key, value) => {
        if (key === 'update') {
            setSelectedRowKeys((prev) => []);
        }
        setAction((prev) => ({ ...prev, [key]: value }));
        setEmpData(resetData);
    };

    useEffect(() => {
        if (selectedRowKeys.length > 0) {
            console.log(selectedRowKeys);
            setEmpData(dataSource[Number.parseInt(selectedRowKeys[0]) - 1]);
        }
    }, [selectedRowKeys]);

    const handleUpdateEmployee = useCallback(async () => {
        try {
            // call api update employee
        } catch (err) {
            // throw err
        }
    }, []);

    const showModalCreateAccount = async () => {
        try {
            // call api check empId exist
            setShowModalAccount((prev) => !prev);
        } catch (err) {
            toast.error('Vui lòng tạo nhân viên trước khi tạo tài khoản');
        }
    };

    return (
        <div className={cx('wrapper-auth')}>
            {action.add && (
                <ModalEmployee
                    data={empData}
                    isAdmin={true}
                    onClose={() => handleCloseModal('add', false)}
                    setData={setEmpData}
                    action={'add'}
                >
                    <>
                        <Button primary onClick={handleAddEmployee}>
                            <span>Thêm nhân viên</span>
                        </Button>
                        <Button primary onClick={showModalCreateAccount}>
                            <span>Tạo tài khoản</span>
                        </Button>
                    </>
                </ModalEmployee>
            )}
            {action.update && (
                <ModalEmployee
                    isAdmin={true}
                    data={empData}
                    onClose={() => handleCloseModal('update', false)}
                    setData={setEmpData}
                    action={'update'}
                >
                    <Button primary onClick={handleUpdateEmployee}>
                        <span>Cập nhật</span>
                    </Button>
                </ModalEmployee>
            )}

            {/** Lọc theo điều kiện */}
            <ModelFilter columns={columnsFilter}>
                <Button primary onClick={() => handleCloseModal('add', true)} disabled={action.add}>
                    <span>Thêm nhân viên</span>
                </Button>
            </ModelFilter>

            <h1>Danh sách nhân viên</h1>
            <MyTable
                rowSelection={rowSelection}
                data={dataSource}
                columns={tableColumns}
                pageSize={4}
                pagination
                className={cx('my-table-employee')}
            ></MyTable>

            {showModalAccount && (
                <ModalCreateAccount
                    isOpen={showModalAccount}
                    onClose={() => setShowModalAccount((prev) => !prev)}
                    setAccount={setAccount}
                    setStatusCreateAccount={setStatusCreateAccount}
                />
            )}
        </div>
    );
};

export default AuthPage;
