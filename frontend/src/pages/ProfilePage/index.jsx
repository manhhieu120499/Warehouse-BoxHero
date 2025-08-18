import React from 'react';
import { ModalEmployee, Button } from '@/components';
import { useSelector } from 'react-redux';


const ProfilePage = () => {
    const currentUser = useSelector(state => state.AuthSlice.user)
    console.log(currentUser)

    return (
            <ModalEmployee isAdmin={false} data={currentUser} profile={true}/>  
    );
}

export default ProfilePage;
