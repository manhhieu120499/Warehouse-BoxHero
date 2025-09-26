import { Button, Modal, MyTable } from '../../../components';
import classNames from 'classnames/bind';
import styles from './UpdateLocation.module.scss';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
const cx = classNames.bind(styles);

const UpdateLocation = ({ isOpen, onClose, shelvesData, batches }) => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        setLocations(batches.map((item) => ({ batchID: item.batchID, locations: [] })));
    }, [batches]);

    const handleCheckboxChange = (batchID) => {
        setSelectedBatch(batchID);
    };

    const handleClickBox = (box) => {
        if (selectedBatch) {
            const batchLocation = locations.find((item) => item.batchID == selectedBatch);

            if (!batchLocation?.locations?.find((loc) => loc.boxID === box.boxID)) {
                // Nếu chưa có thì thêm
                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch ? { ...item, locations: [...item.locations, box] } : item,
                    ),
                );
            } else {
                // Nếu có rồi thì xóa ra
                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch
                            ? { ...item, locations: item.locations.filter((loc) => loc.boxID !== box.boxID) }
                            : item,
                    ),
                );
            }
        }
    };

    useEffect(() => {
        console.log(locations);
    }, [locations]);

    const handleOnclose = () => {
        setSelectedBatch(null);
        onClose();
    };

    const checkBoxExists = (boxID) => {
        for (const item of locations) {
            const found = item.locations.find((loc) => loc.boxID === boxID);
            if (found) return true;
        }
        return false;
    };

    const checkEnoughCoverage = (box) => {
        const found = batches.find((item) => item.batchID === selectedBatch);
        if (found?.unit?.length * found?.unit?.width * found?.unit?.height < box.remainingAcreage) {
            return true;
        }

        return false;
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
                                        <th className={cx('unit')}>Thể tích</th>
                                        <th className={cx('num')}>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches?.map((batch, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="radio"
                                                    checked={selectedBatch === batch.batchID}
                                                    onChange={() => handleCheckboxChange(batch.batchID)}
                                                />
                                            </td>
                                            <td className={cx('stt')}>{batch.batchID}</td>
                                            <td className={cx('productName')}>{batch.product.productName}</td>
                                            <td className={cx('unit')}>{batch.unit.unitName}</td>
                                            <td className={cx('unit')}>
                                                {batch.unit.length * batch.unit.width * batch.unit.height}
                                            </td>
                                            <td className={cx('num')}>{batch.remainAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('location-update')}>
                        <h3>Danh sách vị trí</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('stt')}>Vị trí</th>
                                        <th className={cx('productID')}>Thể tích còn lại</th>
                                        <th className={cx('productName')}>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations
                                        .find((item) => item.batchID === selectedBatch)
                                        ?.locations?.map((location, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td className={cx('stt')}>{location.boxName}</td>
                                                    <td className={cx('productID')}>{location.remainingAcreage}</td>
                                                    <td className={cx('productName')}>
                                                        <input value={location.quantity} type="number" min="0" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('action')}>
                        <Button
                            primary
                            onClick={() => {
                                toast.success('Cập nhật vị trí thành công', styleMessage);
                            }}
                        >
                            Cập nhật vị trí
                        </Button>
                    </div>
                </div>
                <div className={cx('shelf-update')}>
                    {/* KHU CHÍNH */}
                    <div className={cx('main-panel')}>
                        {shelvesData.map((shelf) => {
                            return (
                                <div className={cx('shelf')} key={shelf.shelfID}>
                                    {shelf.floor?.map((column, index) => {
                                        return (
                                            <div className={cx('floor')} key={index}>
                                                {column.boxes.map((box, colIndex) => {
                                                    return (
                                                        <div onClick={() => handleClickBox(box)}>
                                                            <Tippy key={colIndex} content={`${box.boxName}`}>
                                                                <Button
                                                                    className={cx([
                                                                        'box',
                                                                        checkBoxExists(box.boxID) && 'active',
                                                                        checkEnoughCoverage(box) && 'ready',
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

export default UpdateLocation;
