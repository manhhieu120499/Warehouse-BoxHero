import React, { Fragment } from "react"
import classNames from "classnames/bind"
import styles from "./InputBase.module.scss"
import { Search } from "lucide-react"

const cx = classNames.bind(styles)

const InputBase = ({ value, placeholder="", onChange, icon = Search }) => {
    const Icon = icon ? icon : Fragment
    return <div className={cx('group-input-search')}>
        <input placeholder={placeholder} value={value} onChange={onChange} />
        <Icon className={cx('icon')} size={20} />
    </div>
}

export default InputBase;