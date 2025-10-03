import { Button, Modal, MyTable } from '../../../components';
import classNames from 'classnames/bind';
import styles from './ShowLocationDetail.module.scss';
import Tippy from '@tippyjs/react';
import { use, useEffect, useState } from 'react';
import { getBoxContainProduct } from '../../../services/batch.service';
import parseToken from '../../../utils/parseToken';
import BoxDetail from '../../BatchPage/BoxDetail';
const cx = classNames.bind(styles);

const ShowLocationDetail = ({ isOpen, onClose, shelvesData, item }) => {
    const [localShelves, setLocalShelves] = useState([]);
    const [boxContaining, setBoxContaining] = useState([]);
    const [selectedBox, setSelectedBox] = useState(null);

    useEffect(() => {
        setLocalShelves(shelvesData.map((s) => ({ ...s })));
    }, [shelvesData]);

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

    const handleOnclose = () => {
        onClose();
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnclose} showButtonClose={false}>
            <div className={cx('wrapper')}>
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
                                                    <div onClick={() => setSelectedBox(box.boxID)}>
                                                        <Tippy key={colIndex} content={`${box.boxName}`}>
                                                            <Button
                                                                className={cx([
                                                                    'box',
                                                                    checkBoxContain(box.boxID) && 'ready',
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

            <BoxDetail isOpen={!!selectedBox} onClose={() => setSelectedBox(null)} boxID={selectedBox} />
        </Modal>
    );
};

export default ShowLocationDetail;
