import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateCheckDetail.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import { QRCode } from 'antd';
import PopupMessage from '../../../components/PopupMessage';
import { formatStatusInventoryCheckDetail, styleMessage } from '../../../constants';
import { generateCode } from '../../../utils/generate';
import { useSelector } from 'react-redux';
import parseToken from '../../../utils/parseToken';
import request from '../../../utils/httpRequest';
import toast from 'react-hot-toast';
import Tippy from '@tippyjs/react';
import { Eye, Printer as PrinterIcon } from 'lucide-react';
import Printer from '../../../components/Printer';
import ShowLocationDetail from '../ShowLocationDetail';
import { updateInventoryCheck } from '../../../services/inventoryCheck.service';
import { authIsAdmin } from '../../../common';

const cx = classNames.bind(styles);

const InventoryCheckContent = ({
    type,
    inventoryCheckDetail,
    currentUser,
    inventoryCheckId,
    setInventoryCheckId,
    note,
    setNote,
    listBatchBox,
    setListBatchBox,
    handleUpdateStatus,
    handleSaveInventoryCheck,
    onClose,
    isPrint = false,
}) => {
    return (
        <div className={cx('wrapper-check')}>
            <div className={cx('info-check', 'container-check')}>
                <div className={cx('header-check')}>
                    <h4>Thông tin phiếu kiểm kê</h4>
                    <div className={cx('headerActions')}>
                        {!isPrint && (
                            <>
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
                                                    handleUpdateStatus(
                                                        'COMPLETED',
                                                        inventoryCheckDetail?.inventoryCheckID,
                                                    )
                                                }
                                            >
                                                Phê duyệt
                                            </Button>
                                        </>
                                    )}
                                {type !== 'create' && (
                                    <Printer
                                        buttonLabel="In phiếu"
                                        propsButton={{
                                            primary: true,
                                            className: cx('btn-generate'),
                                            style: { marginRight: '10px' },
                                        }}
                                    >
                                        <InventoryCheckContent
                                            isPrint={true}
                                            type={type}
                                            inventoryCheckDetail={inventoryCheckDetail}
                                            currentUser={currentUser}
                                            inventoryCheckId={inventoryCheckId}
                                            setInventoryCheckId={setInventoryCheckId}
                                            note={note}
                                            setNote={setNote}
                                            listBatchBox={listBatchBox}
                                            setListBatchBox={setListBatchBox}
                                            handleUpdateStatus={handleUpdateStatus}
                                            handleSaveInventoryCheck={handleSaveInventoryCheck}
                                            onClose={onClose}
                                        />
                                    </Printer>
                                )}
                                <Button primary borderRadiusMedium onClick={onClose}>
                                    <span>Đóng</span>
                                </Button>
                                {type === 'create' && (
                                    <Button success className={cx('btn-generate')} onClick={handleSaveInventoryCheck}>
                                        Lưu phiếu
                                    </Button>
                                )}
                            </>
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
                                value={type === 'create' ? inventoryCheckId : inventoryCheckDetail?.inventoryCheckID}
                                onChange={(e) => setInventoryCheckId(e.target.value)}
                                placeholder="Nhập mã phiếu kiểm kê"
                                disabled={type === 'detail'}
                            />
                            {type === 'create' && !isPrint && (
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
                                type === 'create' ? currentUser?.empName : inventoryCheckDetail?.employee?.employeeName
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
                                {type === 'detail' && inventoryCheckDetail?.status !== 'PENDING_CHECK' && (
                                    <th className={cx('status')}>Trạng thái</th>
                                )}
                                <th className={cx('num')}>Tồn hệ thống</th>
                                {type !== 'create' && inventoryCheckDetail?.status !== 'PENDING_CHECK' && (
                                    <>
                                        <th className={cx('num')}>Tồn thực tế</th>
                                        <th className={cx('num')}>Chênh lệch</th>
                                    </>
                                )}
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
                                    console.log(detail);

                                    const location = `${detail.batchBoxByBatch.box.floor.shelf.shelfName} - ${detail.batchBoxByBatch.box.floor.floorName} - ${detail.batchBoxByBatch.box.boxName}`;
                                    return (
                                        <tr key={index}>
                                            <td className={cx('location')}>{location}</td>

                                            <td className={cx('batchID')}>{detail.batchBoxByBatch.batch.batchID}</td>
                                            <td className={cx('productName')}>
                                                {detail.batchBoxByBatch.batch.product.productName}
                                            </td>
                                            <td className={cx('unit')}>{detail.batchBoxByBatch.batch.unit.unitName}</td>
                                            {inventoryCheckDetail?.status !== 'PENDING_CHECK' && (
                                                <td
                                                    className={cx([
                                                        'status',
                                                        Math.abs(detail.discrepancyQuantity) !== 0 && 'highlight',
                                                    ])}
                                                >
                                                    {formatStatusInventoryCheckDetail[detail.status]}
                                                </td>
                                            )}
                                            <td className={cx('num')}>{detail.systemQuantity}</td>
                                            {inventoryCheckDetail?.status !== 'PENDING_CHECK' && (
                                                <>
                                                    <td className={cx('num')}>{detail.actualQuantity}</td>
                                                    <td
                                                        className={cx([
                                                            'num',
                                                            Math.abs(detail.discrepancyQuantity) !== 0 && 'highlight',
                                                        ])}
                                                    >
                                                        {Math.abs(detail.discrepancyQuantity)}
                                                    </td>
                                                </>
                                            )}
                                            <td className={cx('note')}>{detail.reason || 'Không có ghi chú'}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {type === 'detail' && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '20px',
                        paddingBottom: '20px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <label style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            Mã QR phiếu kiểm kê
                        </label>
                        <QRCode value={inventoryCheckDetail?.inventoryCheckID || ''} size={180} />
                    </div>
                </div>
            )}
        </div>
    );
};

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

        console.log('inventoryCheckDetail', inventoryCheckDetail);
    }, []);

    const handleSaveInventoryCheck = async () => {
        if (!inventoryCheckId) {
            toast.error('Vui lòng nhập mã phiếu kiểm kê', styleMessage);
            return;
        }
        const warehouse = parseToken('warehouse');
        const token = parseToken('tokenUser');

        const data = {
            inventoryCheckID: inventoryCheckId,
            employeeID: currentUser.empId,
            warehouseID: warehouse.warehouseID,
            note: note,
            details: listBatchBox.map((item) => ({
                batchID: item.batchID,
                boxID: item.boxID,
                systemQuantity: item.systemQuantity,
                actualQuantity: null,
                discrepancyQuantity: null,
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
            <InventoryCheckContent
                type={type}
                inventoryCheckDetail={inventoryCheckDetail}
                currentUser={currentUser}
                inventoryCheckId={inventoryCheckId}
                setInventoryCheckId={setInventoryCheckId}
                note={note}
                setNote={setNote}
                listBatchBox={listBatchBox}
                setListBatchBox={setListBatchBox}
                handleUpdateStatus={handleUpdateStatus}
                handleSaveInventoryCheck={handleSaveInventoryCheck}
                onClose={onClose}
            />
        </Modal>
    );
};

export default CreateCheckDetail;
