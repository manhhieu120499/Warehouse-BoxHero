import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ExportProduct.module.scss';
import { styleMessage } from '../../../../constants';
import { fetchProductById } from '../../../../services/product.service';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { removeBatchProductList } from '../../../../lib/redux/batchProduct/BatchProduct';
import InputBase from '../../../../components/InputBase';
import { Button } from '../../../../components';
import { Trash2 } from 'lucide-react';
import BatchDialog from '../../BatchDialog';
import ModalBatchProductDetail from '../../ModalBatchProductDetail';
const cx = classNames.bind(styles);

// danh sách sản phẩm được chọn để export
const ExportProduct = ({ productListResult, className, setProductListResult }) => {
    const [productList, setProductList] = useState(productListResult || []);
    const [isOpenBatchDialog, setIsOpenBatchDialog] = useState(false);
    const [productSelectedToChooseBatch, setProductSelectedToChooseBatch] = useState(null);
    const [isOpenModalBatchDetailBeChoose, setIsOpenModalBatchDetailBeChoose] = useState(false);
    const dispatch = useDispatch();

    const clearProduct = (productID) => {
        setProductList((prev) => prev.filter((item) => item.productID !== productID));
        setProductListResult((prev) => prev.filter((item) => item.productID !== productID));
        dispatch(removeBatchProductList({ key: productID }));
    };

    useEffect(() => {
        setProductList(productListResult || []);
    }, [productListResult]);

    return (
        <>
            <section className={cx('', className)}>
                <p className={cx('table-header')}>Danh sách sản phẩm xuất kho</p>
                <div className={cx('table-container')}>
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Chọn lô</th>
                                <th>Chi tiết lô hàng xuất</th>
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
                                                medium
                                                rounded
                                                onClick={() => {
                                                    setProductSelectedToChooseBatch(item);
                                                    setIsOpenBatchDialog(true);
                                                }}
                                            >
                                                <span>Chọn lô xuất</span>
                                            </Button>
                                        </td>
                                        <td>
                                            <Button
                                                primary
                                                medium
                                                rounded
                                                onClick={() => {
                                                    setProductSelectedToChooseBatch(item);
                                                    setIsOpenModalBatchDetailBeChoose(true);
                                                }}
                                            >
                                                <span>Xem chi tiết</span>
                                            </Button>
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
            {isOpenBatchDialog && (
                <BatchDialog
                    isOpen={isOpenBatchDialog}
                    onClose={() => setIsOpenBatchDialog(false)}
                    product={{
                        productID: productSelectedToChooseBatch?.productID,
                        productName: productSelectedToChooseBatch?.productName,
                    }}
                />
            )}
            {isOpenModalBatchDetailBeChoose && (
                <ModalBatchProductDetail
                    isOpen={isOpenModalBatchDetailBeChoose}
                    onClose={() => setIsOpenModalBatchDetailBeChoose(false)}
                    productID={productSelectedToChooseBatch?.productID || ''}
                />
            )}
        </>
    );
};

export default ExportProduct;
