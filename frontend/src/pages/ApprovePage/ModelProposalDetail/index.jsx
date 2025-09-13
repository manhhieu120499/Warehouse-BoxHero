import { Modal } from '../../../components';
import GoodsReceiptRequest from '../../ProposalPage/GoodsReceiptRequest';

const ModelProposalDetail = ({ isOpen, onClose }) => {
    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <GoodsReceiptRequest />
        </Modal>
    );
};

export default ModelProposalDetail;
