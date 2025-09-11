import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ImportProduct.module.scss';
import { formatStatusProposal } from '../../../constants';
import { MyTable, PaginationUI } from '../../../components';
import InputBase from '../../../components/InputBase';
import { fetchProposal } from '../../../services/proposal.service';
import parseToken from '../../../utils/parseToken';
import CreateImportReceiptDialog from '../CreateImportReceiptDialog';
import CreateImportReceiptMissingDialog from '../CreateImportReceiptMissingDialog';
import { fetchOrderMissing } from '../../../services/order.service';

const cx = classNames.bind(styles);

const ImportProduct = () => {
    const [option, setOption] = useState({
        missingProposal: false,
        suggestProposal: true,
    });

    const [suggestListProposal, setSuggestListProposal] = useState([]);
    const [missingListProposal, setMissingListProposal] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState([]);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [proposalSelected, setProposalSelected] = useState(null);
    const [showModalCreateMissing, setShowModalCreateMissing] = useState(false);

    const rowSelection = {
        type: 'radio',
        selectedRowKeys: selectedRow,
        onChange: (newSelectedRowKey) => {
            setSelectedRow(newSelectedRowKey);
        },
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage == 1) return;
        setCurrentPage((prev) => (prev == 1 ? 1 : prev - 1));
    };

    const columnsDefineSuggestProposal = [
        {
            title: 'Mã phiếu đề xuất',
            dataIndex: 'proposalID',
            key: 'proposalID',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) => <p>{record?.createdAt?.slice(0, 10)}</p>,
        },
        {
            title: 'Nhân viên lập phiếu',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate',
        },
        {
            title: 'Người phê duyệt',
            dataIndex: 'approverID',
            key: 'approverID',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => formatStatusProposal[status],
        },
    ];

    const columnsDefineMissingProposal = [
        {
            title: 'Mã phiếu thiếu',
            dataIndex: 'orderPurchaseMissingID',
            key: 'orderPurchaseMissingID',
        },
        {
            title: 'Mã phiếu nhập',
            dataIndex: 'orderPurchaseID',
            key: 'orderPurchaseID',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) => <p>{record?.createdAt?.slice(0, 10)}</p>,
        },
        {
            title: 'Nhân viên lập phiếu',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate',
            render: (_, record) => <p>{record?.orderPurchase?.employee?.employeeID || 'N/A'}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => formatStatusProposal[status],
        },
    ];

    useEffect(() => {
        const warehouse = parseToken('warehouse');
        if (option.suggestProposal)
            fetchProposal('warehouse', warehouse.warehouseID, 'COMPLETED', currentPage)
                .then((res) => {
                    const formatData = res.proposals.map((it) => ({
                        key: it.proposalID,
                        ...it,
                    }));
                    setSuggestListProposal(formatData || []);
                })
                .catch((err) => console.log(err));
        else
            fetchOrderMissing(warehouse.warehouseID, currentPage)
                .then((res) => {
                    console.log(res);
                    const formatData = res.data.data.map((it) => ({
                        key: it.orderPurchaseMissingID,
                        ...it,
                    }));
                    setMissingListProposal(formatData || []);
                })
                .catch((err) => console.log(err));
    }, [option, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [option]);

    useEffect(() => {
        console.log(selectedRow);
        if (selectedRow.length > 0) {
            let indexProposal = option.missingProposal
                ? missingListProposal.findIndex((it) => it.orderPurchaseMissingID == selectedRow[0])
                : suggestListProposal.findIndex((it) => it.proposalID == selectedRow[0]);  
            if (indexProposal == -1) return;
            if (option.suggestProposal) {
                setProposalSelected(suggestListProposal[indexProposal]);
                setShowModalCreate(true);
            }
            else {
                setProposalSelected(missingListProposal[indexProposal]);
                setShowModalCreateMissing(true);
            }    
        }
    }, [selectedRow]);

    return (
        <div className={cx('wrapper-import-product')}>
            <section
                className={cx('header-receive-product', {
                    show: option.suggest,
                })}
            >
                <div className={cx('form-group')}>
                    <h2>Lựa chọn nhập kho</h2>
                    <div className={cx('form-control')}>
                        <input
                            type="radio"
                            name="importChoice"
                            value={option.missingProposal}
                            onChange={() =>
                                setOption({
                                    missingProposal: true,
                                    suggestProposal: false,
                                })
                            }
                            checked={option.missingProposal}
                        />
                        <label>Phiếu thiếu</label>
                    </div>
                    <div className={cx('form-control')}>
                        <input
                            type="radio"
                            name="importChoice"
                            value={option.suggestProposal}
                            onChange={() =>
                                setOption({
                                    missingProposal: false,
                                    suggestProposal: true,
                                })
                            }
                            checked={option.suggestProposal}
                        />
                        <label>Phiếu đề xuất</label>
                    </div>
                </div>
            </section>

            {/** danh sách phiếu đề xuất hoặc phiếu thiếu */}
            {option.suggestProposal && (
                <div className={cx('view-list-proposal')}>
                    <div className={cx('table-header')}>
                        '<p className={cx('table-title')}>Danh sách phiếu đề xuất</p>
                        <InputBase className={cx('search')} placeholder="Tìm kiếm" />
                    </div>

                    <MyTable
                        data={suggestListProposal}
                        columns={columnsDefineSuggestProposal}
                        rowSelection={rowSelection}
                    />
                    <div className={cx('pagination-table')}>
                        <PaginationUI
                            currentPage={currentPage}
                            handleNextPage={handleNextPage}
                            handlePrevPage={handlePrevPage}
                        />
                    </div>
                </div>
            )}

            {option.missingProposal && (
                <div className={cx('view-list-proposal')}>
                    <div className={cx('table-header')}>
                        '<p className={cx('table-title')}>Danh sách phiếu đề xuất</p>
                        <InputBase className={cx('search')} placeholder="Tìm kiếm" />
                    </div>

                    <MyTable
                        data={missingListProposal}
                        columns={columnsDefineMissingProposal}
                        rowSelection={rowSelection}
                    />
                    <div className={cx('pagination-table')}>
                        <PaginationUI
                            currentPage={currentPage}
                            handleNextPage={handleNextPage}
                            handlePrevPage={handlePrevPage}
                        />
                    </div>
                </div>
            )}

            {showModalCreate && <CreateImportReceiptDialog
                isOpen={showModalCreate}
                onClose={() => setShowModalCreate(false)}
                proposalItem={proposalSelected}
            />}

            {showModalCreateMissing && <CreateImportReceiptMissingDialog
                isOpen={showModalCreateMissing}
                onClose={() => setShowModalCreateMissing(false)}
                orderPurchaseMissing={proposalSelected}
            />}
        </div>
    );
};

export default ImportProduct;
