import React, { useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateExportProductDialog.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import { Plus, Trash2, Save } from 'lucide-react';
import Tippy from '@tippyjs/react';
import BatchDialog from '../BatchDialog';
import { generateCode } from '../../../utils/generate';
import ModalBatchProductDetail from '../ModalBatchProductDetail';
import InputBase from '../../../components/InputBase';
import { fetchProductById } from '../../../services/product.service';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllBatchProductList, removeBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { searchCustomer } from '../../../services/customer.service';
import { saveOrderRelease } from '../../../services/order.service';

const cx = classNames.bind(styles);

const CreateExportProductDialog = ({
    isOpen,
    onClose,
    fetchData,
    productSelectedList = [
        // {
        //     productID: 'SP1',
        //     productName: 'Sữa vinamilk hảo hạn',
        //     requiredQuantity: 10,
        //     batches: [
        //         {
        //             batchID: '',
        //             quantity: 0,
        //         },
        //     ],
        // },
        // {
        //     productID: 'SP2',
        //     productName: 'Sữa vinamilk',
        //     requiredQuantity: 1,
        //     batches: [
        //         {
        //             batchID: '',
        //             quantity: 0,
        //         },
        //     ],
        // },
    ],
}) => {
    const batchOfProducts = useSelector((state) => state.BatchProductSlice.batchProductList);
    const batchBoxOfProducts = useSelector((state) => state.BatchProductSlice.batchBoxProductList);
    console.log('batchOfProducts', batchOfProducts);
    const [formData, setFormData] = useState({
        receiptCode: '',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Đạt',
        warehouse: 'Thứ Đức',
        proposalCode: 'PDX-912fc',
        customerID: '',
        customerName: '',
        note: '',
    });
    const [step, setStep] = useState(0);
    const contentSliceRef = useRef(null);
    const [searchProduct, setSearchProduct] = useState(null);
    const [productSelected, setProductSelected] = useState(null);
    const [isOpenBatchDialog, setIsOpenBatchDialog] = useState(false);
    const [isOpenModalBatchDetail, setIsOpenModalBatchDetail] = useState(false);

    const [productList, setProductList] = useState(productSelectedList);

    const dispatch = useDispatch();

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddBatch = (productID, batchesList) => {
        setProductList((prev) =>
            prev.map((item) =>
                item.productID === productID
                    ? {
                          ...item,
                          batches: [...item.batches, ...batchesList],
                      }
                    : item,
            ),
        );
    };

    const handleNextView = () => {
        contentSliceRef.current.style.transform = 'translateX(-100%)';
        setStep(1);
    };
    const handlePrevView = () => {
        contentSliceRef.current.style.transform = 'translateX(0)';
        setStep(0);
    };

    const validate = (payload) => {
        if (!payload.orderReleaseID) {
            toast.error('Vui lòng tạo mã phiếu xuất kho', styleMessage);
            return false;
        }
        if (!payload.customerID) {
            toast.error('Vui lòng nhập mã khách hàng', styleMessage);
            return false;
        }
        if (Object.keys(batchOfProducts).length === 0) {
            toast.error('Vui lòng chọn lô hàng cho sản phẩm', styleMessage);
            return false;
        }

        const boxQuantityInvalid = payload.orderReleaseDetails.some((detail) => {
            const batchBoxes = detail.batchBoxes || [];
            if (batchBoxes.length === 0) return true;
            const valid = batchBoxes.every((box) => box.quantityExported > 0);
            return !valid;
        });

        if (boxQuantityInvalid) {
            toast.error('Số lượng xuất trong ô phải lớn hơn 0', styleMessage);
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        const orderReleaseDetails = Object.keys(batchOfProducts)
            .map((productID) => {
                // lấy danh sách các batches
                const batchList = (batchOfProducts[productID] || []).map((batch) => ({
                    batchID: batch.batchID,
                    quantityExported: batch.quantity,
                    productID: productID,
                    unitID: batch.unitID,
                }));

                // format response orderReleaseDetails
                const resp = batchList.map((batch) => {
                    // lấy danh sách các box của từng batch
                    const boxes = (batchBoxOfProducts[`${productID}-${batch.batchID}`] || []).map((box) => {
                        return { boxID: box.boxID, quantityExported: box.amountGet };
                    });
                    return {
                        ...batch,
                        batchBoxes: [...boxes],
                    };
                });

                return resp;
            })
            .flatMap((item) => item); // flatten mảng 2 chiều về 1 chiều

        let reqData = {
            orderReleaseID: formData.receiptCode,
            customerID: formData.customerID,
            employeeID: formData.createdBy,
            warehouseID: 'WH1',
            note: formData.note,
            orderReleaseDetails: orderReleaseDetails || [],
        };

        console.log('reqData', reqData);

        if (!validate(reqData)) return;

        try {
            const resp = await saveOrderRelease(reqData);
            if (resp.status === 200) {
                toast.success('Lưu phiếu xuất kho thành công', styleMessage);
                dispatch(clearAllBatchProductList());
                // Implement save logic here
                onClose();
            }
        } catch (err) {
            toast.error(err.message, styleMessage);
            return;
        } finally {
            fetchData();
        }
    };

    const clearProduct = (productID) => {
        setProductList((prev) => prev.filter((item) => item.productID !== productID));
        dispatch(removeBatchProductList({ key: productID }));
    };

    const handleSearchProduct = async () => {
        try {
            const checkExist = productList.find((item) => item.productID === searchProduct.toUpperCase());
            if (checkExist) {
                toast.error('Sản phẩm đã được chọn', styleMessage);
                return;
            }
            const res = await fetchProductById(searchProduct);
            if (!res) {
                toast.error('Không tìm thấy sản phẩm', styleMessage);
                return;
            }
            const formatProducts = {
                productID: res.productID,
                productName: res.productName,
                requiredQuantity: res.requiredQuantity,
                batches: res.batches,
            };
            setProductList((prev) => [...prev, formatProducts]);
        } catch (err) {
            console.error('Error searching products:', err);
        } finally {
            setSearchProduct(null);
        }
    };

    const handleCloseModal = () => {
        dispatch(clearAllBatchProductList());
        onClose();
    };

    const handleSearchCustomer = async () => {
        if (!formData.customerID) return;
        try {
            const res = await searchCustomer(formData.customerID);
            if (!res) {
                toast.error('Không tìm thấy khách hàng', styleMessage);
                return;
            }
            setFormData((prev) => ({
                ...prev,
                customerName: res.customerName,
            }));
        } catch (err) {
            toast.error(err.message, styleMessage);
            return;
        }
    };

    return (
        <>
            <Modal
                isOpenInfo={isOpen}
                onClose={handleCloseModal}
                arrButton={[
                    (index) =>
                        index == step && (
                            <Button
                                disabled={!formData.receiptCode || !formData.customerName}
                                primary
                                medium
                                onClick={handleNextView}
                            >
                                <span>Tiếp tục</span>
                            </Button>
                        ),
                    (index) =>
                        index == step && (
                            <Button primary medium onClick={handlePrevView}>
                                <span>Quay lại</span>
                            </Button>
                        ),
                    (index) => (
                        <Button primary medium onClick={onClose}>
                            <span>Đóng</span>
                        </Button>
                    ),
                ]}
                showButtonClose={false}
            >
                <div className={cx('dialog-content-release')}>
                    <header className={cx('dialog-header')}>
                        <h2 className={cx('dialog-title')}>Phiếu xuất kho</h2>
                        <div className={cx('header-action')}>
                            <Button outline medium rounded className={cx('btn-reset')} onClick={onClose}>
                                Làm mới
                            </Button>
                            <Button success medium rounded className={cx('btn-submit')} onClick={handleSave}>
                                Lưu phiếu
                            </Button>
                        </div>
                    </header>

                    <main className={cx('content')}>
                        <div ref={contentSliceRef} className={cx('slice-content')}>
                            <section className={cx('content-normal-info')}>
                                <p className={cx('content-header')}>Thông tin chung</p>
                                <div className={cx('row')}>
                                    <div className={cx('form-group')}>
                                        <label>Mã phiếu</label>
                                        <div className={cx('input-generate-code')}>
                                            <input
                                                type="text"
                                                placeholder="Tạo mã phiếu"
                                                value={formData.receiptCode || ''}
                                            />
                                            <Button
                                                primary
                                                medium
                                                rounded
                                                onClick={() => {
                                                    //if (formData.receiptCode) return;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        receiptCode: `${generateCode('PX-')}`,
                                                    }));
                                                }}
                                            >
                                                Tạo mã phiếu
                                            </Button>
                                        </div>
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Ngày lập</label>
                                        <input
                                            type="date"
                                            placeholder="Tạo mã phiếu"
                                            readOnly
                                            value={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Kho</label>
                                        <input
                                            type="text"
                                            placeholder="Tạo mã phiếu"
                                            readOnly
                                            value={formData.warehouse || ''}
                                        />
                                    </div>
                                </div>
                                <div className={cx('row')}>
                                    <div className={cx('form-group')}>
                                        <label>Tên người lập phiếu</label>
                                        <input
                                            type="text"
                                            placeholder="Tên người lập phiếu"
                                            value={formData.createdBy}
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Mã khách hàng</label>
                                        <input
                                            type="text"
                                            placeholder="Nhập mã khách hàng"
                                            value={formData.customerID}
                                            onChange={(e) => handleInputChange('customerID', e.target.value)}
                                            onBlur={handleSearchCustomer}
                                        />
                                    </div>

                                    <div className={cx('form-group')}>
                                        <label>Tên khách hàng</label>
                                        <input
                                            type="text"
                                            placeholder="Tên khách hàng"
                                            value={formData.customerName || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className={cx('row')}>
                                    <div className={cx('form-group', 'full-width')}>
                                        <label>Ghi chú</label>
                                        <textarea
                                            placeholder="Nhập ghi chú"
                                            value={formData.note}
                                            onChange={(e) => handleInputChange('note', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className={cx('table-product-release')}>
                                <p className={cx('table-header')}>Danh sách sản phẩm xuất kho</p>
                                <div className={cx('table-search-product')}>
                                    <InputBase
                                        placeholder="Tìm kiếm sản phẩm..."
                                        onChange={(e) => setSearchProduct(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchProduct()}
                                        value={searchProduct || ''}
                                    />
                                </div>
                                <div className={cx('table-container')}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Mã sản phẩm</th>
                                                <th>Tên sản phẩm</th>
                                                <th>Chọn lô</th>
                                                <th>Chi tiết lô hàng xuất</th>
                                                <th>Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productList?.length > 0 ? (
                                                productList.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.productID}</td>
                                                        <td>{item.productName}</td>
                                                        <td>
                                                            <Button
                                                                success
                                                                small
                                                                rounded
                                                                onClick={() => {
                                                                    setProductSelected(item);
                                                                    setIsOpenBatchDialog(true);
                                                                }}
                                                            >
                                                                <span>Chọn lô xuất</span>
                                                            </Button>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                primary
                                                                small
                                                                rounded
                                                                onClick={() => {
                                                                    setProductSelected(item);
                                                                    setIsOpenModalBatchDetail(true);
                                                                }}
                                                            >
                                                                <span>Xem chi tiết</span>
                                                            </Button>
                                                        </td>
                                                        <td>
                                                            <Trash2
                                                                style={{ cursor: 'pointer' }}
                                                                size={16}
                                                                color="red"
                                                                onClick={() => {
                                                                    clearProduct(item.productID);
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: 'center' }}>
                                                        Không có sản phẩm nào
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </Modal>
            {isOpenBatchDialog && (
                <BatchDialog
                    isOpen={isOpenBatchDialog}
                    onClose={() => setIsOpenBatchDialog(false)}
                    product={{ productID: productSelected?.productID, productName: productSelected?.productName }}
                />
            )}
            {isOpenModalBatchDetail && (
                <ModalBatchProductDetail
                    isOpen={isOpenModalBatchDetail}
                    onClose={() => setIsOpenModalBatchDetail(false)}
                    productID={productSelected?.productID || ''}
                />
            )}
        </>
    );
};

export default CreateExportProductDialog;
