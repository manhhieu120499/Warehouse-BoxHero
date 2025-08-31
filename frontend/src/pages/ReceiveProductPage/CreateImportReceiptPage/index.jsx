import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateImportReceiptPage.module.scss';
import parseToken from '../../../utils/parseToken';
import request from '../../../utils/httpRequest';
import { formatStatusProposal } from '../../../constants';
import { useSelector } from 'react-redux';
import { Button, MyTable } from '../../../components';
import { Search } from 'lucide-react';
import { useDebounce } from '../../../hooks';
import InputBase from '../../../components/InputBase';

const cx = classNames.bind(styles);
const emptyItem = () => ({
    batchID: '',
    productID: '',
    productName: '',
    unit: '',
    requestAmount: '',
    realAmount: '',
    errorAmount: '',
    location: '',
    reasonError: '',
});

const CreateImportReceiptPage = ({currentUser, currentWarehouse}) => {
    const [creator, setCreator] = useState('');
    const [approver, setApprover] = useState('');
    const [publishedDate, setPublishedDate] = useState(new Date().toISOString().slice(0, 10));
    const [code, setCode] = useState('');
    const [reason, setReason] = useState('');
    const [productListImport, setProductListImport] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [warehouse, setWarehouse] = useState('');
    const [option, setOption] = useState({
        nonSuggest: true,
        suggest: false,
    });
    const [proposalSelected, setProposalSelected] = useState(null);
    const [searchProposal, setSearchProposal] = useState("")
    const deboundValue = useDebounce(searchProposal, 200)

    const columnsProposal = [
        {
            title: 'Mã phiếu',
            dataIndex: 'proposalID',
            key: 'proposalID',
        },
        {
            title: 'Người tạo',
            dataIndex: 'employeeNameCreate',
            key: 'employeeNameCreate',
            render: (_, record) => <p>{record?.employeeCreate?.employeeName}</p>,
        },
        {
            title: 'Người duyệt',
            dataIndex: 'approverName',
            key: 'approverName',
            render: (_, record) => <p>{record?.approver?.employeeName}</p>,
        },
        {
            title: 'Tên Kho',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            render: (_, record) => <p>{record?.warehouse?.warehouseName}</p>,
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) => <p>{record?.createdAt?.slice(0, 10)}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <p>{formatStatusProposal[record?.status]}</p>,
        },
    ];

    // const datasource = [
    //     {
    //         key: 1,
    //         proposalID: 'PDX-1E3W4D',
    //         employeeNameCreate: 'Nguyễn Văn Tâm',
    //         approverName: 'Quản lý kho',
    //         warehouseName: 'Kho Thủ Đức',
    //         createdAt: '2020-12-12',
    //         status: 'Đã phê duyệt',
    //     },
    // ];

    const rowSelection = {
        type: 'radio',
        selectedRowKeys, // ✅ đúng key
        onChange: (newSelectedRowKeys, selectedRows) => {
            setSelectedRowKeys(newSelectedRowKeys); // ✅ lưu mảng key
        },
    };


    const handleSearchProposal = (e) => {
        setSearchProposal(e.target.value)
    }

    useEffect(() => {
        if (currentWarehouse) setWarehouse(currentWarehouse);
    }, [currentWarehouse]);

    useEffect(() => {
        if (currentUser) setCreator(currentUser);
    }, [currentUser]);

    useEffect(() => {
        if (selectedRowKeys.length > 0) {
            const proposalItem = productListImport.find((it) => it.proposalID == selectedRowKeys[0]);
            if (proposalItem) setProposalSelected(proposalItem);
        } else {
            setProposalSelected((prev) => null);
        }
    }, [selectedRowKeys]);

    useEffect(() => {
        const fetchProposalWarehouse = async () => {
            try {
                const token = parseToken('tokenUser');
                const res = await request.post(
                    '/api/proposal/filter-proposal',
                    {
                        status: 'COMPLETED',
                        warehouseID: warehouse.warehouseID,
                    },
                    {
                        headers: {
                            token: `Beare ${token.accessToken}`,
                            employeeid: token.employeeID,
                            warehouseid: warehouse.warehouseID,
                        },
                    },
                );
                console.log(res.data);
                const formatData =
                    res.data.proposals.length > 0
                        ? res.data.proposals.map((it) => ({
                              key: it.proposalID,
                              ...it,
                          }))
                        : [];
                setProductListImport(formatData || []);
            } catch (err) {
                console.log(err);
                setProductListImport([]);
            }
        };
        if (warehouse) fetchProposalWarehouse();
    }, [warehouse]);

    useEffect(() => {
        if (option.nonSuggest) {
            setSelectedRowKeys((prev) => []);
        }
    }, [option]);

    useEffect(() => {
        if(deboundValue === "") {
            // call all proposal
        }else {
            // find proposal
            console.log('call api')
        }
    }, [deboundValue])
    return (
        <div className={cx('wrapper-content')}>
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
                            value={option.nonSuggest}
                            onChange={() =>
                                setOption({
                                    nonSuggest: true,
                                    suggest: false,
                                })
                            }
                            checked={option.nonSuggest}
                        />
                        <label>Không cần phiếu đề xuất</label>
                    </div>
                    <div className={cx('form-control')}>
                        <input
                            type="radio"
                            name="importChoice"
                            value={option.suggest}
                            onChange={() =>
                                setOption({
                                    nonSuggest: false,
                                    suggest: true,
                                })
                            }
                            checked={option.suggest}
                        />
                        <label>Cần phiếu đề xuất</label>
                    </div>
                </div>

                {/** table phiếu nhập */}
                <div className={cx('table-header')}>
                    <h2>Danh sách phiếu đề xuất nhập</h2>
                    <InputBase placeholder={'Nhập mã phiếu'} value={searchProposal} onChange={handleSearchProposal}/>
                </div>
                
                <MyTable
                    className={cx('table-proposal')}
                    columns={columnsProposal}
                    data={productListImport}
                    rowSelection={rowSelection}
                />
            </section>

            <main className={cx('container-receive-product')}>
                <header className={cx('header')}>
                    <div className={cx('headerLeft')}>
                        <h1 className={cx('title')}>Phiếu nhập kho</h1>
                    </div>
                    <div className={cx('headerActions')}>
                        <Button outline borderRadiusMedium onClick={() => {}}>
                            <span>Làm mới</span>
                        </Button>
                        <Button success borderRadiusMedium onClick={() => {}}>
                            Lưu phiếu
                        </Button>
                    </div>
                </header>
                {/** Thông tin chung của phiếu */}
                <section className={cx('card')}>
                    <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                    <div className={cx('grid3')}>
                        <div className={cx('field')}>
                            <label>Mã phiếu nhập</label>
                            <div className={cx('field-control')}>
                                <input
                                    placeholder="Tạo mã phiếu"
                                    readOnly={true}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                                <Button primary borderRadiusMedium onClick={() => setCode(generateCode('PNK-'))}>
                                    <span>Tạo mã phiếu</span>
                                </Button>
                            </div>
                        </div>
                        <div className={cx('field')}>
                            <label>Ngày lập</label>
                            <input
                                type="date"
                                value={publishedDate}
                                onChange={(e) => setPublishedDate(e.target.value)}
                            />
                        </div>
                        <div className={cx('field')}>
                            <label>Kho nhập</label>
                            <input value={warehouse.warehouseName} readOnly />
                        </div>
                        <div className={cx('field')}>
                            <label>Người lập phiếu</label>
                            <input placeholder="Nguyễn Văn A" value={creator?.empName || ''} readOnly />
                        </div>
                        <div className={cx('field')}>
                            <label>Người duyệt</label>
                            <input value={proposalSelected?.approver.employeeName || ''} readOnly />
                        </div>
                        <div className={cx('field')}>
                            <label>Mã phiếu đề xuất</label>
                            <input value={proposalSelected?.proposalID || ''} readOnly />
                        </div>
                        <div className={cx('field', 'colSpan3')}>
                            <label>Lý do nhập</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                value={proposalSelected?.note || reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/** Nhập sản phẩm */}
                <section></section>

                {/** Table sản phẩm */}
                <section className={cx('product-receive-list')}>
                    <h2>Danh sách nhập hàng</h2>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã lô</th>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Đơn vị tính</th>
                                <th>Số lượng yêu cầu</th>
                                <th>Số lượng thực tế</th>
                                <th>Số lượng lỗi</th>
                                <th>Vị trí lưu trữ</th>
                                <th>Lý do lỗi</th>
                                <th>Xoá</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposalSelected &&
                                proposalSelected.proposalDetails.map((it, idx) => {
                                    const proposalItem = emptyItem();
                                    proposalItem.productID = it.productID;
                                    proposalItem.productName = it.product.productName;
                                    proposalItem.requestAmount = it.quantity
                                    proposalItem.unit = it.unit.unitName
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <input type="text" placeholder="Nhập mã lô" />
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập mã sản phẩm" value={proposalItem.productID}/>
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập tên sản phẩm" value={proposalItem.productName}/>
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập đơn vị tính" value={proposalItem.unit}/>
                                            </td>
                                            <td>
                                                <input type="number" placeholder="Nhập số lượng" min={1} value={proposalItem.requestAmount}/>
                                            </td>
                                            <td>
                                                <input type="number" placeholder="Nhập số lượng" min={1} />
                                            </td>
                                            <td>
                                                <input type="number" placeholder="Nhập số lượng" min={0} />
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Vị trí lưu trữ" />
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập lý do" />
                                            </td>
                                            <td>
                                                <Trash size={20} color={'red'} />
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </section>
            </main>
            <footer className={cx('footer')}>
                <p>© {new Date().getFullYear()} Kho Hàng • Phiếu đề xuất nhập kho</p>
            </footer>
        </div>
    );
}

export default CreateImportReceiptPage;