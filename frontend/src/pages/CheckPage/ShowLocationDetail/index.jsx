import { Button, Modal } from '../../../components';
import classNames from 'classnames/bind';
import styles from './ShowLocationDetail.module.scss';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import { getBoxContainProduct } from '../../../services/batch.service';
import parseToken from '../../../utils/parseToken';
import { getBoxDetails } from '../../../services/box.service';
import CreateCheckDetail from '../CreateCheckDetail';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { getAllShelfOfWarehouse } from '../../../services/shelf.service';
const cx = classNames.bind(styles);

const ShowLocationDetail = ({ isOpen, onClose, item, fetchData }) => {
    const [selectedBox, setSelectedBox] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);
    const [boxContaining, setBoxContaining] = useState([]);
    const [listBatchBoxCheck, setListBatchBoxCheck] = useState([]);
    const [listShelfCheck, setListShelfCheck] = useState([]);
    const [showCreateInventoryCheck, setShowCreateInventoryCheck] = useState(false);

    const fetchShelfData = async () => {
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
            setLocalShelves(data.data);
        }
    };

    useEffect(() => {
        fetchShelfData();
    }, []);

    useEffect(() => {
        const fetchBoxContaining = async () => {
            if (item != null) {
                const warehouse = parseToken('warehouse');
                const boxContaining = await getBoxContainProduct(warehouse.warehouseID, item.productID);
                if (boxContaining.data.status === 'OK') {
                    setBoxContaining(boxContaining.data.data);
                }
            }
        };
        fetchBoxContaining();
    }, [item]);

    const checkBoxContain = (boxID) => {
        return boxContaining.some((box) => box.boxID === boxID);
    };

    const checkBoxAvailable = (box) => {
        const validQuantity = box.batchBoxes.every((item) => item.quantity === 0);

        return box.status === 'AVAILABLE' || validQuantity;
    };

    const handleOnclose = () => {
        onClose();
    };

    useEffect(() => {
        console.log(listBatchBoxCheck);
    }, [listBatchBoxCheck]);

    const handleClickBox = async (boxID) => {
        const boxExists = selectedBox.find((box) => box.boxID === boxID);
        if (boxExists) {
            setSelectedBox(selectedBox.filter((box) => box.boxID !== boxID));
            setListBatchBoxCheck(listBatchBoxCheck.filter((box) => box.boxID !== boxID));
        } else {
            const warehouse = parseToken('warehouse');
            const warehouseID = warehouse.warehouseID;
            const res = await getBoxDetails(warehouseID, boxID);

            if (res.data.status === 'OK') {
                const location = `${res.data.data.floor.shelf.shelfName} - ${res.data.data.floor.floorName} - ${res.data.data.boxName}`;
                const batches = res.data.data.batches.filter((batch) => batch.batch_boxes.quantity > 0);
                setSelectedBox([...selectedBox, { boxID }]);
                setListBatchBoxCheck([...listBatchBoxCheck, { boxID, location, batches }]);
            }
        }
    };

    const handleOnclickShelf = (shelf) => () => {
        if (listShelfCheck.includes(shelf.shelfID)) {
            setListShelfCheck(listShelfCheck.filter((id) => id !== shelf.shelfID));
            // filter status different AVAILABLE and add to selectedBox
            const boxesInShelf = shelf.floor.flatMap((floor) =>
                floor.boxes.filter((box) => !checkBoxAvailable(box)).map((box) => box.boxID),
            );
            setSelectedBox(selectedBox.filter((box) => !boxesInShelf.includes(box.boxID)));
            setListBatchBoxCheck(listBatchBoxCheck.filter((box) => !boxesInShelf.includes(box.boxID)));
        } else {
            setListShelfCheck([...listShelfCheck, shelf.shelfID]);
            const boxesInShelf = shelf.floor.flatMap((floor) =>
                floor.boxes.filter((box) => !checkBoxAvailable(box)).map((box) => box.boxID),
            );

            boxesInShelf.forEach(async (boxID) => {
                if (!selectedBox.find((box) => box.boxID === boxID)) {
                    const warehouse = parseToken('warehouse');
                    const warehouseID = warehouse.warehouseID;
                    const res = await getBoxDetails(warehouseID, boxID);
                    if (res.data.status === 'OK' && res.data.data.batches.length > 0) {
                        const location = `${res.data.data.floor.shelf.shelfName} - ${res.data.data.floor.floorName} - ${res.data.data.boxName}`;
                        const batches = res.data.data.batches.filter((batch) => batch.batch_boxes.quantity > 0);

                        setSelectedBox((prev) => [...prev, { boxID }]);
                        setListBatchBoxCheck((prev) => [...prev, { boxID, location, batches }]);
                    }
                }
            });
        }
    };

    const checkBoxExists = (boxID) => {
        const boxFind = selectedBox.find((item) => item.boxID === boxID);
        if (boxFind) return true;

        return false;
    };

    const checkShelfAvailable = (shelf) => {
        return shelf.floor?.some((floor) => floor.boxes?.some((box) => box.status !== 'AVAILABLE'));
    };

    const handleCreateInventoryCheck = () => {
        if (listBatchBoxCheck.length === 0) {
            toast.error('Vui lòng chọn vị trí để kiểm kê', styleMessage);
        } else {
            setShowCreateInventoryCheck(true);
        }
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnclose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    <div className={cx('batches-update')}>
                        <h3>Danh sách lô hàng cần kiểm kê</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('location')}>Vị trí</th>
                                        <th className={cx('batchID')}>Mã lô</th>
                                        <th className={cx('productName')}>Tên sản phẩm</th>
                                        <th className={cx('unit')}>Đơn vị tính</th>
                                        <th className={cx('num')}>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listBatchBoxCheck?.map((batchBoxCheck) =>
                                        batchBoxCheck?.batches.map((batch, idx) => (
                                            <tr key={idx}>
                                                <td className={cx('location')}>{batchBoxCheck.location}</td>
                                                <td className={cx('batchID')}>{batch.batchID}</td>
                                                <td className={cx('productName')}>{batch.product.productName}</td>
                                                <td className={cx('unit')}>{batch.unit.unitName}</td>
                                                <td className={cx('num')}>{batch.batch_boxes.quantity}</td>
                                            </tr>
                                        )),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('action')}>
                        <Button primary onClick={handleOnclose}>
                            Hủy
                        </Button>
                        <Button success onClick={handleCreateInventoryCheck}>
                            Tạo đơn kiểm kê
                        </Button>
                    </div>
                </div>
                {/* KHU CHÍNH */}
                <div className={cx('main-panel')}>
                    {localShelves.map((shelf) => {
                        return (
                            <div
                                className={cx(['shelf', !checkShelfAvailable(shelf) && 'un-active'])}
                                key={shelf.shelfID}
                                onClick={checkShelfAvailable(shelf) ? handleOnclickShelf(shelf) : undefined}
                            >
                                {shelf.floor?.map((column, index) => {
                                    return (
                                        <div className={cx('floor')} key={index}>
                                            {column.boxes.map((box, colIndex) => {
                                                return (
                                                    <div className={cx('box-wrapper')} key={colIndex}>
                                                        <Tippy key={colIndex} content={`${box.boxName}`}>
                                                            <Button
                                                                disabled={checkBoxAvailable(box)}
                                                                className={cx([
                                                                    'box',
                                                                    checkBoxContain(box.boxID) && 'ready',
                                                                    checkBoxExists(box.boxID) && 'active',
                                                                ])}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClickBox(box.boxID);
                                                                }}
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
            {showCreateInventoryCheck && (
                <CreateCheckDetail
                    fetchData={fetchData}
                    isOpen={showCreateInventoryCheck}
                    onClose={() => setShowCreateInventoryCheck(false)}
                    listBatchBoxCheck={listBatchBoxCheck}
                    handleOnclose={handleOnclose}
                />
            )}
        </Modal>
    );
};

export default ShowLocationDetail;
