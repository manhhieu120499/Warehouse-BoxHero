/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ImportProduct.module.scss';
import { formatStatusProposal, formatStatusOrderPurchaseMissing } from '../../../constants';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../../components';
import InputBase from '../../../components/InputBase';
import { fetchFilterProposal, fetchProposalMissingOrderPurchase } from '../../../services/proposal.service';
import parseToken from '../../../utils/parseToken';
import CreateImportReceiptDialog from '../CreateImportReceiptDialog';
import CreateImportReceiptMissingDialog from '../CreateImportReceiptMissingDialog';
import { fetchOrderMissing } from '../../../services/order.service';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Circle, Download } from 'lucide-react';
import ModelProposalDetail from '../../ApprovePage/ModelProposalDetail';
import { post } from '../../../utils/httpRequest';

const cxGlobal = classNames.bind(globalStyle);
const cx = classNames.bind(styles);

const ImportProduct = () => {
    const [option, setOption] = useState('proposal-suggest');

    const [suggestListProposal, setSuggestListProposal] = useState([]);
    const [missingListProposal, setMissingListProposal] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [proposalSelected, setProposalSelected] = useState(null);
    const [showModalCreateMissing, setShowModalCreateMissing] = useState(false);
    const [showDetailProposal, setShowDetailProposal] = useState(false);

    const [filterProposal, setFilterProposal] = useState({
        code: '',
        createdAt: '',
        employeeName: '',
    });

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
            render: (_, record) => {
                return <p>{record?.employeeCreate?.employeeName}</p>;
            },
        },
        {
            title: 'Người phê duyệt',
            dataIndex: 'approverID',
            key: 'approverID',
            render: (_, record) => {
                return <p>{record?.approver?.employeeName}</p>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => {
                return (
                    <div className={cx('status-proposal')}>
                        <div className={cx('status-indicator', record.status)}></div>
                        <p>{formatStatusProposal[index]}</p>
                    </div>
                );
            },
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Button
                            success
                            medium
                            onClick={() => {
                                setSelectedRow(record.key);
                            }}
                        >
                            <span>Nhập kho</span>
                        </Button>
                        <Button
                            primary
                            medium
                            onClick={() => {
                                console.log(record);
                                setProposalSelected(record || null);
                                setShowDetailProposal(true);
                            }}
                        >
                            <span>Xem chi tiết</span>
                        </Button>
                    </div>
                );
            },
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
            render: (_, record) => {
                return <p>{record?.orderPurchase?.employee?.employeeName}</p>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (option.missingProposal) return formatStatusOrderPurchaseMissing[status];
                else return formatStatusProposal[status];
            },
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Button
                            success
                            medium
                            onClick={() => {
                                setSelectedRow(record.key);
                            }}
                        >
                            <span>Nhập bổ sung</span>
                        </Button>
                        <Button primary medium>
                            <span>Xem chi tiết</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    // fetch danh sách phiếu đề xuất của kho
    const handleFetchProposalMissingOrderPurchase = () => {
        fetchProposalMissingOrderPurchase()
            .then((res) => {
                console.log(res);
                const formatData = res.proposals.map((it) => ({
                    key: it.proposalID,
                    ...it,
                }));
                setSuggestListProposal(formatData || []);
            })
            .catch((err) => console.log(err));
    };

    // fetch danh sách phiếu thiếu của đơn đã nhập
    const handleFetchOrderMissing = () => {
        const warehouse = parseToken('warehouse');
        fetchOrderMissing(warehouse.warehouseID, currentPage)
            .then((res) => {
                const formatData = res.data.data.map((it) => ({
                    key: it.orderPurchaseMissingID,
                    ...it,
                }));
                setMissingListProposal(formatData || []);
            })
            .catch((err) => console.log(err));
    };

    // useEffect(() => {
    //     if (option == 'proposal-suggest') handleFetchProposalMissingOrderPurchase();
    //     else handleFetchOrderMissing();
    // }, [option, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [option]);

    useEffect(() => {
        if (!selectedRow) return;
        let indexProposal =
            option != 'proposal-suggest'
                ? missingListProposal.findIndex((it) => it.orderPurchaseMissingID == selectedRow)
                : suggestListProposal.findIndex((it) => it.proposalID == selectedRow);
        console.log(indexProposal);
        if (indexProposal == -1) return;
        if (option == 'proposal-suggest') {
            setProposalSelected(suggestListProposal[indexProposal]);
            setShowModalCreate(true);
        } else {
            setProposalSelected(missingListProposal[indexProposal]);
            setShowModalCreateMissing(true);
        }
    }, [selectedRow]);

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu đề xuất',
            dataIndex: 'orderPurchaseID',
            key: 'orderPurchaseID',
            setValue: (value) => setFilterProposal({ ...filterProposal, code: value }),
            value: filterProposal.code,
        },
        {
            id: 2,
            label: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            type: 'date',
            setValue: (value) => setFilterProposal({ ...filterProposal, createdAt: value }),
            value: filterProposal.createdAt,
        },
        {
            id: 3,
            label: 'Tên nhân viên lập phiếu',
            dataIndex: 'employeeName',
            key: 'employeeName',
            setValue: (value) => setFilterProposal({ ...filterProposal, employeeName: value }),
            value: filterProposal.employeeName,
        },
    ];

    const selectInput = [
        {
            label: 'Loại phiếu',
            option: [
                {
                    name: 'Phiếu đề xuất',
                    value: 'proposal-suggest',
                },
                {
                    name: 'Phiếu thiếu',
                    value: 'proposal-missing',
                },
            ],
            setValue: (value) => setOption(value),
        },
    ];

    const handleSubmitFilter = async () => {
        if (Object.keys(filterProposal).every((key) => filterProposal[key] == '')) return;
        if (option == 'proposal-suggest') {
            try {
                const resultFilter = await fetchFilterProposal({
                    ...filterProposal,
                    proposalID: filterProposal.code,
                });
                setSuggestListProposal(resultFilter?.proposals || []);
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                const resultFilter = await fetchFilterProposal({
                    ...filterProposal,
                    orderPurchaseMissingID: filterProposal.code,
                });
                console.log(resultFilter);
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleResetFilter = () => {
        setFilterProposal({
            code: '',
            createdAt: '',
            employeeName: '',
        });
    };

    const handleSearch = async () => {
        if (!Object.keys(filterProposal).some((key) => filterProposal[key])) return;
        try {
            const token = parseToken('tokenUser');
            const res = await post(
                '/api/proposal/filter-proposal',
                {
                    proposalID: filterProposal?.proposalID,
                    createdAt: filterProposal?.createdAt,
                    status: filterProposal?.status,
                    employeeName: filterProposal?.employeeName,
                },
                token.accessToken,
                token.employeeID,
            );
            //console.log(res);
            //setProposalPurchaseList(res.proposals || []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const { code, createdAt, employeeName } = filterProposal;
        if (code == '' && createdAt == '' && employeeName == '') {
            if (option == 'proposal-suggest') handleFetchProposalMissingOrderPurchase();
            else handleFetchOrderMissing();
        }
    }, [filterProposal, option, currentPage]);

    return (
        <div className={cx('wrapper-import-product')}>
            <ModelFilter
                className={cx('header-filter')}
                columns={columnsFilter}
                selectInput={selectInput}
                handleSubmitFilter={handleSubmitFilter}
                handleResetFilters={handleResetFilter}
            />

            {/** danh sách phiếu đề xuất hoặc phiếu thiếu */}
            {option == 'proposal-suggest' && (
                <div className={cx('view-list-proposal')}>
                    <div className={cx('table-header')}>
                        '<p className={cx('table-title')}>Danh sách phiếu đề xuất</p>
                    </div>

                    <MyTable data={suggestListProposal} columns={columnsDefineSuggestProposal} />
                    <div className={cx('pagination-table')}>
                        <PaginationUI
                            currentPage={currentPage}
                            handleNextPage={handleNextPage}
                            handlePrevPage={handlePrevPage}
                        />
                    </div>
                </div>
            )}

            {option == 'proposal-missing' && (
                <div className={cx('view-list-proposal')}>
                    <div className={cx('table-header')}>
                        '<p className={cx('table-title')}>Danh sách phiếu nhập thiếu</p>
                    </div>

                    <MyTable data={missingListProposal} columns={columnsDefineMissingProposal} />
                    <div className={cx('pagination-table')}>
                        <PaginationUI
                            currentPage={currentPage}
                            handleNextPage={handleNextPage}
                            handlePrevPage={handlePrevPage}
                        />
                    </div>
                </div>
            )}

            {showModalCreate && (
                <CreateImportReceiptDialog
                    isOpen={showModalCreate}
                    onClose={() => {
                        setSelectedRow([]);
                        setShowModalCreate(false);
                    }}
                    proposalItem={proposalSelected}
                    handleFetchProposalMissingOrderPurchase={handleFetchProposalMissingOrderPurchase}
                />
            )}

            {showModalCreateMissing && (
                <CreateImportReceiptMissingDialog
                    isOpen={showModalCreateMissing}
                    onClose={() => {
                        setSelectedRow([]);
                        setShowModalCreateMissing(false);
                    }}
                    orderPurchaseMissing={proposalSelected}
                    handleFetchOrderMissing={handleFetchOrderMissing}
                />
            )}

            {showDetailProposal && (
                <ModelProposalDetail
                    isOpen={showDetailProposal}
                    typeDetail={true}
                    onClose={() => setShowDetailProposal(false)}
                    proposalDetailID={proposalSelected.proposalID}
                    handleSearch={handleSearch}
                />
            )}
        </div>
    );
};

export default ImportProduct;
