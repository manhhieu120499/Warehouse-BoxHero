import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ApprovePage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import globalStyle from "../../components/GlobalStyle/GlobalStyle.module.scss"
import request, { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusProposal, styleMessage } from '../../constants';
import toast from 'react-hot-toast';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle)

const ApprovePage = () => {
    const pageSize = 5
    const [page, setPage] = useState(1);
    const [proposalList, setProposalList] = useState([])
    const [filterProposal, setFilterProposal] = useState({
        proposalID: "",
        createdAt: "",
        status: "",
        employeeIDCreate: ''
    })

    const handleApproveProposal = async (proposalID, status = "COMPLETED") => {
        try{
            const token = parseToken("tokenUser")
            const res = await post("/api/proposal/update-status-proposal", {
                proposalID,
                employeeIDApproval: token.employeeID,
                status
            }, token.accessToken, token.employeeID)
           // console.log(res)
            toast.success(res.message, styleMessage)
            fetchProposals(1)
        }catch(err) {
            console.log(err)
            toast.error(err.response.data.message, styleMessage)
            return;
        }
    }
    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu xuất',
            value: filterProposal.proposalID,
            name: 'proposalID',
            setValue: (value) => setFilterProposal(prev => ({...prev, proposalID: value}))
        },
        {
            id: 2,
            label: 'Ngày lập',
            value: filterProposal.createdAt,
            name: 'createdAt',
            setValue: (value) => setFilterProposal(prev => ({...prev, createdAt: value}))
        },
        {
            id: 3, 
            label: 'Mã người tạo',
            value: filterProposal.employeeIDCreate,
            name: 'employeeIDCreate',
            setValue: (value) => setFilterProposal(prev => ({...prev, employeeIDCreate: value}))
        }
        
    ]

    const selectFilter = [
         {
            id: 3,
            label: 'Trạng thái',
            value: filterProposal.status,
            name: 'status',
            setValue: (value) => setFilterProposal(prev => ({...prev, status: value})),
            option: [
                {
                    name: "Chờ phê duyệt",
                    value: 'PENDING'
                },
                {
                    name: "Đã phê duyệt",
                    value: 'COMPLETED'
                },
                {
                    name: "Đã từ chối",
                    value: 'REFUSE'
                }
            ]
        }
    ]

    const columnsTable = [
        {
            title: 'Mã phiếu nhập',
            dataIndex: 'proposalID',
            key: 'proposalID'
        },
        {
            title: 'Ngày lâp',
            dataIndex: 'createdAt',
            key: 'createAt',
            render: (text) => <p>{text.slice(0, 10)}</p>
        },
        {
            title: 'Mã người tạo',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate'
        },
        {
            title: 'Mã kho',
            dataIndex: 'warehouseID',
            key: 'warehouseID'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <p>{formatStatusProposal[text]}</p>
        },
        {
            title: 'Phê duyệt',
            dataIndex: 'action',
            key: 'action',
            width: '20%',
            render: (_, record) => {
                return <div className={cxGlobal('action-table')}>
                    <Button disabled={record.status == 'COMPLETED'} success onClick={() => handleApproveProposal(record.proposalID, 'COMPLETED')}>
                        <span>Chấp nhận</span>
                    </Button>
                    <Button disabled={record.status == 'REFUSE'} error onClick={()=> handleApproveProposal(record.proposalID, 'REFUSE')}>
                        <span>Từ chối</span>
                    </Button>
                </div>
            }
        }
    ]

    const datasource = [
        {
            proposalID: '1',
            createdAt: new Date().toISOString().slice(0, 10),
            employeeIDCreate: 'EP1',
            warehouseID: 'WH1',
            status: 'Chờ phê duyệt'
        }
    ]

    const fetchProposals = async (page = 1) => {
        try{
            console.log(page)
            const token = parseToken("tokenUser")
            const warehouse = parseToken('warehouse')
            const res = await request.get('/api/proposal/get-proposal/employee', {
                params: {
                    page
                },
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseID: warehouse.warehouseID
                }
            })
            //console.log(res.data.proposals)
            setProposalList(res.data.proposals.length > 0 ? res.data.proposals : [])
            setPage(page)
        }catch(err) {
            console.log(err)
        }
    }

    const handleResetFilter = () => {
        setFilterProposal({
            proposalID: '',
            createdAt: "",
            status: '',
            employeeIDCreate: ""
        })
        setPage(prev => 1)
        fetchProposals(1)
    }

    const handleSearch = async () => {
        if(!Object.keys(filterProposal).some(key => filterProposal[key])) return;
        try{
            const token = parseToken('tokenUser')
            const res = await post('/api/proposal/filter-proposal', {
                proposalID: filterProposal?.proposalID,
                createdAt: filterProposal?.createdAt,
                status: filterProposal?.status,
                employeeIDCreate: filterProposal?.employeeIDCreate
            }, token.accessToken, token.employeeID)
            setProposalList(res.proposals || [])
        }catch(err) {
            console.log(err)
        }
    }

    const handleNextPage = () => {
        fetchProposals(page + 1)
    }

    const handlePrevPage = async () => {
        if(page - 1 <= 0) return;
        fetchProposals(page - 1)
    }

    useEffect(() => {
        fetchProposals(page)
    }, [page])
    return (
        <div className={cx('wrapper-approve')}>
            <ModelFilter columns={columnsFilter} handleResetFilters={handleResetFilter} selectInput={selectFilter} handleSubmitFilter={handleSearch}/>
            <h1 className={cx('title-approve')}>Danh sách phiếu đề xuất chờ duyệt</h1>
            <div className={cx('table-container')}>
                <MyTable className={cx("my-table")} columns={columnsTable} data={proposalList} pageSize={pageSize}/>
                 <PaginationUI currentPage={page} handleNextPage={handleNextPage} handlePrevPage={handlePrevPage}/>
            </div>
            
        </div>
    );
}

export default ApprovePage;