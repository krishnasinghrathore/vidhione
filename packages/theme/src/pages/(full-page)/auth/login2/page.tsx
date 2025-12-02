'use client';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React from 'react';

const Login = () => {
    const navigate = useNavigate();
    const navigateToDashboard = () => {
        navigate('/');
    };

    return (
        <>
            <div className="h-screen flex w-full surface-ground">
                <div className="flex flex-1 flex-column surface-ground align-items-center justify-content-center">
                    <div className="w-11 sm:w-30rem">
                        <div className="flex flex-column">
                            <div style={{ height: '56px', width: '56px' }} className="bg-primary-50 border-circle flex align-items-center justify-content-center">
                                <i className="pi pi-sign-in text-primary text-4xl"></i>
                            </div>
                            <div className="mt-4">
                                <h1 className="m-0 text-primary font-semibold text-4xl">Welcome back!</h1>
                                <span className="block text-700 mt-2">Please fill the fields to sign-up Ultima network</span>
                            </div>
                        </div>
                        <div className="flex flex-column gap-3 mt-6">
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"></i>
                                </span>
                                <InputText type="text" v-model="email" placeholder="Email" />
                            </div>
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-key"></i>
                                </span>
                                <InputText type="password" v-model="password" placeholder="Password" />
                            </div>
                            <div>
                                <Button onClick={navigateToDashboard} className="w-full" label="LOGIN"></Button>
                            </div>
                            <div>
                                <Button className="w-full text-primary-500" text label="FORGOT PASSWORD?"></Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        backgroundImage: 'url(/layout/images/pages/accessDenied-bg.jpg)'
                    }}
                    className="hidden lg:flex flex-1 align-items-center justify-content-center bg-cover"
                >
                    <img src="/layout/images/logo/vector_logo.png" alt="" />
                </div>
            </div>
        </>
    );
};

export default Login;
