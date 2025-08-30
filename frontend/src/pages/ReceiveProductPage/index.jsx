import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductPage.module.scss';
import { MyTable, Button } from '../../components';
import { generateCode } from '../../utils/generate';
import { useSelector } from 'react-redux';
import request from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusProposal } from '../../constants';
import { ClipboardClock, PlusCircle, Trash } from 'lucide-react';
import CreateImportReceiptPage from './CreateImportReceiptPage';

const cx = classNames.bind(styles);

const ReceiveProductPage = () => {
    const currentWarehouse = useSelector((state) => state.WareHouseSlice.warehouse);
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [tabActive, setTabActive] = useState(1)

    const handleActiveTab = (index) => setTabActive(index)

    return (
        <div className={cx('wrapper-receive-product')}>
            <section className={cx('header-tab-product')}>
                <Button active={tabActive == 1 ? true : false} onClick={() => handleActiveTab(1)} leftIcon={<PlusCircle size={20}/>}>
                    <span>Nhập kho</span>
                </Button>
                <Button active={tabActive == 2 ? true : false} onClick={() => handleActiveTab(2)} leftIcon={<ClipboardClock size={20}/>}>
                    <span>Lịch sử nhập kho</span>
                </Button>
            </section>
            {tabActive == 1 && <CreateImportReceiptPage currentUser={currentUser} currentWarehouse={currentWarehouse}/>}
            {tabActive == 2 && <div>new page</div>}
        </div>
    );
};

export default ReceiveProductPage;
