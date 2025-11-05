import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateExportProductDialog.module.scss';
import { Modal, Button } from '../../../components';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { saveOrderRelease } from '../../../services/order.service';
import ExportInfoSheet from './ExportInfoSheet';
import ExportProduct from './ExportProduct';
import parseToken from '../../../utils/parseToken';

const cx = classNames.bind(styles);

const CreateExportProductDialog = ({ isOpen, onClose, fetchData, proposalRelease }) => {
    const token = parseToken('tokenUser');
    const warehouse = parseToken('warehouse');
    const batchOfProducts = useSelector((state) => state.BatchProductSlice.batchProductList);
    const batchBoxOfProducts = useSelector((state) => state.BatchProductSlice.batchBoxProductList);
    const currentUser = useSelector((state) => state.AuthSlice.user);

    const [formData, setFormData] = useState({
        receiptCode: '',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: currentUser.empName || '',
        warehouse: warehouse.warehouseName,
        customerID: '',
        customerName: '',
        note: '',
        orderReleaseProposalID: proposalRelease ? proposalRelease.orderReleaseProposalID : '',
        orderReleaseDetails: [],
        approver: proposalRelease?.approver?.employeeName,
    });
    const contentSliceRef = useRef(null);
    const [productListSelected, setProductListSelected] = useState([]); // danh sách sản phẩm được chọn để export

    const dispatch = useDispatch();

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
        const checkProductHasBatch = [];
        let isFlag = {
            productIDMissing: [],
            valid: false,
        };
        const orderReleaseDetails = Object.keys(batchOfProducts)
            .map((productID) => {
                if (batchOfProducts[productID].length !== 0) checkProductHasBatch.push(productID);
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

        for (let i = 0; i < productListSelected.length; i++) {
            if (checkProductHasBatch.includes(productListSelected[i].productID)) continue;
            else {
                isFlag = {
                    productIDMissing: [...isFlag.productIDMissing, productListSelected[i].productID],
                    valid: true,
                };
                break;
            }
        }
        if (isFlag.valid) {
            const messageError = isFlag.productIDMissing.map((it) => it).join(',');
            toast.error(`Vui lòng chọn lô hàng cho sản phẩm có mã ${messageError}`, styleMessage);
            return;
        }

        let reqData = {
            orderReleaseID: formData.receiptCode,
            customerID: formData.customerID,
            employeeID: token.employeeID,
            warehouseID: warehouse.warehouseID,
            note: formData.note,
            orderReleaseProposalID: formData.orderReleaseProposalID,
            orderReleaseDetails: orderReleaseDetails || [],
        };

        console.log('req', reqData);

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
            console.log('err', err);
            toast.error(err.message, styleMessage);
            return;
        } finally {
            fetchData();
        }
    };

    const handleCloseModal = () => {
        dispatch(clearAllBatchProductList());
        onClose();
    };

    const handleResetForm = () => {
        setFormData((prev) => ({
            ...prev,
            receiptCode: '',
            customerID: '',
            customerName: '',
            note: '',
        }));
        setProductListSelected([]);
        dispatch(clearAllBatchProductList());
    };

    // init form data
    useEffect(() => {
        if (!proposalRelease) return;
        setFormData({
            receiptCode: '',
            createdDate: new Date().toISOString().split('T')[0],
            createdBy: currentUser.empName || '',
            warehouse: warehouse.warehouseName,
            customerID: proposalRelease?.customer?.customerID || '',
            customerName: proposalRelease?.customer?.customerName || '',
            note: proposalRelease?.note || '',
            orderReleaseProposalID: proposalRelease.orderReleaseProposalID || '',
            orderReleaseDetails: [],
            approver: proposalRelease?.approver?.employeeName || '',
        });
        setProductListSelected(
            (proposalRelease?.orderReleaseProposalDetails || []).map((item) => ({
                productID: item.productID,
                productName: item.productName,
            })),
        );
    }, [proposalRelease]);

    return (
        <Modal isOpenInfo={isOpen} onClose={handleCloseModal} showButtonClose={false}>
            <div className={cx('dialog-content-release')}>
                <header className={cx('dialog-header')}>
                    <h2 className={cx('dialog-title')}>Phiếu xuất kho</h2>
                    <div className={cx('header-action')}>
                        {/* <Button outline medium rounded className={cx('btn-reset')} onClick={handleResetForm}>
                            Làm mới
                        </Button> */}
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
