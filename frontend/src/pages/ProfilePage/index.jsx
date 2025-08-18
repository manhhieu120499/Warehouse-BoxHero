import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalReadEmployee, ViewAccountProfile } from '../../components';
import {jwtDecode} from 'jwt-decode'
import classNames from 'classnames/bind';
import styles from "./ProfilePage.module.scss"
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import {startLoading, stopLoading} from "../../lib/redux/loading/slice"
import { Eye, EyeClosed } from 'lucide-react';

const cx = classNames.bind(styles)


const ProfilePage = () => {
    const currentUser = useSelector(state => state.AuthSlice.user)
    const [account, setAccount] = useState({
        email: "", password: ''
    })
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showRetypedPassword, setShowRetypedPassword] = useState(false)
    const {register, formState: {errors}, handleSubmit, watch} = useForm();
    const dispatch = useDispatch()

    const password = watch('password')

    const handleShowPassword = () => {
        setShowPassword(prev => !prev)
    }

    const handleShowRetypedPassword = () =>[
        setShowRetypedPassword(prev => !prev)
    ]

    const handleShowModalUpdateAccount = () => {
        setIsOpenModal(prev => !prev)
    }

    const onSubmit = async (data) => {
        console.log(data)
        try{
            dispatch(startLoading())
            //call api
            dispatch(stopLoading())
            toast.success('Cập nhật mật khẩu thành công')
        }catch(err) {
            dispatch(stopLoading())
            toast.error(err.response.data.message, styleMessage)
            return;
        }
    }

    useEffect(() => {
        const {accessToken} = JSON.parse(localStorage.getItem('tokenUser'))
        const {email} = jwtDecode(accessToken).payload
        setAccount({email, password: ''})
    }, [])

    return (
        <>
            <ModalReadEmployee data={currentUser}/>
            <ViewAccountProfile data={account} onClick={handleShowModalUpdateAccount}/>
            <Modal isOpenInfo={isOpenModal} onClose={handleShowModalUpdateAccount} showButtonClose={false}>
                <form onSubmit={handleSubmit(onSubmit)} className={cx('wrapper-password')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="password">Nhập mật khẩu mới</label>
                            <div className={cx('form-control')}>
                                <input
                                    id="password"
                                    type={!showPassword ? 'password' : 'text'}
                                    placeholder="Nhập mật khẩu"
                                    {...register('password', {
                                        required: 'Vui lòng nhập mật khẩu',
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                                            message: 'Mật khẩu có cả chữ hoa, chữ thường, số và kí tự đặc biệt',
                                        },
                                        minLength: {
                                            value: 8,
                                            message: 'Mật khẩu có độ dài tối thiểu 8 kí tự',
                                        },
                                    })}
                                />
                                {showPassword && <Eye size={20} className={cx('icon')} onClick={handleShowPassword} />}
                                {!showPassword && (
                                    <EyeClosed size={20} className={cx('icon')} onClick={handleShowPassword} />
                                )}
                            </div>
                            {errors.password && <p className={cx('message-error')}>{errors.password.message}</p>}
                        </div>
                        <div className={cx('form-group')}>
                            <label>Xác nhận mật khẩu</label>
                            <div className={cx('form-control')}>
                                <input
                                    id="retypedPassword"
                                    type={!showRetypedPassword ? 'password' : 'text'}
                                    placeholder="Nhập lại mật khẩu"
                                    {...register('retypedPassword', {
                                        required: 'Vui lòng nhập mật khẩu',
                                        validate: (value) => {
                                            return password === value || 'Xác nhận mật khẩu không khớp';
                                        },
                                    })}
                                />
                                {showRetypedPassword && (
                                    <Eye size={20} className={cx('icon')} onClick={handleShowRetypedPassword} />
                                )}
                                {!showRetypedPassword && (
                                    <EyeClosed size={20} className={cx('icon')} onClick={handleShowRetypedPassword} />
                                )}
                            </div>
                            {errors.retypedPassword && (
                                <p className={cx('message-error')}>{errors.retypedPassword.message}</p>
                            )}
                        </div>
                        <div className={cx('footer-action')}>
                            <Button type="submit" primary medium borderRadiusSmall>
                                  <span>Lưu</span>
                              </Button>
                              <Button type="button" primary medium borderRadiusSmall onClick={handleShowModalUpdateAccount}>
                                  <span>Huỷ</span>
                              </Button>
                        </div>
                    </form>
            </Modal>
        </>
              
    );
}

export default ProfilePage;
