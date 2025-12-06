import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalEmployee.module.scss';
import { Button, Image, Modal } from '@/components';
import { Eye, XCircle, ArrowRightLeft } from 'lucide-react';
import Tippy from '@tippyjs/react';
import md5 from 'md5';
import { formatRole, mapperRole } from '../../constants';
import request from '@/utils/httpRequest';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

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
    placeholder,
}) => {
    return (
        <div className={cx('form-group')}>
            <label htmlFor={htmlForLabel}>{labelTitle}</label>
            <div className={cx('content-input')}>
                <input
                    id={idInput}
                    type={typeInput}
                    readOnly={readOnly}
                    value={valueInput}
                    onChange={onChange}
                    checked={checked}
                    placeholder={placeholder}
                />
                {children}
            </div>
        </div>
    );
};

const ModalEmployee = ({ isAdmin = false, data, children, onClose, setData, profile = false, action, className }) => {
    const [listWarehouseId, setListWarehouseId] = useState(['K01', 'K02', 'K03']);
    const [viewDetailRole, setViewDetailRole] = useState(false);
    //const [listRoleUser, setListRoleUser] = useState([]);
    const listRoleUser = data.empRole || [];
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const warehouse = useSelector((state) => state.WareHouseSlice.warehouse);

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
        setData((prev) => ({ ...prev, empId: `EP${salt}` }));
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
        setData((prev) => ({ ...prev, warehouseID: warehouse.warehouseID }));
    }, [warehouse]);

    const handleAddNewRole = (e) => {
        const checkRole = listRoleUser.find((item) => item.roleName == mapperRole[e.target.value].roleName);
        if (e.target.checked) {
            if (!checkRole)
                setData((prev) => {
                    const updateListRole = [...listRoleUser, mapperRole[e.target.value]];
                    return {
                        ...prev,
                        empRole: updateListRole,
                    };
                });
        } else {
            if (checkRole && listRoleUser.length > 1) {
                setData((prev) => ({
                    ...prev,
                    empRole: listRoleUser.filter((item) => item.roleName != mapperRole[e.target.value].roleName),
                }));
            } else {
                toast.error('Nhân viên phải có ít nhất một vai trò');
                return;
            }
        }
    };

    const handleUpdateRoleEmployee = () => {
        if (action == 'add') {
            setData((prev) => ({ ...prev, empRole: listRoleUser, empStatus: 'Đang làm' }));
            handleShowViewDetailRole();
        } else {
            //action == update
            setData((prev) => ({ ...prev, empRole: listRoleUser }));
            handleShowViewDetailRole();
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
                        <div style={{ width: '49%', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FormGroup
                                labelTitle={'Mã nhân viên'}
                                idInput={'employeeId'}
                                readOnly={true}
                                valueInput={data.empId}
                                typeInput={'text'}
                                placeholder={'Nhấn tạo mã'}
                            />
                            {isAdmin && action != 'update' && (
                                <Button
                                    primary
                                    className={cx('btn-create-employee-code')}
                                    onClick={handleCreateEmployeeId}
                                >
                                    <span>Tạo mã</span>
                                </Button>
                            )}
                        </div>

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

                        <FormGroup
                            labelTitle={'Mã kho'}
                            htmlForLabel={'warehouseID'}
                            typeInput={'text'}
                            valueInput={`${warehouse.warehouseID} - ${warehouse.warehouseName}`}
                            idInput={'warehouseID'}
                            readOnly
                        />
                    </div>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Ngày nghỉ làm'}
                            htmlForLabel={'employeeEndDate'}
                            typeInput={'date'}
                            valueInput={data.empEndDate}
                            idInput={'employeeEndDate'}
                            onChange={(e) => onChangeInput('empEndDate', e.target.value)}
                            readOnly={isAdmin && data.empStatus == 'Nghỉ việc' ? false : true}
                        />

                        <div className={cx('form-group')}>
                            <label htmlFor="employeeStatus">Trạng thái</label>
                            <select
                                id="employeeStatus"
                                onChange={(e) => onChangeInput('empStatus', e.target.value)}
                                disabled={action == 'add' || !isAdmin}
                            >
                                <option
                                    value={''}
                                    disabled
                                    selected={action == 'add' ? false : data.empStatus === ''}
                                ></option>
                                <option value={'Đang làm'} selected={action == 'add' || data.empStatus == 'Đang làm'}>
                                    Đang làm
                                </option>
                                <option value={'Nghỉ việc'} selected={data.empStatus == 'Nghỉ việc'}>
                                    Nghỉ việc
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Chức vụ'}
                            htmlForLabel={'employeeRole'}
                            typeInput={'text'}
                            valueInput={
                                data?.empRole ? data.empRole.map((role) => formatRole[role.roleName]).join(', ') : ''
                            }
                            idInput={'employeeRole'}
                            readOnly={true}
                            placeholder={'-- Thêm chức vụ --'}
                        />
                        <Tippy className={cx('role-view-btn')} content={'Xem tất cả quyền'} placement="top">
                            <Eye size={24} className={cx('view-detail')} onClick={handleShowViewDetailRole} />
                        </Tippy>
                    </div>
                    <div className={cx('form-action')}>{children}</div>
                </div>
            </div>

            <Modal
                isOpenInfo={viewDetailRole}
                onClose={handleShowViewDetailRole}
                arrButton={[
                    (index) => (
                        <Button key={index} primary medium borderRadiusSmall onClick={handleUpdateRoleEmployee}>
                            <span>Cập nhật</span>
                        </Button>
                    ),
                ]}
            >
                <div
                    className={cx('wrapper-role-employee', {
                        admin: isAdmin,
                    })}
                >
                    <div className={cx('wrapper-view-role')}>
                        <h2>🔐 Quyền Hiện Có</h2>
                        <div className={cx('view-role')}>
                            {listRoleUser.length > 0 ? (
                                listRoleUser.map((item, index) => (
                                    <div className={cx('role-item')} key={index}>
                                        <span className={cx('role-title')}>{formatRole[item.roleName]}</span>
                                    </div>
                                ))
                            ) : (
                                <div className={cx('role-item')}>
                                    <span className={cx('role-title')}>Chưa có quyền nào</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {isAdmin && (
                        <>
                            <div className={cx('icon-transfer')}>
                                <ArrowRightLeft size={24} />
                            </div>

                            <div className={cx('wrapper-list-role')}>
                                <h2>📋 Tất Cả Quyền</h2>
                                <div className={cx('list-role')}>
                                    {roleEmployee.map((item, index) => (
                                        <div className={cx('role-item')} key={index}>
                                            <input
                                                type="checkbox"
                                                value={item}
                                                onChange={handleAddNewRole}
                                                checked={data.empRole.find((role) => formatRole[role.roleName] == item)}
                                            />
                                            <span className={cx('role-title')}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ModalEmployee;
