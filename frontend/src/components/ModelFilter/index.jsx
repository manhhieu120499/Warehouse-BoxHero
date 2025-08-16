import { useEffect, useRef, useState } from "react";
import classNames from 'classnames/bind';
import styles from './ModelFilter.module.scss';
import { MyTable, Button, Popper, Modal, ModalOrder } from '@/components';

const cx = classNames.bind(styles);

const ModelFilter = ({handleSubmitFilter, handleResetFilters, columns, children}) => {
    const [lastScrollY, setLastScrollY] = useState(0);
    const contentRef = useRef();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                // Cuộn xuống
                const height = contentRef.current.clientHeight;
                const heightCurrent = height - currentScrollY;

                if(heightCurrent > 0) {
                    contentRef.current.style.transform = `translateY(-${currentScrollY}px)`;
                    contentRef.current.style.transition = `transform 0.1s linear`;
                } else {
                    contentRef.current.style.transition = `transform 0.1s linear`;
                    contentRef.current.style.transform = `translateY(-100%)`;
                }
            } else {
                // Cuộn lên
                contentRef.current.style.transition = `transform 0.3s ease-in-out`;
                contentRef.current.style.transform = `translateY(0)`;
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);
    return (
        <Popper className={cx('popper')} ref={contentRef}>
            <div className={cx("wrapper-filter")}>
                {columns.map(item => (
                    <div className={cx('form-group')} key={item.id}>
                        <label htmlFor={item.id}>{item.label}</label>
                        <input type="text" id={item.id} className={cx('form-input')} placeholder={`Nhâp ${item.label}`} value={item.value} onChange={(e) => item.setValue(e.target.value)} />
                    </div>
                ))}
            </div>
            <div className={cx('wrapper-action')}>
                {children}
                <Button primary className={cx('btn-filter')} onClick={handleSubmitFilter}>
                    Tìm kiếm
                </Button>
                <Button primary className={cx('btn-reset')} onClick={handleResetFilters}>
                    Đặt lại
                </Button>
            </div>
        </Popper>
    );
}

export default ModelFilter;