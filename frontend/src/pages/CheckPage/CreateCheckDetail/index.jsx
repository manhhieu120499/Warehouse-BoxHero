import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateCheckDetail.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import PopupMessage from '../../../components/PopupMessage';
import { formatStatusInventoryCheckDetail, styleMessage } from '../../../constants';
import { generateCode } from '../../../utils/generate';
import { useSelector } from 'react-redux';
import parseToken from '../../../utils/parseToken';
import request from '../../../utils/httpRequest';
import toast from 'react-hot-toast';
import Tippy from '@tippyjs/react';
import { Eye } from 'lucide-react';
import ShowLocationDetail from '../ShowLocationDetail';
import { updateInventoryCheck } from '../../../services/inventoryCheck.service';
import { authIsAdmin } from '../../../common';

const cx = classNames.bind(styles);

const CreateCheckDetail = ({
    isOpen,
    onClose,
    inventoryCheckDetail,
    type = 'create',
    fetchData,
    listBatchBoxCheck,
    handleOnclose,
}) => {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [inventoryCheckId, setInventoryCheckId] = useState('');
    const [note, setNote] = useState('');
    const [listBatchBox, setListBatchBox] = useState();

    const handleActualQuantityChange = (e, index, systemQuantity) => {
        const value = e.target.value;
        const difference = Number(value) - systemQuantity;
        setListBatchBox((prevDetails) =>
            prevDetails.map((item, i) =>
                i === index ? { ...item, actualQuantity: value, discrepancyQuantity: difference } : item,
            ),
        );
    };

    useEffect(() => {
        if (type === 'create') {
            const mapConvert = listBatchBoxCheck.flatMap((box) =>
                box.batches.map((batch) => ({
                    ...batch,
                    boxID: box.boxID,
                    location: box.location,
                    systemQuantity: batch.batch_boxes.quantity,
                    actualQuantity: batch.batch_boxes.quantity,
                    discrepancyQuantity: 0,
                    reason: '',
                })),
            );
            setListBatchBox(mapConvert);
        }
    }, []);

    const handleSaveInventoryCheck = async () => {
        let status = 'BALANCED';
        if (!inventoryCheckId) {
            toast.error('Vui lòng nhập mã phiếu kiểm kê', styleMessage);
            return;
        }
        for (const item of listBatchBox) {
            if (item.actualQuantity === null || item.actualQuantity === undefined) {
                toast.error('Vui lòng nhập số lượng thực tế cho sản phẩm ' + item.product.productName, styleMessage);
                return;
            }
            if (item.discrepancyQuantity != 0) {
                status = 'DISCREPANCY';
                break;
            }
        }
        const warehouse = parseToken('warehouse');
        const token = parseToken('tokenUser');

        const data = {
            inventoryCheckID: inventoryCheckId,
            employeeID: currentUser.empId,
            warehouseID: warehouse.warehouseID,
            note: note,
            checkStatus: status,
            details: listBatchBox.map((item) => ({
                batchID: item.batchID,
                boxID: item.boxID,
                systemQuantity: item.systemQuantity,
                actualQuantity: item.actualQuantity ? Number(item.actualQuantity) : 0,
                discrepancyQuantity: item.discrepancyQuantity ? Number(item.discrepancyQuantity) : 0,
                reason: item.reason,
            })),
        };
        try {
            await request.post('/api/inventory-check/create-inventory-checks', data, {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            });
            toast.success('Tạo phiếu kiểm kê thành công', styleMessage);
            onClose();
            handleOnclose();
            fetchData();
        } catch (err) {
            toast.error(
                Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
                styleMessage,
            );
            console.log(err);
        }
    };

    const handleBlur = (e) => {
        const value = e.target.value;
        const numberValue = Number(value);

        if (value === '' || numberValue < 0 || !Number.isInteger(numberValue)) {
            toast.error('Số lượng thực tế không được để trống, nhỏ hơn 0, hoặc không nguyên!', styleMessage);

            e.target.focus();

            e.target.select();
        }
    };

    const handleUpdateStatus = async (status, inventoryCheckID) => {
        const res = await updateInventoryCheck(status, inventoryCheckID);
        if (res.data.status === 'OK') {
            toast.success('Cập nhật trạng thái phiếu kiểm kê thành công', styleMessage);
            onClose();
            fetchData();
        }
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-check')}>
                <div className={cx('info-check', 'container-check')}>
                    <div className={cx('header-check')}>
                        <h4>Thông tin phiếu kiểm kê</h4>
                        <div className={cx('headerActions')}>
                            {type === 'detail' &&
                                inventoryCheckDetail?.status === 'PENDING' &&
                                authIsAdmin(currentUser) && (
                                    <>
                                        <Button
                                            error
                                            className={cx('btn-generate')}
                                            onClick={() =>
                                                handleUpdateStatus('REFUSE', inventoryCheckDetail?.inventoryCheckID)
                                            }
                                        >
                                            Từ chối
                                        </Button>
                                        <Button
                                            success
                                            className={cx('btn-generate')}
                                            onClick={() =>
                                                handleUpdateStatus('COMPLETED', inventoryCheckDetail?.inventoryCheckID)
                                            }
                                        >
                                            Phê duyệt
                                        </Button>
                                    </>
                                )}
                            <Button primary borderRadiusMedium onClick={onClose}>
                                <span>Đóng</span>
                            </Button>
                            {type === 'create' && (
                                <Button success className={cx('btn-generate')} onClick={handleSaveInventoryCheck}>
                                    Lưu phiếu
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={cx('form-info')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="inventoryCheckId">Mã phiếu kiểm kê</label>
                            <div className={cx('input-generate')}>
                                <input
                                    type="text"
                                    id="inventoryCheckId"
                                    value={
                                        type === 'create' ? inventoryCheckId : inventoryCheckDetail?.inventoryCheckID
                                    }
                                    onChange={(e) => setInventoryCheckId(e.target.value)}
                                    placeholder="Nhập mã phiếu kiểm kê"
                                    disabled={type === 'detail'}
                                />
                                {type === 'create' && (
                                    <Button
                                        primary
                                        className={cx('btn-generate')}
                                        onClick={() => {
                                            setInventoryCheckId(generateCode('IVC-'));
                                        }}
                                    >
                                        Tạo mã phiếu
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="inventoryCheckDate">Ngày tạo phiếu</label>
                            <input
                                type="date"
                                id="inventoryCheckDate"
                                value={
                                    inventoryCheckDetail?.createdAt
                                        ? new Date(inventoryCheckDetail.createdAt).toISOString().split('T')[0]
                                        : new Date().toISOString().split('T')[0]
                                }
                                placeholder="Chọn ngày kiểm kê"
                                disabled
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="staffName">Người lập phiếu</label>
                            <input
                                type="text"
                                id="staffName"
                                value={
                                    type === 'create'
                                        ? currentUser?.empName
                                        : inventoryCheckDetail?.employee?.employeeName
                                }
                                placeholder="Nhập tên nhân viên phụ trách kiểm kê"
                                disabled
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="note">Ghi chú</label>
                            <input
                                type="text"
                                id="note"
                                value={type === 'create' ? note : inventoryCheckDetail?.note || 'Không có ghi chú'}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập ghi chú"
                                disabled={type === 'detail'}
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('table-check', 'container-check')}>
                    <div className={cx('title-table')}>
                        <h4>Danh sách hàng hóa kiểm kê</h4>
                    </div>
                    <div className={cx('tableWrap')}>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th className={cx('location')}>Vị trí</th>
                                    <th className={cx('batchID')}>Mã lô</th>
                                    <th className={cx('productName')}>Tên sản phẩm</th>
                                    <th className={cx('unit')}>Đơn vị tính</th>
                                    {type === 'detail' && <th className={cx('status')}>Trạng thái</th>}
                                    <th className={cx('num')}>Tồn hệ thống</th>
                                    <th className={cx('num')}>Tồn thực tế</th>
                                    <th className={cx('num')}>Chênh lệch</th>
                                    <th className={cx('note')}>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {type === 'create' &&
                                    listBatchBox?.map((batchBoxCheck, index) => (
                                        <tr key={index}>
                                            <td className={cx('location')}>{batchBoxCheck.location}</td>
                                            <td className={cx('batchID')}>{batchBoxCheck.batchID}</td>
                                            <td className={cx('productName')}>{batchBoxCheck.product.productName}</td>
                                            <td className={cx('unit')}>{batchBoxCheck.unit.unitName}</td>
                                            <td className={cx('num')}>{batchBoxCheck.systemQuantity}</td>
                                            <td className={cx('num')}>
                                                {type === 'create' ? (
                                                    <input
                                                        type="number"
                                                        value={batchBoxCheck.actualQuantity}
                                                        onChange={(e) =>
                                                            handleActualQuantityChange(
                                                                e,
                                                                index,
                                                                batchBoxCheck.systemQuantity,
                                                            )
                                                        }
                                                        onBlur={(e) => handleBlur(e)}
                                                        min={0}
                                                    />
                                                ) : (
                                                    batchBoxCheck.actualQuantity
                                                )}
                                            </td>
                                            <td
                                                className={cx([
                                                    'num',
                                                    Math.abs(batchBoxCheck.discrepancyQuantity) !== 0 && 'highlight',
                                                ])}
                                            >
                                                {Math.abs(batchBoxCheck.discrepancyQuantity)}
                                            </td>
                                            <td className={cx('note')}>
                                                {type === 'create' ? (
                                                    <input
                                                        type="text"
                                                        value={batchBoxCheck.reason}
                                                        onChange={(e) => {
                                                            const reason = e.target.value;
                                                            setListBatchBox((prevList) =>
                                                                prevList.map((item, idx) =>
                                                                    idx === index ? { ...item, reason } : item,
                                                                ),
                                                            );
                                                        }}
                                                        placeholder="Nhập ghi chú"
                                                    />
                                                ) : (
                                                    batchBoxCheck.reason
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                {type === 'detail' &&
                                    inventoryCheckDetail?.details.map((detail, index) => {
                                        const location = `${detail.batchBoxByBatch.box.floor.shelf.shelfName} - ${detail.batchBoxByBatch.box.floor.floorName} - ${detail.batchBoxByBatch.box.boxName}`;
                                        return (
                                            <tr key={index}>
                                                <td className={cx('location')}>{location}</td>

                                                <td className={cx('batchID')}>
                                                    {detail.batchBoxByBatch.batch.batchID}
                                                </td>
                                                <td className={cx('productName')}>
                                                    {detail.batchBoxByBatch.batch.product.productName}
                                                </td>
                                                <td className={cx('unit')}>
                                                    {detail.batchBoxByBatch.batch.unit.unitName}
                                                </td>
                                                <td
                                                    className={cx([
                                                        'status',
                                                        Math.abs(detail.discrepancyQuantity) !== 0 && 'highlight',
                                                    ])}
                                                >
                                                    {formatStatusInventoryCheckDetail[detail.status]}
                                                </td>
                                                <td className={cx('num')}>{detail.systemQuantity}</td>
                                                <td className={cx('num')}>{detail.actualQuantity}</td>
                                                <td
                                                    className={cx([
                                                        'num',
                                                        Math.abs(detail.discrepancyQuantity) !== 0 && 'highlight',
                                                    ])}
                                                >
                                                    {Math.abs(detail.discrepancyQuantity)}
                                                </td>
                                                <td className={cx('note')}>{detail.reason || 'Không có ghi chú'}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CreateCheckDetail;
