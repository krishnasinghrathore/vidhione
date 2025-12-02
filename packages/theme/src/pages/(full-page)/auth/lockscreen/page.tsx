'use client';
import React from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';

const LockScreen = () => {
    const navigate = useNavigate();
    const navigateToDashboard = () => {
        navigate('/');
    };
    return (
        <div className="h-screen flex flex-column bg-cover" style={{ backgroundImage: "url('/layout/images/pages/lockscreen-bg.jpg')" }}>
            <div className="shadow-2 bg-indigo-500 z-5 p-3 flex justify-content-between flex-row align-items-center">
                <div className="ml-3 flex" onClick={navigateToDashboard}>
                    <div>
                        <img className="h-2rem" src="/layout/images/logo/logo2x.png" alt="" />
                    </div>
                </div>
                <div className="mr-3 flex">
                    <Button onClick={navigateToDashboard} text className="p-button-plain text-white">
                        DASHBOARD
                    </Button>
                </div>
            </div>

            <div className="align-self-center mt-auto mb-auto">
                <div className="text-center z-5 flex flex-column border-1 border-round-md surface-border surface-card px-3">
                    <div className="-mt-5 text-white bg-teal-600 border-round-md mx-auto px-3 py-1 border-1 surface-border">
                        <h2 className="m-0">AUTHENTICATION</h2>
                    </div>
                    <div className="p-2">
                        <Avatar image={'/demo/images/avatar/amyelsner.png'} size="xlarge" shape="circle"></Avatar>
                    </div>
                    <h4>Amy Elsner</h4>
                    <div className="text-color-secondary mb-6 px-6">Please enter your password</div>

                    <div className="w-full flex flex-column gap-3 px-3 pb-6">
                        <span className="p-input-icon-left">
                            <i className="pi pi-key"></i>
                            <InputText type="password" className="w-full" placeholder="Password" />
                        </span>
                        <Button onClick={navigateToDashboard} className="w-full my-3 px-3" label="UNLOCK"></Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockScreen;
