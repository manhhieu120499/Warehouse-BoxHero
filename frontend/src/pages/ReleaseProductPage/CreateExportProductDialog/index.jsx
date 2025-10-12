import React, { useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateExportProductDialog.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import { Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { saveOrderRelease } from '../../../services/order.service';
import ExportInfoSheet from './ExportInfoSheet';
import ExportProduct from './ExportProduct';
import ProductExportList from './ProductExportList';
import parseToken from '../../../utils/parseToken';

const cx = classNames.bind(styles);

const CreateExportProductDialog = ({ isOpen, onClose, fetchData }) => {
    const token = parseToken('tokenUser');
    const warehouse = parseToken('warehouse');
    const batchOfProducts = useSelector((state) => state.BatchProductSlice.batchProductList);
    const batchBoxOfProducts = useSelector((state) => state.BatchProductSlice.batchBoxProductList);
    const currentUser = useSelector((state) => state.AuthSlice.user);
    console.log('currentUser', currentUser);
    const [formData, setFormData] = useState({
        receiptCode: '',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: currentUser.empName || '',
        warehouse: warehouse.warehouseName,
        customerID: '',
        customerName: '',
        note: '',
    });
    const [step, setStep] = useState(0);
    const contentSliceRef = useRef(null);
    const [productListSelected, setProductListSelected] = useState([]); // danh sách sản phẩm được chọn để export

    const dispatch = useDispatch();

    const handleNextView = (position = 1) => {
        if (!contentSliceRef.current) return;
        contentSliceRef.current.style.transform = `translateX(-${position * 100}%)`;
        setStep(position);
    };
    const handlePrevView = (position = 0) => {
        if (!contentSliceRef.current) return;
        contentSliceRef.current.style.transform = `translateX(-${position * 100}%)`;
        setStep(position);
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
                        return { boxID: box.boxID, quantityExported: box.quantityExported };
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
            employeeID: token.employeeID,
            warehouseID: warehouse.warehouseID,
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

    const handleCloseModal = () => {
        setStep(0);
        dispatch(clearAllBatchProductList());
        onClose();
    };

    const handleResetForm = () => {
        setFormData({
            receiptCode: '',
            customerID: '',
            note: '',
        });
        setProductListSelected([]);
        dispatch(clearAllBatchProductList());
        handleNextView(0);
    };

    return (
        <Modal
            isOpenInfo={isOpen}
            onClose={handleCloseModal}
            arrButton={[
                (index) =>
                    step === 0 && (
                        <Button
                            disabled={!formData.receiptCode || !formData.customerName}
                            primary
                            medium
                            onClick={() => handleNextView()}
                        >
                            <span>Tiếp tục</span>
                        </Button>
                    ),
                (index) =>
                    step === 1 && (
                        <div style={{ display: 'flex', gap: '5px', marginRight: '13px' }}>
                            <Button primary medium onClick={() => handlePrevView(0)}>
                                <span>Quay lại</span>
                            </Button>
                            <Button
                                disabled={!formData.receiptCode || !formData.customerName}
                                primary
                                medium
                                onClick={() => {
                                    if (!productListSelected.length) {
                                        toast.error('Vui lòng chọn sản phẩm cần xuất', styleMessage);
                                        return;
                                    }
                                    handleNextView(2);
                                }}
                            >
                                <span>Tiếp tục</span>
                            </Button>
                        </div>
                    ),
                (index) =>
                    step === 2 && (
                        <Button primary medium onClick={() => handlePrevView(1)}>
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
                        <Button outline medium rounded className={cx('btn-reset')} onClick={handleResetForm}>
                            Làm mới
                        </Button>
                        <Button success medium rounded className={cx('btn-submit')} onClick={handleSave}>
                            Lưu phiếu
                        </Button>
                    </div>
                </header>

                <main className={cx('content')}>
                    <div ref={contentSliceRef} className={cx('slice-content')}>
                        <ExportInfoSheet
                            formData={formData}
                            setFormData={setFormData}
                            className={cx('content-normal-info')}
                        />

                        <ProductExportList
                            setProductListResult={setProductListSelected}
                            productListSelected={productListSelected}
                        />

                        <ExportProduct
                            className={cx('table-product-release')}
                            productListResult={productListSelected}
                            setProductListResult={setProductListSelected}
                        />
                    </div>
                </main>
            </div>
        </Modal>
    );
};

export default CreateExportProductDialog;
