import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateCheckDetail.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import PopupMessage from '../../../components/PopupMessage';
import { formatStatusProduct, styleMessage } from '../../../constants';
import { set } from 'react-hook-form';
import { generateCode } from '../../../utils/generate';
import { useSelector } from 'react-redux';
import parseToken from '../../../utils/parseToken';
import request from '../../../utils/httpRequest';
import { getProductById } from '../../../services/product.service';
import toast from 'react-hot-toast';
import Tippy from '@tippyjs/react';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Eye } from 'lucide-react';
import { getAllShelfOfWarehouse } from '../../../services/shelf.service';
import ShowLocationDetail from '../ShowLocationDetail';

const cxGlobal = classNames.bind(globalStyle);
const cx = classNames.bind(styles);

const CreateCheckDetail = ({ isOpen, onClose, inventoryCheckDetail, type = 'create', fetchData, shelvesData }) => {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [productSearch, setProductSearch] = useState('');
    const [inventoryCheckDetails, setInventoryCheckDetails] = useState([]);
    const [inventoryCheckId, setInventoryCheckId] = useState('');
    const [note, setNote] = useState('');
    const [showLocationPopup, setShowLocationPopup] = useState(null);

    useEffect(() => {
        console.log(inventoryCheckDetails);
    }, [inventoryCheckDetails]);

    const handleSearchProduct = async () => {
        // Logic to search for the product in the inventory check details
        if (type === 'detail') {
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const filteredProduct = inventoryCheckDetail?.details.filter((item) => {
                const productIdMatch = new RegExp(escapeRegex(productSearch), 'i').test(item.product?.productID ?? '');
                return productIdMatch;
            });
            setInventoryCheckDetails(filteredProduct);
        } else {
            const fetchProduct = async () => {
                const warehouse = parseToken('warehouse');
                const resProduct = await getProductById(productSearch, warehouse.warehouseID);

                setInventoryCheckDetails((prev) => [
                    ...prev,
                    {
                        actualQuantity: null,
                        discrepancyQuantity: null,
                        product: { ...resProduct.data.product },
                        productID: resProduct.data.product.productID,
                        systemQuantity: resProduct.data.product.amount,
                        reason: null,
                    },
                ]);
            };
            if (productSearch) {
                const checkProductExist = inventoryCheckDetails.find(
                    (it) => it.product.productID.toLowerCase() == productSearch.toLowerCase(),
                );

                if (checkProductExist) {
                    toast.error('Sản phẩm này đã tồn tại trong danh sách kiểm kê', styleMessage);
                    return;
                }
                await fetchProduct();
                setProductSearch('');
            }
        }
    };

    const handleActualQuantityChange = (e, productId, systemQuantity) => {
        const value = e.target.value;
        const difference = Number(value) - systemQuantity;
        setInventoryCheckDetails((prevDetails) =>
            prevDetails.map((item) =>
                item.product.productID === productId
                    ? { ...item, actualQuantity: value, discrepancyQuantity: difference }
                    : item,
            ),
        );
    };

    const handleSaveInventoryCheck = async () => {
        let status = 'MATCHED';
        if (!inventoryCheckId) {
            toast.error('Vui lòng nhập mã phiếu kiểm kê', styleMessage);
            return;
        }
        if (inventoryCheckDetails.length === 0) {
            toast.error('Vui lòng thêm sản phẩm vào phiếu kiểm kê', styleMessage);
            return;
        }
        for (const item of inventoryCheckDetails) {
            console.log();

            if (item.actualQuantity === null || item.actualQuantity === undefined) {
                toast.error('Vui lòng nhập số lượng thực tế cho sản phẩm ' + item.product.productName, styleMessage);
                return;
            }
            if (item.discrepancyQuantity < 0 && status === 'MATCHED') {
                status = 'SHORTAGE';
            } else if (item.discrepancyQuantity > 0 && status === 'MATCHED') {
                status = 'SURPLUS';
            }
        }
        const warehouse = parseToken('warehouse');
        const token = parseToken('tokenUser');

        const data = {
            inventoryCheckID: inventoryCheckId,
            employeeID: currentUser.empId,
            warehouseID: warehouse.warehouseID,
            note: note,
            status: status,
            details: inventoryCheckDetails.map((item) => ({
                productID: item.productID,
                systemQuantity: item.systemQuantity,
                actualQuantity: item.actualQuantity ? Number(item.actualQuantity) : 0,
                discrepancyQuantity: item.discrepancyQuantity ? Number(item.discrepancyQuantity) : 0,
                reason: item.reason,
            })),
        };
        try {
            const res = await request.post('/api/inventory-check/create-inventory-checks', data, {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            });
            toast.success('Tạo phiếu kiểm kê thành công', styleMessage);
            onClose();
            fetchData();
        } catch (err) {
            toast.error(
                Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
                styleMessage,
            );
            console.log(err);
        }
    };

    useEffect(() => {
        setInventoryCheckDetails(inventoryCheckDetail?.details || []);
    }, [inventoryCheckDetail]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-check')}>
                <div className={cx('info-check', 'container-check')}>
                    <div className={cx('header-check')}>
                        <h4>Thông tin phiếu kiểm kê</h4>
                        <div className={cx('headerActions')}>
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
                                value={type === 'create' ? note : inventoryCheckDetail?.note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập ghi chú"
                                disabled={type === 'detail'}
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('filter-check', 'container-check')}>
                    <h4>Tìm kiếm sản phẩm cần kiểm kê</h4>
                    <div className={cx('form-group')}>
                        <input
                            type="text"
                            id="productSearch"
                            value={productSearch}
                            placeholder="Nhập mã sản phẩm"
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                        <Button primary className={cx('btn-search')} onClick={handleSearchProduct}>
                            Tìm kiếm
                        </Button>
                    </div>
                </div>

                <div className={cx('table-check', 'container-check')}>
                    <div className={cx('title-table')}>
                        <h4>Danh sách hàng hóa kiểm kê</h4>
                    </div>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th className={cx('productID')}>Mã sản phẩm</th>
                                <th className={cx('productName')}>Tên sản phẩm</th>
                                <th className={cx('note')}>Trạng thái</th>
                                <th className={cx('num')}>Tồn hệ thống</th>
                                <th className={cx('num')}>Tồn thực tế</th>
                                <th className={cx('num')}>Chênh lệch</th>
                                {type === 'create' && <th className={cx('action')}>Xem chi tiết</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryCheckDetails?.map((item, index) => (
                                <tr key={index}>
                                    <td className={cx('productID')}>{item.productID}</td>
                                    <td className={cx('productName')}>{item.product.productName}</td>
                                    <td className={cx('note')}>{formatStatusProduct[item.product.status]}</td>
                                    <td className={cx('num')}>{item.systemQuantity}</td>
                                    <td className={cx('num')}>
                                        {type === 'detail' ? (
                                            item.actualQuantity
                                        ) : (
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.actualQuantity || 0}
                                                onChange={(e) =>
                                                    handleActualQuantityChange(e, item.productID, item.systemQuantity)
                                                }
                                            />
                                        )}
                                    </td>
                                    <td className={cx('num')}>{Math.abs(item.discrepancyQuantity)}</td>
                                    {type === 'create' && (
                                        <td className={cx('action')}>
                                            <Tippy content={'Xem danh sách vị trí'} placement="bottom-end">
                                                <button
                                                    className={cxGlobal('action-table-icon')}
                                                    onClick={() => {
                                                        setShowLocationPopup(item);
                                                    }}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            </Tippy>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showLocationPopup != null && (
                <ShowLocationDetail
                    item={showLocationPopup}
                    isOpen={true}
                    onClose={() => setShowLocationPopup(null)}
                    shelvesData={shelvesData}
                />
            )}
        </Modal>
    );
};

export default CreateCheckDetail;
