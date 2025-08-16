import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductEdit.module.scss';
import Modal from '../Modal';
import Button from '../Button';
import toast from "react-hot-toast"
import {ModalUpdate} from "@/components"

const cx = classNames.bind(styles);


const ProductEdit = ({ data, onClose }) => {
    const [productData, setProductData] = useState({
        productName: data.productName,
        productUnit: data.unit,
        productMinStock: data.minStock
    })

    const columns = [
    {
        id:1,
        label: 'Tên sản phẩm',
        value: productData.productName,
        setValue: (value) => setProductData(prev => ({...prev, productName: value}))
    },
    {
        id: 2,
        label: 'Đơn vị tính',
        value: productData.productUnit,
        setValue: (value) => setProductData(prev => ({...prev, productUnit: value}))
    },
    {
        id: 3, 
        label: 'Tồn kho tối thiểu',
        value: productData.productMinStock,
        setValue: (value) => setProductData(prev => ({...prev, productMinStock: value}))
    }
    ]

    const handleUpdateProduct = async () => {
        try{
            // call api
            console.log(productData)
        }catch(err) {
            toast.error(err)
        }
    }

    return (
        <Modal showButtonClose={false} isOpenInfo={true} onClose={onClose}>
            <ModalUpdate label={"Cập nhật sản phẩm"} columns={columns} onSubmit={handleUpdateProduct} onClose={onClose}/>
        </Modal>
        
    );
};

export default ProductEdit;
