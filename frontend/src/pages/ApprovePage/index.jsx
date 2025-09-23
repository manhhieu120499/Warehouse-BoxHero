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
import Tippy from '@tippyjs/react';
import { Eye } from 'lucide-react';
import { set } from 'react-hook-form';
import ModelProposalDetail from './ModelProposalDetail';
import { convertDateVN } from '../../common';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const ApprovePage = () => {
    const pageSize = 5;
    const [page, setPage] = useState(1);
    const [proposalPurchaseList, setProposalPurchaseList] = useState([]);
    const [proposalReleaseList, setProposalReleaseList] = useState([]);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [typeDetail, setTypeDetail] = useState(true);
    const [proposalDetailID, setProposalDetailID] = useState(null);
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
            render: (text) => {
                return <p>{convertDateVN(text)}</p>;
            },
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
            render: (index, record) => {
                return (
                    <div className={cx('status-proposal')}>
                        <div className={cx('status-indicator', record.status)}></div>
                        <p>{formatStatusProposal[index]}</p>
                    </div>
                );
            },
        },
        // {
        //     title: 'Phê duyệt',
        //     dataIndex: 'action',
        //     key: 'action',
        //     width: '20%',
        //     render: (_, record) => {
        //         return (
        //             <div className={cxGlobal('action-table')}>
        //                 {record.status == 'PENDING' && (
        //                     <>
        //                         <Button
        //                             disabled={record.status == 'COMPLETED'}
        //                             success
        //                             onClick={() => handleApproveProposal(record.proposalID, 'COMPLETED')}
        //                         >
        //                             <span>Chấp nhận</span>
        //                         </Button>
        //                         <Button
        //                             disabled={record.status == 'REFUSE'}
        //                             error
        //                             onClick={() => handleApproveProposal(record.proposalID, 'REFUSE')}
        //                         >
        //                             <span>Từ chối</span>
        //                         </Button>
        //                     </>
        //                 )}
        //             </div>
        //         );
        //     },
        // },
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
            status: 'PENDING',
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
