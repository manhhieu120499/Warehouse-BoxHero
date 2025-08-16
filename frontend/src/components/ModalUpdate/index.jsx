import React from 'react';
import classNames from 'classnames/bind';
import styles from './ModalUpdate.module.scss';
import { Modal, Button } from '@/components';
const cx = classNames.bind(styles);

const ModalUpdate = ({ onClose, columns, label, onSubmit }) => {
    return (
        <div className={cx('modal-content')}>
            <h2 className={cx('modal-title')}>{label}</h2>
            <form className={cx('modal-form')}>
                {
                    columns.map((item) => (
                        <div className={cx('form-group')} key={item.id}>
                            <label htmlFor={item.id}>{item.label}</label>
                            <input
                                type="text"
                                id={item.id}
                                className={cx('form-input')}
                                placeholder={`Nhập ${item.label}`}
                                value={item.value}
                                onChange={(e) => item.setValue(e.target.value)}
                            />
                        </div>
                    ))
                }
                <div className={cx('form-actions')}>
                    <Button primary type="submit" className={cx('btn-submit')} onClick={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}>
                        Cập nhật
                    </Button>
                    <Button primary type="button" className={cx('btn-cancel')} onClick={onClose}>
                        Hủy
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ModalUpdate;
