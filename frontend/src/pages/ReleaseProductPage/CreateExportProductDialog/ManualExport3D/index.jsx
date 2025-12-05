import { Button, Modal } from '../../../../components';
import classNames from 'classnames/bind';
import styles from './ManualExport3D.module.scss';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../../constants';
import Shelf3D from '../../../../components/Shelf3D';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane } from '@react-three/drei';
import { getAllShelfOfWarehouse } from '../../../../services/shelf.service';
import parseToken from '../../../../utils/parseToken';
import { getAllBatchWithProductID } from '../../../../services/batch.service';
import { Trash2 } from 'lucide-react';

const cx = classNames.bind(styles);

const ManualExport3D = ({ isOpen, onClose, products, onConfirm }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [inventory, setInventory] = useState([]); // Batches of selected product
    const [selectedExports, setSelectedExports] = useState([]); // Items selected for export

    useEffect(() => {
        const warehouse = parseToken('warehouse');
        fetchShelves(warehouse.warehouseID);
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchInventory(selectedProduct.productID, selectedProduct.unit.unitID);
        } else {
            setInventory([]);
        }
    }, [selectedProduct]);

    const fetchShelves = async (id) => {
        const token = parseToken('tokenUser');
        const headers = {
            token: `Bearer ${token.accessToken}`,
            employeeID: token.employeeID,
            warehouseID: id,
        };
        const res = await getAllShelfOfWarehouse({ warehouseID: id, headers });

        if (res.status === 'OK') {
            setShelves(res.data);
        }
    };

    const fetchInventory = async (productID, unitID) => {
        try {
            const res = await getAllBatchWithProductID(productID, unitID);

            if (res) {
                // Filter batches that have validAmount > 0
                const validBatches = res.filter((b) => b.validAmount > 0);
                console.log(validBatches);

                setInventory(validBatches);
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải thông tin lô hàng', styleMessage);
        }
    };

    const getShelfPosition = (index) => {
        const col = Math.floor(index / 10);
        const row = index % 10;
        const x = col * 5;
        const z = -(row * 8 - 37);
        return [x, 0, z];
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
    };

    const checkActive = (boxID) => {
        if (!selectedProduct) return false;
        return selectedExports.some((e) => e.boxID == boxID && e.productID === selectedProduct.productID);
    };

    const checkDisabled = (boxID) => {
        if (!selectedProduct) return true;

        const currentSelectedQty = selectedExports
            .filter((e) => e.productID === selectedProduct.productID)
            .reduce((acc, curr) => acc + curr.quantity, 0);
        const requiredQty = selectedProduct.amountRequiredExport;
        const isFull = currentSelectedQty >= requiredQty;

        const isSelected = checkActive(boxID);

        // Check if box is in inventory (contains the product)
        const hasProduct = inventory.some((batch) => {
            if (!batch.boxes) return false;
            if (Array.isArray(batch.boxes)) {
                return batch.boxes.some((bb) => bb.boxID == boxID);
            }
            return batch.boxes.boxID == boxID;
        });

        if (isFull) {
            return !isSelected;
        } else {
            return !hasProduct;
        }
    };

    const handleBoxClick = (box) => {
        if (!selectedProduct) return;
        if (checkDisabled(box.boxID)) return;

        const isSelected = checkActive(box.boxID);

        if (isSelected) {
            // Deselect: Remove from selectedExports
            setSelectedExports((prev) =>
                prev.filter((e) => !(e.boxID == box.boxID && e.productID === selectedProduct.productID)),
            );
        } else {
            // Select
            const batchesInBox = inventory.filter((batch) => {
                if (!batch.boxes) return false;
                if (Array.isArray(batch.boxes)) {
                    return batch.boxes.some((bb) => bb.boxID == box.boxID);
                }
                return batch.boxes.boxID == box.boxID;
            });

            if (batchesInBox.length === 0) return;

            const batch = batchesInBox[0]; // Pick first for now

            // Get quantity in box
            let quantityInBox = 0;
            const bb = batch.boxes.find((b) => b.boxID == box.boxID).batch_boxes;

            quantityInBox = bb ? bb.validQuantity : 0;

            console.log('selectedExports', selectedExports);

            const currentSelectedQty = selectedExports
                .filter((e) => e.productID === selectedProduct.productID)
                .reduce((acc, curr) => acc + curr.quantity, 0);
            const requiredQty = selectedProduct.amountRequiredExport;
            const remainingNeeded = requiredQty - currentSelectedQty;

            const quantityToAdd = Math.min(quantityInBox, remainingNeeded);

            if (quantityToAdd <= 0) {
                toast.error('Đã đủ số lượng hoặc ô không có hàng khả dụng', styleMessage);
                return;
            }

            setSelectedExports((prev) => [
                ...prev,
                {
                    productID: selectedProduct.productID,
                    batchID: batch.batchID,
                    boxID: box.boxID,
                    boxName: box.boxName || box.boxID,
                    quantity: quantityToAdd,
                    unit: selectedProduct.unit.unitName,
                    available: quantityInBox,
                },
            ]);
        }
    };

    const handleRemoveItem = (batchID, boxID) => {
        setSelectedExports((prev) =>
            prev.filter(
                (e) => !(e.batchID === batchID && e.boxID == boxID && e.productID === selectedProduct.productID),
            ),
        );
    };

    const handleQuantityChange = (batchID, boxID, value) => {
        const newQuantity = parseInt(value);
        if (isNaN(newQuantity)) return;

        // Find the item
        const item = selectedExports.find(
            (e) => e.batchID === batchID && e.boxID == boxID && e.productID === selectedProduct.productID,
        );
        if (!item) return;

        // Validation 1: Positive integer
        if (newQuantity <= 0) {
            toast.error('Số lượng phải là số nguyên dương', styleMessage);
            return;
        }

        // Validation 2: <= Available in box
        if (newQuantity > item.available) {
            toast.error(`Số lượng không được vượt quá tồn kho trong ô (${item.available})`, styleMessage);
            return;
        }

        // Validation 3: Total <= Required
        const currentTotal = selectedExports
            .filter((e) => e.productID === selectedProduct.productID)
            .reduce((acc, curr) => acc + curr.quantity, 0);
        const otherTotal = currentTotal - item.quantity;

        if (otherTotal + newQuantity > selectedProduct.amountRequiredExport) {
            toast.error(
                `Tổng số lượng xuất không được vượt quá yêu cầu (${selectedProduct.amountRequiredExport})`,
                styleMessage,
            );
            return;
        }

        // Update
        setSelectedExports((prev) =>
            prev.map((e) => {
                if (e.batchID === batchID && e.boxID == boxID && e.productID === selectedProduct.productID) {
                    return { ...e, quantity: newQuantity };
                }
                return e;
            }),
        );
    };

    const handleConfirm = () => {
        onConfirm(selectedExports);
        onClose();
    };

    useEffect(() => {
        console.log(selectedExports);
    }, [selectedExports]);

    return (
        <Modal
            isOpenInfo={isOpen}
            onClose={() => {
                onClose();
                setSelectedProduct(null);
                setSelectedExports([]);
            }}
            showButtonClose={false}
        >
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    {/* Left: Product List */}
                    <div className={cx('batches-update')}>
                        <h3>Danh sách sản phẩm cần xuất</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Mã SP</th>
                                        <th>Tên SP</th>
                                        <th>ĐVT</th>
                                        <th>Yêu cầu</th>
                                        <th>Đã chọn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => {
                                        const selectedQty = selectedExports
                                            .filter((e) => e.productID === product.productID)
                                            .reduce((acc, curr) => acc + curr.quantity, 0);

                                        return (
                                            <tr
                                                key={index}
                                                style={{
                                                    cursor: 'pointer',
                                                    background:
                                                        selectedProduct?.productID === product.productID
                                                            ? '#e6f7ff'
                                                            : 'transparent',
                                                }}
                                                onClick={() => handleProductSelect(product)}
                                            >
                                                <td>
                                                    <input
                                                        type="radio"
                                                        checked={selectedProduct?.productID === product.productID}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>{product.productID}</td>
                                                <td className={cx('productName')}>{product.productName}</td>
                                                <td>{product.unit.unitName}</td>
                                                <td className={cx('num')}>{product.amountRequiredExport}</td>
                                                <td className={cx('num')}>{selectedQty}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Center: Selected Batches for current product */}
                    <div className={cx('location-update')}>
                        <h3>Danh sách lô đã chọn ({selectedProduct?.productName})</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th>Mã lô</th>
                                        <th>Vị trí</th>
                                        <th>Có sẵn</th>
                                        <th>Xuất</th>
                                        <th style={{ width: '40px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedExports
                                        .filter((item) => item.productID === selectedProduct?.productID)
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.batchID}</td>
                                                <td>{item.boxName || item.boxID}</td>
                                                <td className={cx('num')}>{item.available}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        min="0"
                                                        max={item.available}
                                                        onChange={(e) =>
                                                            handleQuantityChange(
                                                                item.batchID,
                                                                item.boxID,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        className={cx('iconBtn')}
                                                        onClick={() => handleRemoveItem(item.batchID, item.boxID)}
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={cx('action')}>
                        <Button primary onClick={handleConfirm}>
                            Xác nhận xuất
                        </Button>
                    </div>
                </div>

                {/* Right: 3D View */}
                <div className={cx('shelf-update')}>
                    <div className={cx('main-panel')}>
                        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f0f0f0' }}>
                            <Canvas camera={{ position: [0, 60, 120], fov: 50 }}>
                                <OrbitControls enableRotate={false} enableZoom enablePan />
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[10, 30, 10]} intensity={1} castShadow />
                                <OrbitControls enablePan enableZoom enableRotate />
                                <Plane args={[60, 90]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                                    <meshStandardMaterial color="#ffffff" />
                                </Plane>

                                {shelves.map((shelf, idx) => (
                                    <Shelf3D
                                        key={shelf.shelfID}
                                        shelf={shelf}
                                        position={getShelfPosition(idx)}
                                        shelfType="exportProduct"
                                        onBoxSelect={handleBoxClick}
                                        checkDisabled={checkDisabled}
                                        checkActive={checkActive}
                                        shelfConfig={{ boxSpacing: 1.6, floorHeight: 4 }}
                                    />
                                ))}
                            </Canvas>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ManualExport3D;
