'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const navigateToDashboard = () => {
        navigate('/');
    };

    return (
        <div className="h-screen flex flex-column bg-cover" style={{ backgroundImage: 'url(/layout/images/pages/login-bg.jpg)' }}>
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
                    <div className="-mt-5 text-white bg-cyan-700 border-round-md mx-auto px-3 py-1 border-1 surface-border">
                        <h2 className="m-0">LOGIN</h2>
                    </div>

                    <h4>Welcome</h4>

                    <div className="text-color-secondary mb-6 px-6">Please use the form to sign-in Ultima network</div>

                    <div className="w-full flex flex-column gap-3 px-3 pb-6">
                        <span className="p-input-icon-left">
                            <i className="pi pi-envelope"></i>
                            <InputText className="w-full" placeholder="E-mail" />
                        </span>

                        <span className="p-input-icon-left">
                            <i className="pi pi-key"></i>
                            <InputText type="password" className="w-full" placeholder="Password" />
                        </span>
                        <Button onClick={navigateToDashboard} className="w-full my-3 px-3" label="LOGIN"></Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
