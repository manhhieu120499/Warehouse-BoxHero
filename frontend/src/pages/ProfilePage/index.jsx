import React from 'react';
import { ModalEmployee, Button } from '@/components';
import { useSelector } from 'react-redux';


const ProfilePage = () => {
    const currentUser = useSelector(state => state.AuthSlice.user)

    return (
            <ModalEmployee isAdmin={false} data={currentUser} profile={true}/>  
    );
}

export default ProfilePage;
