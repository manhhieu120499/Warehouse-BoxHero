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
import { post } from '../../utils/httpRequest';

const cx = classNames.bind(styles)


const ProfilePage = () => {
    const currentUser = useSelector(state => state.AuthSlice.user)
    const [account, setAccount] = useState({
        email: "", newPassword: '', confirmPassword: '', oldPassword: ''
    })
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showRetypedPassword, setShowRetypedPassword] = useState(false)
    const [showOldPassword, setShowOldPassword] = useState(false)
    const {register, formState: {errors}, handleSubmit, watch, setValue} = useForm();
    const dispatch = useDispatch()

    const newPassword = watch('newPassword')

    const handleShowPassword = () => {
        setShowPassword(prev => !prev)
    }

    const handleShowRetypedPassword = () => {
        setShowRetypedPassword(prev => !prev)
    }

    const handleShowOldPassword = () => {
        setShowOldPassword(prev => !prev)
    }

    const handleShowModalUpdateAccount = (action) => {
        if(action == 'open') {
            setIsOpenModal(prev => !prev)
        }else {
            setIsOpenModal(prev => !prev)
            setAccount(prev => ({...prev, newPassword: '', confirmPassword: '', oldPassword: ''}))
            setValue('newPassword', "")
            setValue('oldPassword', "")
            setValue('confirmPassword', "")
        }
    }

    const onSubmit = async (data) => {
        console.log(data)
        try{
            const {accessToken, employeeID} = JSON.parse(localStorage.getItem('tokenUser'))
            dispatch(startLoading())
            const updateResult = await post("/api/account/change-password", {
                email: account.email,
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            }, accessToken, employeeID)
            //call api
            dispatch(stopLoading())
            handleShowModalUpdateAccount()
            toast.success(updateResult.message, styleMessage)
        }catch(err) {
            console.log(err)
            dispatch(stopLoading())
            toast.error(err.response.data.message[0], styleMessage)
            return;
        }
    }

    useEffect(() => {
        const {accessToken} = JSON.parse(localStorage.getItem('tokenUser'))
        const {email} = jwtDecode(accessToken).payload
        setAccount({email, newPassword: '', confirmPassword: '', oldPassword: ""})
    }, [])

    return (
        <>
            <ModalReadEmployee data={currentUser}/>
            <ViewAccountProfile data={account} onClick={()=>handleShowModalUpdateAccount('open')}/>
            <Modal isOpenInfo={isOpenModal} onClose={handleShowModalUpdateAccount} showButtonClose={false}>
                <form onSubmit={handleSubmit(onSubmit)} className={cx('wrapper-password')}>
                    <div className={cx('form-group')}>
                            <label htmlFor="password">Nhập mật khẩu cũ</label>
                            <div className={cx('form-control')}>
                                <input
                                    id="password"
                                    type={!showOldPassword ? 'password' : 'text'}
                                    placeholder="Nhập mật khẩu cũ"
                                    {...register('oldPassword', {
                                        required: 'Vui lòng nhập mật khẩu',
                                        // pattern: {
                                        //     value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                                        //     message: 'Mật khẩu có cả chữ hoa, chữ thường, số và kí tự đặc biệt',
                                        // },
                                        // minLength: {
                                        //     value: 8,
                                        //     message: 'Mật khẩu có độ dài tối thiểu 8 kí tự',
                                        // },
                                    })}
                                />
                                {showOldPassword && <Eye size={20} className={cx('icon')} onClick={handleShowOldPassword} />}
                                {!showOldPassword && (
                                    <EyeClosed size={20} className={cx('icon')} onClick={handleShowOldPassword} />
                                )}
                            </div>
                            {errors.oldPassword && <p className={cx('message-error')}>{errors.oldPassword.message}</p>}
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="newPassword">Nhập mật khẩu mới</label>
                            <div className={cx('form-control')}>
                                <input
                                    id="newPassword"
                                    type={!showPassword ? 'password' : 'text'}
                                    placeholder="Nhập mật khẩu mới"
                                    {...register('newPassword', {
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
                            <label>Xác nhận mật khẩu mới</label>
                            <div className={cx('form-control')}>
                                <input
                                    id="retypedPassword"
                                    type={!showRetypedPassword ? 'password' : 'text'}
                                    placeholder="Nhập lại mật khẩu"
                                    {...register('confirmPassword', {
                                        required: 'Vui lòng nhập mật khẩu',
                                        validate: (value) => {
                                            return newPassword === value || 'Xác nhận mật khẩu mới không khớp';
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
                              <Button type="button" primary medium borderRadiusSmall onClick={()=>handleShowModalUpdateAccount('close')}>
                                  <span>Huỷ</span>
                              </Button>
                        </div>
                    </form>
            </Modal>
        </>
              
    );
}

export default ProfilePage;
