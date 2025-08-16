import React from 'react';
import classNames from 'classnames/bind';
import styles from './ChatBox.module.scss';
import { X as XClosed } from 'lucide-react';
import { Input } from '@/components';

const cx = classNames.bind(styles);

const ChatBox = ({ classnames, isOpen, closed }) => {
    const handleSubMitInpt = (value) => {
        console.log('Submit input');
        console.log('value:', value);

        // Logic for submitting input
    };

    return (
        <div
            className={cx('chat-box', {
                [classnames]: isOpen,
            })}
        >
            <div className={cx('header-chat-box')}>
                <h1 className={cx('header-title')}>Trợ lý thông minh</h1>
                <button className={cx('btn-close-chat')} onClick={closed}>
                    <XClosed size={20} />
                </button>
            </div>
            <div className={cx('content-chat-box')}>Nội dung</div>
            <div className={cx('wrapper-input')}>
                <Input borderRadius={18} onSubmit={handleSubMitInpt} />
            </div>
        </div>
    );
};

export default React.memo(ChatBox);
