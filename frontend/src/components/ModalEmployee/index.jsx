import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalEmployee.module.scss';
import { Button, Image, Modal } from '@/components';
import { Eye, XCircle, ArrowRightLeft } from 'lucide-react';
import Tippy from '@tippyjs/react';
import md5 from 'md5';
import { formatRole, mapperRole } from '../../constants';
import request from "@/utils/httpRequest"
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);
const roleEmployee = ['Quản lý kho', 'Nhân viên nhận hàng', 'Nhân viên xuất hàng', 'Kế toán'];

const FormGroup = ({
    labelTitle,
    htmlForLabel,
    typeInput,
    valueInput,
    children,
    readOnly,
    idInput,
    onChange,
    checked = false,
}) => {
    return (
        <div className={cx('form-group')}>
            <label htmlFor={htmlForLabel}>{labelTitle}</label>
            <input
                id={idInput}
                type={typeInput}
                readOnly={readOnly}
                value={valueInput}
                onChange={onChange}
                checked={checked}
            />
            {children}
        </div>
    );
};

const ModalEmployee = ({ isAdmin = false, data, children, onClose, setData, profile = false, action, className }) => {
    const [listWarehouseId, setListWarehouseId] = useState(['K01', 'K02', 'K03']);
    const [viewDetailRole, setViewDetailRole] = useState(false);
    //const [listRoleUser, setListRoleUser] = useState([]);
    const listRoleUser = data.empRole || [];
    const currentUser = useSelector(state => state.AuthSlice.user)

    const imageRef = useRef();
    const handleUploadImage = () => {
        imageRef.current.click();
    };

    const handlePreviewImage = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            const url = reader.result;
            setData((prev) => ({ ...prev, empImage: url }));
        };
    };

    const onChangeInput = (key, value) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const handleCreateEmployeeId = useCallback(() => {
        const salt = md5(Date.now()).slice(-5);
        setData((prev) => ({ ...prev, empId: `NV${salt}` }));
        // return empId
    }, []);

    const handleShowViewDetailRole = () => {
        setViewDetailRole((prev) => !prev);
    };

    // useEffect(() => {
    //     if (data && data.empRole !== "") {
    //         setListRoleUser(data.empRole.split(','));
    //     }
    // }, []);

    useEffect(() => {
        //fetch all warehouse
        const fetchWarehouseList = async () => {
            const token = JSON.parse(localStorage.getItem('tokenUser'))
            
            try{
                const response = await request.get('/api/warehouse/list', {
                    headers: {
                        token: `Beare ${token.accessToken}`,
                        employeeid: currentUser.empId
                    }
                })
                const formatWarehouseId = response.data.warehouses.map(ware => ware.warehouseID)
                setListWarehouseId(formatWarehouseId)
            }catch(err) {
                setListWarehouseId([])
            }
        }

        fetchWarehouseList()
    }, []);

    const handleAddNewRole = (e) => {
        if (e.target.checked) {
            if (!listRoleUser.includes(e.target.value))
                setData((prev) => {
                const updateListRole = [...listRoleUser, mapperRole[e.target.value]]
                return ({
                    ...prev,
                    empRole: updateListRole
                })});
        } else {
            if (listRoleUser.includes(e.target.value)) {
                setData((prev) => ({
                    ...prev,
                    empRole: listRoleUser.filter((item) => item.roleName != mapperRole[e.target.value].roleName)
                }));
            }
        }
    };

    const handleUpdateRoleEmployee = () => {
        if (action == 'add') {
            //console.log(listRoleUser);
            setData((prev) => ({ ...prev, empRole: listRoleUser}));
            handleShowViewDetailRole();
        } else {
            //
        }
    };

    return (
        <div className={cx('modal-employee-info', className)}>
            <div className={cx('modal-header')}>
                <h1>Thông tin nhân viên</h1>
                {location.pathname === '/auth' && (
                    <XCircle size={22} className={cx('btn-close-modal')} onClick={onClose} />
                )}
            </div>

            <div className={cx('content')}>
                <div className={cx('image-preview')}>
                    <Image
                        classname={cx('image-upload')}
                        src={
                            data.empImage === ''
                                ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png'
                                : data.empImage
                        }
                        alt={'image-employee'}
                    />
                    <input ref={imageRef} type="file" hidden onChange={handlePreviewImage} />
                    {!profile && (
                        <Button className={cx('btn-upload')} primary onClick={handleUploadImage}>
                            <span>Tải ảnh lên</span>
                        </Button>
                    )}
                </div>
                <div className={cx('info')}>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Mã nhân viên'}
                            idInput={'employeeId'}
                            readOnly={true}
                            valueInput={data.empId}
                            typeInput={'text'}
                        >
                            {isAdmin && (
                                <Button
                                    primary
                                    className={cx('btn-create-employee-code')}
                                    onClick={handleCreateEmployeeId}
                                >
                                    <span>Tạo mã</span>
                                </Button>
                            )}
                        </FormGroup>
                        <FormGroup
                            labelTitle={'Tên nhân viên'}
                            htmlForLabel={'employeeName'}
                            typeInput={'text'}
                            valueInput={data.empName}
                            idInput={'employeeName'}
                            onChange={(e) => onChangeInput('empName', e.target.value)}
                            readOnly={isAdmin ? false : true}
                        />
                    </div>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'CCCD'}
                            htmlForLabel={'employeeempCCCD'}
                            typeInput={'text'}
                            valueInput={data.empCCCD}
                            idInput={'employeeempCCCD'}
                            onChange={(e) => onChangeInput('empCCCD', e.target.value)}
                            readOnly={isAdmin ? false : true}
                        />

                        <FormGroup
                            labelTitle={'Ngày sinh'}
                            htmlForLabel={'employeeDob'}
                            typeInput={'date'}
                            valueInput={data.empDob}
                            idInput={'employeeDob'}
                            onChange={(e) => onChangeInput('empDob', e.target.value)}
                            readOnly={isAdmin ? false : true}
                        />
                    </div>
                    <div className={cx('row')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="employeeempCCCD">Giới tính</label>
                            <div className={cx('form-group-item')}>
                                <label htmlFor="employeeMaleGender">Nam</label>
                                <input
                                    id="employeeMaleGender"
                                    name="gender"
                                    type="radio"
                                    value={'Nam'}
                                    checked={data.gender === 'Nam' ? true : false}
                                    onChange={(e) => onChangeInput('gender', e.target.value)}
                                />
                                <label htmlFor="employeeFemaleGender">Nữ</label>
                                <input
                                    id="employeeFemaleGender"
                                    name="gender"
                                    type="radio"
                                    value={'Nữ'}
                                    checked={data.gender === 'Nữ' ? true : false}
                                    onChange={(e) => onChangeInput('gender', e.target.value)}
                                />
                            </div>
                        </div>
                        <FormGroup
                            labelTitle={'Số điện thoại'}
                            htmlForLabel={'employeePhone'}
                            typeInput={'text'}
                            valueInput={data.empPhone}
                            idInput={'employeePhone'}
                            onChange={(e) => onChangeInput('empPhone', e.target.value)}
                            readOnly={isAdmin ? false : true}
                        />
                    </div>
                    <FormGroup
                        labelTitle={'Địa chỉ'}
                        htmlForLabel={'employeeAddress'}
                        typeInput={'text'}
                        valueInput={data.empAddress}
                        idInput={'employeeAddress'}
                        onChange={(e) => onChangeInput('empAddress', e.target.value)}
                        readOnly={isAdmin ? false : true}
                    />

                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Ngày vào làm'}
                            htmlForLabel={'employeeStartDate'}
                            typeInput={'date'}
                            valueInput={data.empStartDate}
                            idInput={'employeeStartDate'}
                            onChange={(e) => onChangeInput('empStartDate', e.target.value)}
                            readOnly={isAdmin ? false : true}
                        />

                        <div className={cx('form-group')}>
                            <label htmlFor="warehouseId">Mã kho</label>
                            <select
                                id="warehouseId"
                                defaultValue={data.warehouseId}
                                onChange={(e) => onChangeInput('warehouseId', e.target.value)}
                                disabled={!isAdmin}
                            >
                                <option value={''} disabled selected={data.warehouseId === ''}></option>
                                {listWarehouseId.map((item, index) => (
                                    <option key={index} value={item} selected={data.warehouseId === item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Chức vụ'}
                            htmlForLabel={'employeeRole'}
                            typeInput={'text'}
                            valueInput={data.empRole.map(role => formatRole[role.roleName])}
                            idInput={'employeeRole'}
                            onChange={(e) => onChangeInput('employeeRole', e.target.value)}
                            readOnly={isAdmin ? false : true}
                        >
                            <Tippy content={'Xem tất cả quyền'}>
                                <Eye size={22} className={cx('view-detail')} onClick={handleShowViewDetailRole} />
                            </Tippy>
                        </FormGroup>
                        <div className={cx('form-group')}>
                            <label htmlFor="employeeStatus">Trạng thái</label>
                            <select
                                id="employeeStatus"
                                defaultValue={data.empStatus}
                                onChange={(e) => onChangeInput('empStatus', e.target.value)}
                                disabled={!isAdmin}
                            >
                                <option value={''} disabled selected={data.empStatus === ''}></option>
                                <option value={'Đang làm'} selected={data.empStatus == 'Đang làm'}>
                                    Đang làm
                                </option>
                                <option value={'Nghỉ việc'} selected={data.empStatus == 'Nghỉ việc'}>
                                    Nghỉ việc
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('form-action')}>{children}</div>
                </div>
            </div>

            <Modal isOpenInfo={viewDetailRole} onClose={handleShowViewDetailRole}>
                <div
                    className={cx('wrapper-role-employee', {
                        admin: isAdmin,
                    })}
                >
                    <div className={cx('wrapper-view-role')}>
                        <h2>Các quyền truy cập hiện có</h2>
                        <div className={cx('view-role')}>
                            {listRoleUser.map((item, index) => (
                                <div className={cx('role-item')} key={index}>
                                    <span className={cx('role-title')}>{formatRole[item.roleName]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {isAdmin && (
                        <>
                            <ArrowRightLeft className={cx('icon-transfer')} size={22} />
                            <div className={cx('wrapper-list-role')}>
                                <h2>Danh sách các quyền truy cập</h2>
                                <div className={cx('list-role')}>
                                    {roleEmployee.map((item, index) => (
                                        <div className={cx('role-item')} key={index}>
                                            <input
                                                type="checkbox"
                                                value={item}
                                                onChange={handleAddNewRole}
                                                checked={
                                                    data.empRole.find(role => formatRole[role.roleName] == item)
                                                }
                                            />
                                            <span className={cx('role-title')}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {isAdmin && (
                    <Button
                        primary
                        medium
                        borderRadiusSmall
                        className={cx('btn-update-role')}
                        onClick={handleUpdateRoleEmployee}
                    >
                        <span>Cập nhật</span>
                    </Button>
                )}
            </Modal>
        </div>
    );
};

export default ModalEmployee;
