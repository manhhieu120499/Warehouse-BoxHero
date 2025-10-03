import { Button, Modal, MyTable } from '../../../components';
import classNames from 'classnames/bind';
import styles from './BatchBoxDialog.module.scss';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import parseToken from '../../../utils/parseToken';
import { getAllShelfOfWarehouse } from '../../../services/shelf.service';
import { getBoxesByBatchID } from '../../../services/box.service';
import { useDispatch, useSelector } from 'react-redux';
import { addLocationInBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';

const cx = classNames.bind(styles);

const BatchBoxDialog = ({ isOpen, onClose, batch, requireQuantity, product }) => {
    const [boxSelectedListToExport, setBoxSelectedListToExport] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);
    const [boxesOfBatch, setBoxesOfBatch] = useState([]);
    const dispatch = useDispatch();
    const batchBoxListStore = useSelector((state) => state.BatchProductSlice.batchBoxProductList);

    const fetchShelvesData = async () => {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const headers = {
            token: `Bearer ${token.accessToken}`,
            employeeID: token.employeeID,
            warehouseID: warehouse.warehouseID,
        };
        const data = await getAllShelfOfWarehouse({
            warehouseID: warehouse.warehouseID,
            headers,
        });
        if (data.status === 'OK') {
            console.log(data.data);
            setLocalShelves(data.data);
        }
    };

    const handleFetchAllBoxForBatch = async (batchID) => {
        try {
            const res = await getBoxesByBatchID(batchID);
            const formatBatch = res.map((box) => ({
                key: box.boxID,
                boxID: box.boxID,
                boxName: box.boxName,
                boxFloor: box.floorID,
                amountAvailable: box.batch_boxes.quantity,
                amountGet: 0,
                status: box.status,
            }));
            setBoxesOfBatch(formatBatch);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        if (!batchBoxListStore[`${product.productID}-${batch.batchID}`] || !batch) return;
        setBoxSelectedListToExport(batchBoxListStore[`${product.productID}-${batch.batchID}`]);
    }, [batchBoxListStore]);

    useEffect(() => {
        fetchShelvesData();
        handleFetchAllBoxForBatch(batch.batchID);
    }, []);

    // const handleCheckboxChange = (batchID) => {
    //     setSelectedBatch(batchID);
    // };

    const handleClickBox = (box) => {
        // tìm trong danh sách box load ở db
        const boxExist = boxesOfBatch.find((item) => item.boxID === box.boxID);
        // tìm trong danh sách box đã chọn để xuất
        const boxHasToListExport = boxSelectedListToExport.find((item) => item.boxID === box.boxID);
        if (boxHasToListExport) {
            setBoxSelectedListToExport((prev) => prev.filter((item) => item.boxID !== box.boxID));
        } else {
            setBoxSelectedListToExport((prev) => [
                ...prev,
                { ...boxExist, amountGet: Math.min(requireQuantity, boxExist.amountAvailable) },
            ]);
        }
    };

    const handleOnclose = () => {
        onClose();
    };

    // box thuộc về lô hàng
    const checkBoxExists = (boxID) => {
        const locationFind = boxesOfBatch.find((item) => item.boxID === boxID);
        if (locationFind) return true;
        return false;
    };

    const checkReadyExport = (box) => {
        const found = boxSelectedListToExport.find((item) => item.boxID === box.boxID);
        if (!found) return false;
        return true;
    };

    const checkTotalQuantityExport = (box) => {
        const total = boxSelectedListToExport.reduce((sum, box) => sum + Number(box.amountGet), 0);
        if (total === requireQuantity) {
            const boxListExport = boxSelectedListToExport.map((box) => box.boxID);
            return boxListExport.includes(box.boxID);
        }
        return true;
    };

    const handleUpdateLocation = async () => {
        // for (const item of locations) {
        //     const batchFind = localBatches.find((b) => b.batchID === item.batchID);
        //     if (batchFind?.remainAmount > 0) {
        //         toast.error(
        //             `Lô ${item.batchID} còn ${batchFind?.remainAmount} sản phẩm chưa được phân bổ`,
        //             styleMessage,
        //         );
        //         return; // lúc này return sẽ thoát hẳn khỏi handleUpdateLocation
        //     }
        // }
        // const locationToUpdate = locations.map((item) => ({
        //     batchID: item.batchID,
        //     boxes: item.locations.map((loc) => ({ boxID: loc.boxID, quantity: loc.quantity })),
        // }));
        // const warehouseID = parseToken('warehouse').warehouseID;
        // const res = await updateLocationBatch(warehouseID, locationToUpdate);
        // if (res.data.status === 'OK') {
        //     console.log(1);
        //     toast.success('Cập nhật vị trí thành công', styleMessage);
        //     onClose();
        // }
    };

    const handleAddBoxLocation = () => {
        const checkQuantityBox = boxSelectedListToExport.some((box) => box.amountGet <= 0);
        if (checkQuantityBox) {
            toast.error('Số lượng xuất trong ô phải lớn hơn 0', styleMessage);
            return;
        }
        const totalBox = boxSelectedListToExport.reduce((total, box) => total + (box.amountGet || 0), 0);
        if (totalBox < requireQuantity || totalBox > requireQuantity) {
            toast.error(
                `Tổng số lượng lô lấy từ ô đã chọn (${totalBox}) không khớp với số lượng yêu cầu (${requireQuantity}). Vui lòng điều chỉnh lại.`,
                styleMessage,
            );
            return;
        }

        dispatch(
            addLocationInBatchProductList({
                key: product.productID,
                batchID: batch.batchID,
                newLocation: boxSelectedListToExport,
            }),
        );
        onClose();
    };

    const updateQuantityExportInBox = (boxID, value) => {
        const updateBoxList = boxSelectedListToExport.map((box) =>
            box.boxID == boxID
                ? {
                      ...box,
                      amountGet: value,
                  }
                : box,
        );
        setBoxSelectedListToExport(updateBoxList);
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnclose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    <div className={cx('batches-update')}>
                        <h3>Danh sách lô hàng</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th className={cx('stt')}>Mã lô</th>
                                        <th className={cx('productName')}>Tên sản phẩm</th>
                                        <th className={cx('unit')}>Đơn vị tính</th>
                                        <th className={cx('num')}>Số lượng xuất</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <input type="radio" checked={batch.batchID} />
                                        </td>
                                        <td className={cx('stt')}>{batch.batchID}</td>
                                        <td className={cx('productName')}>{product.productName}</td>
                                        <td className={cx('unit')}>{batch.uom}</td>
                                        <td className={cx('num')}>{batch.quantity}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('location-update')}>
                        <h3>Danh sách ô được chọn để xuất</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('stt')}>Mã ô</th>
                                        <th className={cx('boxID')}>Tên ô</th>
                                        <th className={cx('location')}>Vị trí</th>
                                        <th className={cx('quantity')}>Số lượng xuất</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boxSelectedListToExport?.map((box, index) => {
                                        return (
                                            <tr key={index}>
                                                <td className={cx('stt')}>{box.boxID}</td>
                                                <td className={cx('boxID')}>{box.boxName}</td>
                                                <td className={cx('location')}>{box.boxFloor}</td>
                                                <td className={cx('quantity')}>
                                                    <input
                                                        value={box.amountGet}
                                                        type="number"
                                                        min="0"
                                                        max={box.amountAvailable}
                                                        onChange={(e) =>
                                                            updateQuantityExportInBox(
                                                                box.boxID,
                                                                Math.min(
                                                                    Math.max(0, e.target.value),
                                                                    box.amountAvailable,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('action')}>
                        <Button primary onClick={handleAddBoxLocation}>
                            Xác nhận
                        </Button>
                    </div>
                </div>
                <div className={cx('shelf-update')}>
                    {/* KHU CHÍNH */}
                    <div className={cx('main-panel')}>
                        {localShelves.map((shelf) => {
                            return (
                                <div className={cx('shelf')} key={shelf.shelfID}>
                                    {shelf.floor?.map((column, index) => {
                                        return (
                                            <div className={cx('floor')} key={index}>
                                                {column.boxes.map((box, colIndex) => {
                                                    return (
                                                        <div>
                                                            <Tippy key={colIndex} content={`${box.boxName}`}>
                                                                <Button
                                                                    onClick={() => handleClickBox(box)}
                                                                    disabled={
                                                                        !batch ||
                                                                        !checkBoxExists(box.boxID) ||
                                                                        !checkTotalQuantityExport(box)
                                                                        //checkTotalQuantity(box)
                                                                    }
                                                                    className={cx([
                                                                        'box',
                                                                        checkBoxExists(box.boxID) && 'ready',
                                                                        checkReadyExport(box) && 'active',
                                                                    ])}
                                                                ></Button>
                                                            </Tippy>
                                                            <span>{box.boxID}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default BatchBoxDialog;
