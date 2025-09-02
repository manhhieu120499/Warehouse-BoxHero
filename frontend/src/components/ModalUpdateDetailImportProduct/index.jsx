import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalUpdateDetailImportProduct.module.scss';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import Button from '../Button';
import MyTable from '../MyTable';

const cx = classNames.bind(styles);

const ModalUpdateDetailImportProduct = ({ indexItem, item = {
    batchID: '',
    productID: '',
    productName: '',
    unit: '',
    requestAmount: '',
    realAmount: '',
    errorAmount: '',
    location: '',
    reasonError: '',
    supplierID: '',
    manufactureDate: "",
    expiryDate: ""
}, isOpen, onClose, updateCellData, suggestLocation, hasProposal = false }) => {
    const [selectedRows, setSelectedRows] = useState(null)
    const handleApplyDetail = () => {
        if(!item.realAmount) {
            toast.error("Vui lòng nhập số lượng thực tế", styleMessage)
            return;
        }
        onClose(false)
    }

    const columns = [
        {
            title: 'Mã khu vực',
            dataIndex: "zoneID",
            key: 'zoneID'
        },
         {
            title: 'Mã kê',
            dataIndex: "shelfID",
            key: 'shelfID'
        },
         {
            title: 'Mã tầng',
            dataIndex: "floorID",
            key: 'floorID'
        },
         {
            title: 'Mã ô',
            dataIndex: "boxID",
            key: 'boxID'
        }
    ]

    const rowSelection = {
        type: 'checkbox',
        selectedRowKeys: selectedRows,
        onChange: (newSelectedRowKey) => {
            setSelectedRows(newSelectedRowKey)
        }
    }

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-detail-import-product-content')}>
                <p className={cx('title-header')}>Cập nhật chi tiết lô hàng</p>
                <div className={cx('row')}>
                    <div className={cx('form-group')}>
                    <label>Ngày sản xuất</label>
                    <input value={item.manufactureDate} type='date' placeholder='Nhập ngày sản xuất' onChange={(e) => {
                        if(new Date(e.target.value) >= Date.now()) {
                            toast.error('Ngày sản xuất phải trước ngày hôm nay', styleMessage)
                        }else {
                            updateCellData(
                            indexItem, {...item, manufactureDate: e.target.value})}
                        }
                    }/>
                </div>
                <div className={cx('form-group')}>
                    <label>Hạn sử dụng</label>
                    <input value={item.expiryDate} type='date' placeholder='Nhập hạn sử dụng' onChange={(e) => {
                        if(new Date(e.target.value) <= Date.now()) {
                            toast.error('Hạn sử dụng phải sau ngày hôm nay', styleMessage)
                        }else {
                            updateCellData(indexItem, {...item, expiryDate: e.target.value})
                        }
                    }}/>
                </div>
                </div>

                <div className={cx('row')}>
                    <div className={cx('form-group')}>
                    <label>Số lượng thực tế</label>
                        <input
                            type="number"
                            placeholder="Số lượng thực tế"
                            min={1}
                            value={item.realAmount}
                            onChange={(e) => {
                                const raw = e.target.value.trim()
                                const num = Number.parseInt(e.target.value, 10)
                               
                                if(raw === "") {
                                     item.realAmount = raw 
                                    updateCellData(indexItem, item)
                                }  
                                else {
                                    const errorAmount = Number.parseInt(item.requestAmount) - Number.parseInt(raw)
                                    if(errorAmount < 0) {
                                        toast.error('Số lượng thực tế vượt mức yêu cầu', styleMessage)
                                    }else {
                                        item.realAmount = isNaN(num) ? undefined : num 
                                        if(hasProposal)
                                            item.errorAmount = errorAmount
                                        updateCellData(indexItem, item)
                                    }
                                    
                                }
                            }}
                        />
                    </div>
             
                    {hasProposal && <div className={cx('form-group')}>
                        <label>Số lượng thiếu</label>
                        <input
                            type="number"
                            placeholder="Số lượng thiếu"
                            min={1}
                            value={item.errorAmount}
                            readOnly
                        />
                    </div>}
                </div>
                {hasProposal && <div className={cx('form-group')}>
                    <label>Lý do lỗi</label>
                    <input type="text" placeholder="Nhập lý do" value={item.reasonError || ""} onChange={(e) => {
                        item.reasonError = e.target.value
                        updateCellData(indexItem, item)}}/>
                </div>}
               <div className={cx('suggest-location-view')}>
                    <p>Danh sách gợi ý vị trí lưu trữ lô hàng</p>
                    <MyTable columns={columns} data={[]} rowSelection={rowSelection}/>
                </div>
                <div className={cx('action-modal')}>
                    <Button success onClick={handleApplyDetail}>
                        <span>Cập nhật</span>
                    </Button>
                    <Button primary onClick={handleApplyDetail}>
                        <span>Đóng</span>
                    </Button>
                </div>
                
            </div>
        </Modal>
    );
};

export default ModalUpdateDetailImportProduct;
