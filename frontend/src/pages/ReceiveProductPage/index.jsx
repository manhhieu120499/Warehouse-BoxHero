import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductPage.module.scss';
import { MyTable, Button, Modal } from '../../components';
import { ClipboardClock, Eye, PlusCircle, Trash, FileMinus } from 'lucide-react';
import HistoryReceiveAndReleasePage from '../HistoryReceiveAndReleasePage';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import Tippy from '@tippyjs/react';
import InputBase from '../../components/InputBase';
import { useDebounce } from '../../hooks';
import ReceiveProductMissingPage from '../ReceiveProductMissingPage';
import ImportProduct from './ImportProduct';
const cx = classNames.bind(styles);
const cxGlb = classNames.bind(globalStyle);

const ReceiveProductPage = () => {
    const [tabActive, setTabActive] = useState(1);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const deboundValueSearch = useDebounce(searchTerm, 200);
    const [receiptID, setReceiptID] = useState(null);
    const [listProductReceive, setListProductReceive] = useState([]);

    const handleActiveTab = (index) => setTabActive(index);
    const handleOnChangeValue = (e) => {
        setSearchTerm(e.target.value);
    };

    const columnTable = [
        {
            title: 'Mã phiếu nhập',
            dataIndex: 'receiveReceiptID',
            key: 'receiveReceiptID',
        },
        {
            title: 'Ngày nhập',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplierName',
            key: 'supplierName',
        },
        {
            title: 'Nhân viên lập phiếu',
            dataIndex: 'employeeID',
            key: 'employeeID',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: '30%',
        },
        {
            title: 'Xem danh sách nhập kho',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <div className={cxGlb('action-table')}>
                    <Tippy content={'Xem chi tiết'} placement="bottom-end">
                        <div className={cx('action-table-icon')} onClick={() => setReceiptID(record.receiveReceiptID)}>
                            <Eye size={22} />
                        </div>
                    </Tippy>
                </div>
            ),
            width: '15%',
        },
    ];

    const dataSource = [
        {
            receiveReceiptID: 1,
            createdAt: '2025/10/20',
            supplierName: 'Công ty TNHH VinaMilk',
            employeeID: 'EP2',
        },
    ];

    useEffect(() => {
        if (deboundValueSearch === '') {
            // call all
            //console.log("vào get all")
        } else {
            //find receipt
            //console.log("vào find")
            setListProductReceive([]);
        }
    }, [deboundValueSearch]);

    useEffect(() => {
        if (!receiptID) return;
        setOpen(true);
        //fetch dữ liệu
    }, [receiptID]);

    return (
        <div className={cx('wrapper-receive-product')}>
            <section className={cx('header-tab')}>
                <Button
                    active={tabActive == 1 ? true : false}
                    onClick={() => handleActiveTab(1)}
                    leftIcon={<PlusCircle size={20} />}
                >
                    <span>Nhập kho</span>
                </Button>
                <Button
                    active={tabActive == 2 ? true : false}
                    onClick={() => handleActiveTab(2)}
                    leftIcon={<ClipboardClock size={20} />}
                >
                    <span>Lịch sử nhập kho</span>
                </Button>
                <Button
                    active={tabActive == 3 ? true : false}
                    onClick={() => handleActiveTab(3)}
                    leftIcon={<FileMinus size={20} />}
                >
                    <span>Phiếu nhập thiếu</span>
                </Button>
            </section>

            {tabActive == 1 && <ImportProduct />}
            {tabActive == 2 && (
                <HistoryReceiveAndReleasePage
                    title={'Danh sách lịch sử nhập kho'}
                    columnTable={columnTable}
                    dataTable={dataSource}
                >
                    <>
                        <InputBase placeholder="Nhập mã phiếu" value={searchTerm} onChange={handleOnChangeValue} />
                        <Modal
                            isOpenInfo={open}
                            onClose={() => {
                                setOpen(false);
                                setReceiptID(null);
                            }}
                        >
                            <div>Danh sách mặt hàng đã nhập</div>
                            <div>{listProductReceive}</div>
                        </Modal>
                    </>
                </HistoryReceiveAndReleasePage>
            )}
            {tabActive == 3 && <ReceiveProductMissingPage />}
        </div>
    );
};

export default ReceiveProductPage;
