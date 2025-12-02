'use client';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '../../../graphql/auth';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    companyName: string;
}

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        companyName: ''
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const [registerMutation] = useMutation(REGISTER_MUTATION, {
        onCompleted: (data) => {
            setLoading(false);
            if (data.register) {
                setSuccess('Registration successful! Please check your email for verification instructions.');
                setError('');
                // Clear form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phoneNumber: '',
                    companyName: ''
                });
            }
        },
        onError: (error) => {
            setLoading(false);
            setError(error.message || 'Registration failed. Please try again.');
            setSuccess('');
        }
    });

    const handleInputChange = (field: keyof RegisterFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = (): boolean => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.companyName) {
            setError('Please fill in all required fields.');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            await registerMutation({
                variables: {
                    input: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        password: formData.password,
                        phoneNumber: formData.phoneNumber,
                        companyName: formData.companyName
                    }
                }
            });
        } catch (err) {
            setLoading(false);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="h-screen flex w-full surface-ground">
            <div className="flex flex-1 flex-column surface-ground align-items-center justify-content-center">
                <div className="w-11 sm:w-30rem">
                    <div className="flex flex-column">
                        <div style={{ height: '56px', width: '56px' }} className="bg-primary-50 border-circle flex align-items-center justify-content-center">
                            <i className="pi pi-users text-primary text-4xl"></i>
                        </div>
                        <div className="mt-4">
                            <h1 className="m-0 text-primary font-semibold text-4xl">Join us!</h1>
                            <span className="block text-700 mt-2">Create your Auth Admin account</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4">
                            <Message severity="error" text={error} />
                        </div>
                    )}

                    {success && (
                        <div className="mt-4">
                            <Message severity="success" text={success} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-column gap-3 mt-6">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="p-inputgroup">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-user"></i>
                                    </span>
                                    <InputText
                                        placeholder="First Name *"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="p-inputgroup">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-user"></i>
                                    </span>
                                    <InputText
                                        placeholder="Last Name *"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-building"></i>
                            </span>
                            <InputText
                                placeholder="Company Name *"
                                value={formData.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-at"></i>
                            </span>
                            <InputText
                                placeholder="Email *"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-phone"></i>
                            </span>
                            <InputText
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-key"></i>
                            </span>
                            <Password
                                placeholder="Password *"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="w-full"
                                toggleMask
                                disabled={loading}
                            />
                        </div>

                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-key"></i>
                            </span>
                            <Password
                                placeholder="Confirm Password *"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className="w-full"
                                toggleMask
                                disabled={loading}
                            />
                        </div>

                        <div className="mt-3">
                            <Button
                                type="submit"
                                className="w-full"
                                label={loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                                disabled={loading}
                                loading={loading}
                            />
                        </div>

                        <div className="mt-2">
                            <Link to="/auth/login">
                                <Button className="w-full text-primary-500" text label="BACK TO LOGIN" />
                            </Link>
                        </div>
                    </form>
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
    );
};

export default Register;
