import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ApprovePage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusProposal } from '../../constants';
import Tippy from '@tippyjs/react';
import { Eye } from 'lucide-react';
import ModelProposalDetail from './ModelProposalDetail';
import { convertDateVN } from '../../common';
import ProposalStatus from '../../components/ProposalStatus';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const ApprovePage = () => {
    const pageSize = 4;
    const [page, setPage] = useState(1);
    const [proposalPurchaseList, setProposalPurchaseList] = useState([]);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [typeDetail, setTypeDetail] = useState(true);
    const [proposalDetailID, setProposalDetailID] = useState(null);
    const [filterProposal, setFilterProposal] = useState({
        proposalID: '',
        createdAt: '',
        status: 'PENDING',
        employeeName: '',
    });

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu đề xuất',
            value: filterProposal.proposalID,
            name: 'proposalID',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, proposalID: value })),
        },
        {
            id: 2,
            label: 'Ngày lập',
            value: filterProposal.createdAt,
            name: 'createdAt',
            type: 'date',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, createdAt: value })),
        },
        {
            id: 3,
            label: 'Mã người tạo',
            value: filterProposal.employeeName,
            name: 'employeeName',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, employeeName: value })),
        },
    ];

    const selectFilter = [
        {
            id: 3,
            label: 'Trạng thái',
            value: filterProposal.status,
            name: 'status',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, status: value })),
            option: [
                {
                    name: 'Chờ phê duyệt',
                    value: 'PENDING',
                },
                {
                    name: 'Đã phê duyệt',
                    value: 'COMPLETED',
                },
                {
                    name: 'Đã từ chối',
                    value: 'REFUSE',
                },
            ],
        },
    ];

    const columnsTable = [
        {
            title: 'Mã phiếu đề xuất nhập',
            dataIndex: 'proposalID',
            key: 'proposalID',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createAt',
            render: (text) => {
                return <p>{convertDateVN(text)}</p>;
            },
        },
        {
            title: 'Tên người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (_, record) => <p>{record?.employeeCreate?.employeeName}</p>,
        },
        {
            title: 'Tên kho',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            render: (_, record) => <p>{record?.warehouse?.warehouseName}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => {
                return <ProposalStatus index={index} record={record} />;
            },
        },
        {
            title: 'Chi tiết',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Xem chi tiết'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => {
                                    setTypeDetail(true);
                                    setProposalDetailID(record.proposalID);
                                    setShowModalDetail(true);
                                }}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    const fetchProposals = async (page = 1) => {
        try {
            const token = parseToken('tokenUser');
            const res = await post(
                '/api/proposal/filter-proposal',
                {
                    status: 'PENDING',
                    page,
                },
                token.accessToken,
                token.employeeID,
            );
            setProposalPurchaseList(res.proposals || []);
        } catch (err) {
            console.log(err);
        }
    };

    const handleResetFilter = () => {
        const { proposalID, createdAt, employeeName } = filterProposal;
        if (!proposalID && !createdAt && !employeeName) return;
        setFilterProposal({
            proposalID: '',
            createdAt: '',
            status: 'PENDING',
            employeeName: '',
        });
        setPage(1);
        fetchProposals();
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
            console.log(res);
            setProposalPurchaseList(res.proposals || []);
        } catch (err) {
            console.log(err);
        }
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    const handlePrevPage = async () => {
        if (page - 1 <= 0) return;
        setPage(page - 1);
    };

    useEffect(() => {
        //fetchProposals(page)
        handleSearch();
    }, [filterProposal.status]);

    useEffect(() => {
        console.log('page', page);
        fetchProposals(page);
    }, [page]);

    return (
        <div className={cx('wrapper-approve')}>
            <ModelFilter
                columns={columnsFilter}
                handleResetFilters={handleResetFilter}
                selectInput={selectFilter}
                handleSubmitFilter={handleSearch}
            >
                <Button
                    primary
                    onClick={() => {
                        setTypeDetail(false);
                        setShowModalDetail(true);
                    }}
                >
                    <span>Tạo phiếu đề xuất</span>
                </Button>
            </ModelFilter>
            <div className={cx('table-container-header')}>
                <h1 className={cx('title-approve')}>{`Danh sách phiếu đề xuất ${formatStatusProposal[
                    filterProposal.status
                ].toLowerCase()}`}</h1>
            </div>
            <div className={cx('table-container')}>
                <MyTable
                    className={cx('my-table')}
                    columns={columnsTable}
                    data={proposalPurchaseList}
                    //pageSize={pageSize}
                />
                <PaginationUI currentPage={page} handleNextPage={handleNextPage} handlePrevPage={handlePrevPage} />
            </div>
            {showModalDetail && (
                <ModelProposalDetail
                    proposalDetailID={proposalDetailID}
                    typeDetail={typeDetail}
                    isOpen={showModalDetail}
                    onClose={() => setShowModalDetail(false)}
                    handleSearch={handleSearch}
                />
            )}
        </div>
    );
};

export default ApprovePage;
