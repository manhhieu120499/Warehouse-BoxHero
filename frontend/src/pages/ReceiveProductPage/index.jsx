import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductPage.module.scss';
import { MyTable, Button } from '../../components';
import { generateCode } from '../../utils/generate';

const cx = classNames.bind(styles);

const ReceiveProductPage = () => {
    const [creator, setCreator] = useState('');
    const [approver, setApprover] = useState('');
    const [publishedDate, setPublishedDate] = useState(new Date().toISOString().slice(0, 10));
    const [code, setCode] = useState('');
    const [reason, setReason] = useState('');
    const [productListImport, setProductListImport] = useState([]);
    const [warehouse, setWarehouse] = useState('');
    const [option, setOption] = useState({
        nonSuggest: true,
        suggest: false,
    });

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
        },
        {
            title: 'Người duyệt',
            dataIndex: 'approverName',
            key: 'approverName',
        },
        {
            title: 'Tên Kho',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
    ];

    const datasource = [
        {
            key: 1,
            proposalID: 'PDX-1E3W4D',
            employeeNameCreate: 'Nguyễn Văn Tâm',
            approverName: 'Quản lý kho',
            warehouseName: 'Kho Thủ Đức',
            createdAt: '2020-12-12',
            status: 'Đã phê duyệt',
        },
    ];

    const rowSelection = {
        type: 'radio',
        onChange: () => {},
    };

    return (
        <div className={cx('wrapper-receive-product')}>
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
                <h2>Danh sách phiếu đề xuất nhập</h2>
                <MyTable className={cx('table-proposal')} columns={columnsProposal} data={datasource} />
            </section>

            <main className={cx('container-receive-product')}>
                <header className={cx('header')}>
                    <div className={cx('headerLeft')}>
                        <h1 className={cx('title')}>Phiếu đề xuất nhập kho</h1>
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
                            <input placeholder="Nguyễn Văn A" value={creator.empName} readOnly />
                        </div>
                        <div className={cx('field')}>
                            <label>Người duyệt</label>
                            <input value={approver.empName} readOnly />
                        </div>
                        <div className={cx('field')}>
                            <label>Mã phiếu đề xuất</label>
                            <input value={''} readOnly />
                        </div>
                        <div className={cx('field', 'colSpan3')}>
                            <label>Lý do nhập</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                value={reason}
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
                                <th>Số thùng yêu cầu</th>
                                <th>Số thùng thực tế</th>
                                <th>Số thùng lỗi</th>
                                <th>Vị trí lưu trữ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>
                                    <input type="text" placeholder="Nhập mã lô" />
                                </td>
                                <td>
                                    <input type="text" placeholder="Nhập mã sản phẩm" />
                                </td>
                                <td>
                                    <input type="text" placeholder="Nhập tên sản phẩm" />
                                </td>
                                <td>
                                    <input type="text" placeholder="Nhập đơn vị tính" />
                                </td>
                                <td>
                                    <input type="number" placeholder="Nhập số thùng" />
                                </td>
                                <td>
                                    <input type="number" placeholder="Nhập số thùng" />
                                </td>
                                <td>
                                    <input type="number" placeholder="Nhập số thùng" />
                                </td>
                                <td>
                                    <input type="text" placeholder="Vị trí lưu trữ" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </main>
            <footer className={cx('footer')}>
                <p>© {new Date().getFullYear()} Kho Hàng • Phiếu đề xuất nhập kho</p>
            </footer>
        </div>
    );
};

export default ReceiveProductPage;
