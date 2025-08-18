import React from 'react';
import { useSelector } from 'react-redux';
import { ModalReadEmployee } from '../../components';


const ProfilePage = () => {
    const currentUser = useSelector(state => state.AuthSlice.user)
    console.log(currentUser)

    return (
            <ModalReadEmployee data={currentUser}/>  
    );
}

export default ProfilePage;
