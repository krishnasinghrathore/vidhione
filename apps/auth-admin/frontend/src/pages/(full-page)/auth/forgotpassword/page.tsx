'use client';
import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const navigateToLogin = () => {
        navigate('/auth/login');
    };

    return (
        <div className="h-screen flex flex-column bg-cover" style={{ backgroundImage: "url('/layout/images/pages/forgot-password-bg.jpg')" }}>
            <div className="shadow-2 bg-indigo-500 z-5 p-3 flex justify-content-between flex-row align-items-center">
                <div className="ml-3 flex" onClick={navigateToLogin}>
                    <div>
                        <img className="h-2rem" src="/layout/images/logo/logo2x.png" alt="" />
                    </div>
                </div>
                <div className="mr-3 flex">
                    <Button onClick={navigateToLogin} text className="p-button-plain text-white">
                        LOGIN
                    </Button>
                </div>
            </div>

            <div className="align-self-center mt-auto mb-auto">
                <div className="text-center z-5 flex flex-column border-1 border-round-md surface-border surface-card px-3">
                    <div className="-mt-5 text-white bg-yellow-600 border-round-md mx-auto px-3 py-1 border-1 surface-border">
                        <h2 className="m-0">PASSWORD</h2>
                    </div>

                    <h4>Forgot Password</h4>

                    <div className="text-color-secondary mb-6 px-6">Enter your e-mail to receive a reset link</div>

                    <div className="w-full flex flex-column gap-3 px-3 pb-6">
                        <span className="p-input-icon-left">
                            <i className="pi pi-envelope"></i>
                            <InputText className="w-full" placeholder="E-mail" />
                        </span>
                        <Button onClick={navigateToLogin} className="w-full my-3 px-3" label="SUBMIT"></Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
