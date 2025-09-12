import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ApprovePage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import request, { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusProposal, styleMessage } from '../../constants';
import toast from 'react-hot-toast';
import Select from '../../components/Select';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const ApprovePage = () => {
    const pageSize = 5;
    const [page, setPage] = useState(1);
    const [proposalPurchaseList, setProposalPurchaseList] = useState([]);
    const [proposalReleaseList, setProposalReleaseList] = useState([]);
    const [filterProposal, setFilterProposal] = useState({
        proposalID: '',
        createdAt: '',
        status: 'PENDING',
        employeeIDCreate: '',
    });

    const [filterTabProposal, setFilterTabProposal] = useState({
        PURCHASE_PROPOSAL: true,
        RELEASE_PROPOSAL: false,
    });

    const handleApproveProposal = async (proposalID, status = 'COMPLETED') => {
        try {
            const token = parseToken('tokenUser');
            const res = await post(
                '/api/proposal/update-status-proposal',
                {
                    proposalID,
                    employeeIDApproval: token.employeeID,
                    status,
                },
                token.accessToken,
                token.employeeID,
            );
            // console.log(res)
            toast.success(res.message, styleMessage);
            //fetchProposals(1)\
            handleSearch();
        } catch (err) {
            console.log(err);
            toast.error(err.response.data.message, styleMessage);
            return;
        }
    };
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
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, createdAt: value })),
        },
        {
            id: 3,
            label: 'Mã người tạo',
            value: filterProposal.employeeIDCreate,
            name: 'employeeIDCreate',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, employeeIDCreate: value })),
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
            title: filterTabProposal.PURCHASE_PROPOSAL ? 'Mã phiếu đề xuất nhập' : 'Mã phiếu đề xuất xuất',
            dataIndex: 'proposalID',
            key: 'proposalID',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createAt',
            render: (text) => <p>{text.slice(0, 10)}</p>,
        },
        {
            title: 'Mã người tạo',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate',
        },
        {
            title: 'Mã kho',
            dataIndex: 'warehouseID',
            key: 'warehouseID',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <p>{formatStatusProposal[text]}</p>,
        },
        {
            title: 'Phê duyệt',
            dataIndex: 'action',
            key: 'action',
            width: '20%',
            render: (_, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        {record.status == 'PENDING' && (
                            <>
                                <Button
                                    disabled={record.status == 'COMPLETED'}
                                    success
                                    onClick={() => handleApproveProposal(record.proposalID, 'COMPLETED')}
                                >
                                    <span>Chấp nhận</span>
                                </Button>
                                <Button
                                    disabled={record.status == 'REFUSE'}
                                    error
                                    onClick={() => handleApproveProposal(record.proposalID, 'REFUSE')}
                                >
                                    <span>Từ chối</span>
                                </Button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    const optionsSelect = [
        {
            name: 'Phiếu đề xuất nhập',
            value: 'PURCHASE_PROPOSAL',
        },
        {
            name: 'Phiếu đề xuất xuất',
            value: 'RELEASE_PROPOSAL',
        },
    ];

    // const fetchProposals = async (page = 1, type="PURCHASE_PROPOSAL") => {
    //     try {
    //         console.log(page)
    //         const token = parseToken("tokenUser")
    //         const warehouse = parseToken('warehouse')
    //         const res = await request.post('/api/proposal/filter-proposal', {
    //             params: {
    //                 page,
    //                 status: filterProposal.status,
    //             },
    //             headers: {
    //                 token: `Beare ${token.accessToken}`,
    //                 employeeid: token.employeeID,
    //                 warehouseID: warehouse.warehouseID
    //             }
    //         })
    //         //console.log(res.data.proposals)
    //         if(type === 'PURCHASE_PROPOSAL')
    //             setProposalPurchaseList(res.data.proposals.length > 0 ? res.data.proposals : [])
    //         else setProposalReleaseList(res.data.proposals.length > 0 ? res.data.proposals : [])
    //         setPage(page)
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }

    const handleResetFilter = () => {
        setFilterProposal({
            proposalID: '',
            createdAt: '',
            status: '',
            employeeIDCreate: '',
        });
        setPage((prev) => 1);
        //fetchProposals(1)
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
                    employeeIDCreate: filterProposal?.employeeIDCreate,
                },
                token.accessToken,
                token.employeeID,
            );
            setProposalPurchaseList(res.proposals || []);
        } catch (err) {
            console.log(err);
        }
    };

    const handleNextPage = () => {
        //fetchProposals(page + 1)
    };

    const handlePrevPage = async () => {
        if (page - 1 <= 0) return;
        //fetchProposals(page - 1)
    };

    const handleOnChangeSelectProposal = (e) => {
        console.log(e.target.value);
        if (e.target.value === 'PURCHASE_PROPOSAL')
            setFilterTabProposal((prev) => ({ PURCHASE_PROPOSAL: true, RELEASE_PROPOSAL: false }));
        else setFilterTabProposal((prev) => ({ PURCHASE_PROPOSAL: false, RELEASE_PROPOSAL: true }));
    };

    useEffect(() => {
        //fetchProposals(page)
        handleSearch();
    }, [filterProposal.status]);
    return (
        <div className={cx('wrapper-approve')}>
            <ModelFilter
                columns={columnsFilter}
                handleResetFilters={handleResetFilter}
                selectInput={selectFilter}
                handleSubmitFilter={handleSearch}
            />
            <div className={cx('table-container-header')}>
                <h1 className={cx('title-approve')}>{`Danh sách phiếu đề xuất ${formatStatusProposal[
                    filterProposal.status
                ].toLowerCase()}`}</h1>
                {/* <Select options={optionsSelect} onChange={handleOnChangeSelectProposal}/> */}
            </div>
            <div className={cx('table-container')}>
                {/* {filterTabProposal.PURCHASE_PROPOSAL
                    && <MyTable className={cx("my-table")} columns={columnsTable} data={proposalPurchaseList} pageSize={pageSize} />}
                {filterTabProposal.RELEASE_PROPOSAL && <MyTable className={cx("my-table")} columns={columnsTable} data={proposalReleaseList} pageSize={pageSize} />} */}
                <MyTable
                    className={cx('my-table')}
                    columns={columnsTable}
                    data={proposalPurchaseList}
                    pageSize={pageSize}
                />
                <PaginationUI currentPage={page} handleNextPage={handleNextPage} handlePrevPage={handlePrevPage} />
            </div>
        </div>
    );
};

export default ApprovePage;
