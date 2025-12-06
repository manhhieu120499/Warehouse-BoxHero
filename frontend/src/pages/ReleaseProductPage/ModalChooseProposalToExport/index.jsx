import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalChooseProposalToExport.module.scss';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Modal, Button } from '../../../components';
import { getAllOrderReleaseProposalCanApply, searchOrderReleaseProposal } from '../../../services/proposal.service';
import { convertDateVN } from '../../../common';
import useDebounce from '../../../hooks/useDebounce';
import CreateExportProductDialog from '../CreateExportProductDialog';
import { Pagination } from 'antd';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const columnsDefineSuggestProposal = [
    {
        title: 'Mã phiếu đề xuất',
        key: 'orderReleaseProposalID',
    },
    {
        title: 'Ngày tạo',
        key: 'createdAt',
    },
    {
        title: 'Nhân viên lập phiếu',
        key: 'employeeIDCreate',
    },
    {
        title: 'Hành động',
        key: 'action',
    },
];

const ModalChooseProposalToExport = ({ isOpen, onClose, fetchData }) => {
    const [proposalIDFilter, setProposalIDFilter] = useState('');
    const [listData, setListData] = useState([]);
    const [proposalSelected, setProposalSelected] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const debounceProposalIDFilter = useDebounce(proposalIDFilter, 500);

    const handleFetchOrderReleaseProposal = async () => {
        try {
            const res = await getAllOrderReleaseProposalCanApply();
            setListData(res.length > 0 ? res : []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!debounceProposalIDFilter.trim()) {
            handleFetchOrderReleaseProposal();
            return;
        } else {
            const searchDate = async () => {
                const res = await searchOrderReleaseProposal(debounceProposalIDFilter.trim(), { status: 'COMPLETED' });
                if (res.data.status === 'OK') {
                    setListData(res.data.data || []);
                }
            };

            searchDate();
        }
    }, [debounceProposalIDFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [listData]);

    const handleRefreshData = () => {
        //handleFetchOrderReleaseProposal();
        fetchData();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setProposalIDFilter('');
            return;
        } else handleFetchOrderReleaseProposal();
    }, [isOpen]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper')}>
                <div className={cx('wrapper-filter')}>
                    <div className={cx('form-group')}>
                        <label htmlFor={proposalIDFilter}>Mã phiếu đề xuất</label>
                        <input
                            type="text"
                            id="proposalID"
                            className={cx('form-input')}
                            placeholder={`Nhập mã phiếu đề xuất`}
                            value={proposalIDFilter}
                            onChange={(e) => setProposalIDFilter(e.target.value)}
                        />
                    </div>
                </div>
                <div className={cx('wrapper-table')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th className={cx('stt')}>STT</th>
                                {columnsDefineSuggestProposal.map((col) => (
                                    <th key={col.key} className={cx(col.key)}>
                                        {col.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {listData?.slice((currentPage - 1) * 5, currentPage * 5).map((data, index) => (
                                <tr key={index}>
                                    <td>{(currentPage - 1) * 5 + index + 1}</td>
                                    <td>
                                        <p>{data.orderReleaseProposalID}</p>
                                    </td>
                                    <td>
                                        <p>{convertDateVN(data.createdAt)}</p>
                                    </td>
                                    <td>
                                        <p>{data.creator.employeeName}</p>
                                    </td>
                                    <td>
                                        <div className={cxGlobal('action-table')}>
                                            <Button success medium onClick={() => setProposalSelected(data)}>
                                                <span>Xuất hàng</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {listData.length > 5 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                        <Pagination
                            defaultCurrent={1}
                            current={currentPage}
                            total={listData.length}
                            pageSize={5}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>

            {proposalSelected && (
                <CreateExportProductDialog
                    isOpen={!!proposalSelected}
                    onClose={() => setProposalSelected(null)}
                    proposalRelease={proposalSelected}
                    fetchData={handleRefreshData}
                />
            )}
        </Modal>
    );
};

export default ModalChooseProposalToExport;
