import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateImportReceiptPage.module.scss';
import parseToken from '../../../utils/parseToken';
import request, { post } from '../../../utils/httpRequest';
import { formatStatusProposal, styleMessage } from '../../../constants';
import { useSelector } from 'react-redux';
import { Button, MyTable, TableProductImport } from '../../../components';
import { Search, Trash } from 'lucide-react';
import { useDebounce } from '../../../hooks';
import InputBase from '../../../components/InputBase';
import { generateCode } from '../../../utils/generate';
import toast from 'react-hot-toast';

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
    supplierID: '',
    manufactureDate: '',
    expiryDate: '',
    supplierName: '',
});

const CreateImportReceiptPage = ({ currentUser, currentWarehouse }) => {
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
    const [searchProposal, setSearchProposal] = useState('');
    const deboundValue = useDebounce(searchProposal, 200);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8);
    const [productRealImport, setProductRealImport] = useState([]);
    const [productListImportNotProposal, setProductListImportNotProposal] = useState([emptyItem()]);

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

    const onChangePage = (newPage, pageSize) => {
        setPage(newPage);
    };

    const handleSearchProposal = (e) => {
        setSearchProposal(e.target.value);
    };

    const validatePayloadCreateReceipt = (payload, type) => {
        if (type == 'suggest') {
            if (!payload.proposalID) {
                toast.error('Vui lòng chọn phiếu đề xuất', styleMessage);
                return false;
            }  
        }
        if (!payload.orderPurchaseID) {
                toast.error('Vui lòng tạo mã phiếu', styleMessage);
                return false;
            }
        if (payload.orderPurchaseDetails.length === 0) {
            toast.error('Vui lòng thêm danh sách sản phẩm cần nhập', styleMessage);
            return false;
        }
        for (const item of payload.orderPurchaseDetails) {
            if (!item.batchID) {
                toast.error('Vui lòng nhập mã lô', styleMessage);
                return false;
            }
            if (!item.supplierID) {
                toast.error('Vui lòng nhập mã nhà cung cấp', styleMessage);
                return false;
            }
            if (!item.productID) {
                toast.error('Vui lòng nhập mã sản phẩm', styleMessage);
                return false;
            }
            if (!item.unitID) {
                toast.error('Vui lòng chọn đơn vị tính', styleMessage);
                return false;
            }
            if (!item.manufactureDate) {
                toast.error('Vui lòng nhập ngày sản xuất tại phần thêm chi tiết', styleMessage);
                return false;
            }
            if (!item.expiryDate) {
                toast.error('Vui lòng nhập ngày hết hạn tại phần thêm chi tiết', styleMessage);
                return false;
            }
            if (!item.actualQuantity) {
                toast.error('Vui lòng nhập số lượng sản phẩm thực tế', styleMessage);
                return false;
            }
            if (item.positions.length == 0) {
                toast.error('Vui lòng chọn vị trí lưu trữ taok phần thêm chi tiết', styleMessage);
                return false;
            }
        }

        return true;
    };

    const handleSaveReceipt = async () => {
        const listProductImport = option.suggest ? productRealImport : productListImportNotProposal
        const status = listProductImport.some(it => it.errorAmount > 0)
        const payload = {
            orderPurchaseID: code,
            createdAt: publishedDate,
            employeeID: creator.empId,
            warehouseID: warehouse.warehouseID,
            proposalID: proposalSelected?.proposalID || "",
            status: status ? "INCOMPLETE" : 'COMPLETED',
            orderPurchaseDetails: listProductImport.map((item, index) => ({
                orderPurchaseDetailID: index + 1,
                batchID: item.batchID,
                requestedQuantity: option.nonSuggest ? item.realAmount : item.requestAmount,
                actualQuantity: item.realAmount,
                unitID: item.unit?.unitID || item.unit,
                manufactureDate: item.manufactureDate,
                expiryDate: item.expiryDate,
                productID: item.productID,
                supplierID: item.supplierID,
                positions: [
                    {
                        zoneID: 'ZN1',
                        shelfID: 'SF1',
                        floorID: 'FL1',
                        boxID: 'BX1',
                    },
                ],
            })),
        };
        console.log(payload)
        if (!validatePayloadCreateReceipt(payload, option.nonSuggest ? "nonSuggest" : "suggest")) return;
        try {
            const token = parseToken('tokenUser');
            const res = await request.post('/api/order-purchase/create-order-purchase', payload, {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeID: payload.employeeID,
                    warehouseID: payload.warehouseID,
                },
            });
            if (res.data.status == 'OK') {
                toast.success(res.data.message, styleMessage);
                setSelectedRowKeys([])
                setProductRealImport([])
                setProductListImportNotProposal([emptyItem()])
                setCode("")
                setReason("")
                
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response.data.message, styleMessage);
            return;
        }
    };

    const suggestLocation = async (productItem) => {
        if (
            !productItem.batchID ||
            !productItem.productID ||
            !productItem.productName ||
            !productItem.supplierID ||
            !productItem.realAmount ||
            !productItem.requestAmount ||
            !productItem.errorAmount
        )
            return '';
        try {
            console.log('Vào');
            const token = parseToken('tokenUser');
            // call api
            return 'A-1-1';
        } catch (err) {
            console.log(err);
            return '';
        }
    };

    const updateCellData = (index, item) => {
        const updateProducts = productRealImport.map((it, idx) => (index === idx ? { ...item } : it));
        setProductRealImport(updateProducts);
    };

    const updateCellDataNotProposal = (index, item) => {
        const updateProducts = productListImportNotProposal.map((it, idx) => (index === idx ? { ...item } : it));
        setProductListImportNotProposal(updateProducts);
    };

    const handleDeleteRowData = (idx) => {
        const filterProduct = productListImportNotProposal.filter((it, index) => index != idx);
        setProductListImportNotProposal(filterProduct);
    };

    const handleAddNewRow = () => {
        setProductListImportNotProposal(prev => [...prev, emptyItem()])
    }

    const findSupplier = async (supplierID) => {
        try {
            const res = await request.get(`/api/supplier/${supplierID}`);
            return res.data.supplier;
        } catch (err) {
            throw new Error(err);
        }
    };

    const findProduct = async (productID) => {
        try{
            const token = parseToken("tokenUser")
            const res = await request.get(`/api/product?productID=${productID}`, 
                {
                    headers: {
                        token: `Beare ${token.accessToken}`,
                        employeeid: token.employeeID,
                        warehouseid: token.warehouseID
                    }
                }
            )
            return res.data.product
        }catch(err) {
            throw new Error(err)
        }
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
            if (proposalItem) {
                const productReceive = proposalItem.proposalDetails.map((it, idx) => {
                    const productEmpty = emptyItem();
                    productEmpty.productID = it.productID;
                    productEmpty.productName = it.product.productName;
                    productEmpty.requestAmount = it.quantity;
                    productEmpty.unit = it.unit;
                    return productEmpty;
                });
                setProposalSelected(proposalItem); // set phiếu đề xuất được chọn
                setProductRealImport(productReceive); // sét lại ds sản phẩm thực nhập
            }
        } else {
            setProposalSelected((prev) => null);
        }
    }, [selectedRowKeys, productListImport]);

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
            setProposalSelected(null)
            setProductRealImport([])
        }
    }, [option]);

    useEffect(() => {
        if (deboundValue === '') {
            // call all proposal
        } else {
            // find proposal
            console.log('call api');
        }
    }, [deboundValue]);

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
                    <InputBase placeholder={'Nhập mã phiếu'} value={searchProposal} onChange={handleSearchProposal} />
                </div>

                <MyTable
                    className={cx('table-proposal')}
                    columns={columnsProposal}
                    data={productListImport}
                    rowSelection={rowSelection}
                    onChangePage={onChangePage}
                    currentPage={page}
                    pageSize={pageSize}
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
                        <Button success borderRadiusMedium onClick={handleSaveReceipt}>
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
                            <input value={warehouse.warehouseName ?? ''} readOnly />
                        </div>
                        <div className={cx('field')}>
                            <label>Người lập phiếu</label>
                            <input placeholder="Nguyễn Văn A" value={creator?.empName || ''} readOnly />
                        </div>
                        {option.suggest && (
                            <>
                                <div className={cx('field')}>
                                <label>Người duyệt</label>
                                <input value={proposalSelected?.approver.employeeName || ''} readOnly />
                            </div>
                        
                            <div className={cx('field')}>
                                <label>Mã phiếu đề xuất</label>
                                <input value={proposalSelected?.proposalID || ''} readOnly />
                            </div>
                            </>
                        )}
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
                {/* <section className={cx('product-receive-list')}>
                    <h2>Danh sách nhập hàng</h2>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã lô</th>
                                <th>Mã nhà cung cấp</th>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Đơn vị tính</th>
                                <th>Số lượng yêu cầu</th>
                                <th>Số lượng thực tế</th>
                                <th>Số lượng lỗi</th>
                                <th>Vị trí lưu trữ</th>
                                <th>Lý do lỗi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposalSelected &&
                                productRealImport.map((it, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <input type="text" placeholder="Nhập mã lô" value={it.batchID ?? ""} onChange={(e) => updateCellData(idx, "batchID", e.target.value)}/>
                                            </td>
                                             <td>
                                                <input type="text" placeholder="Nhập mã nhà cung cấp" value={it.supplierID ?? ""}
                                                onChange={(e) => updateCellData(idx, "supplierID", e.target.value)}/>
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập mã sản phẩm" value={it.productID ?? ""} readOnly/>
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập tên sản phẩm" value={it.productName ?? ""}
                                                    readOnly
                                                />
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập đơn vị tính" value={it.unit ?? ""} readOnly/>
                                            </td>
                                            <td>
                                                <input type="number" placeholder="Nhập số lượng" min={1} value={it.requestAmount ?? ""} readOnly/>
                                            </td>
                                            <td>
                                                <input type="number" placeholder="Nhập số lượng" min={1} value={it.realAmount}
                                                    onChange={(e) => {
                                                         const raw = e.target.value.trim();
                                                            if (raw === "") {
                                                            updateCellData(idx, "realAmount", undefined);
                                                            } else {
                                                            const num = Number.parseInt(raw, 10);
                                                            updateCellData(idx, "realAmount", isNaN(num) ? undefined : num);
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <input type="number" placeholder="Nhập số lượng" min={0} value={it.errorAmount ?? ""} onChange={(e) => {
                                                    const raw = e.target.value.trim();
                                                            if (raw === "") {
                                                            updateCellData(idx, "errorAmount", undefined);
                                                            } else {
                                                            const num = Number.parseInt(raw, 10);
                                                            updateCellData(idx, "errorAmount", isNaN(num) ? undefined : num);
                                                        }
                                                }} onBlur={() => {
                                                    suggestLocation(productRealImport[idx]).then(res => updateCellData(idx, "location", res))
                                                }}/>
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Vị trí lưu trữ" value={it.location ?? ""}/>
                                            </td>
                                            <td>
                                                <input type="text" placeholder="Nhập lý do" value={it.reasonError ?? ""} onChange={(e) => updateCellData(idx, "reasonError", e.target.value)}/>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </section> */}
                {option.nonSuggest && (
                    <TableProductImport
                        title="Danh sách nhập hàng"
                        products={productListImportNotProposal}
                        updateCellData={updateCellDataNotProposal}
                        clearRow={(idx) => handleDeleteRowData(idx)}
                        suggestLocation={suggestLocation}
                        searchSupplier={findSupplier}
                        searchProduct={findProduct}
                        addRow={handleAddNewRow}
                    />
                )}
                {option.suggest && (
                    <TableProductImport
                        title="Danh sách nhập hàng"
                        products={productRealImport}
                        updateCellData={updateCellData}
                        clearRow={(idx) => {}}
                        hasProposal={true}
                        proposalSelected={proposalSelected}
                        suggestLocation={suggestLocation}
                        searchSupplier={findSupplier}
                    />
                )}

                {/** Table sản phẩm không cần phiếu nhập */}
            </main>
            <footer className={cx('footer')}>
                <p>© {new Date().getFullYear()} Kho Hàng • Phiếu đề xuất nhập kho</p>
            </footer>
        </div>
    );
};

export default CreateImportReceiptPage;
