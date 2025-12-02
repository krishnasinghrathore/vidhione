'use client';
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../../../graphql/auth';

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const [loginMutation] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            setLoading(false);
            if (data.login) {
                // Store authentication data
                localStorage.setItem('authToken', data.login.token);
                localStorage.setItem('refreshToken', data.login.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.login.user));

                // Navigate to dashboard
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            setLoading(false);
            setError(error.message || 'Login failed. Please try again.');
        }
    });

    const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        try {
            await loginMutation({
                variables: {
                    input: {
                        email: formData.email,
                        password: formData.password,
                        rememberMe: formData.rememberMe
                    }
                }
            });
        } catch (err) {
            setLoading(false);
            setError('An unexpected error occurred. Please try again.');
        }
    };

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

                    <h4>Welcome Back</h4>

                    <div className="text-color-secondary mb-6 px-6">Please sign in to your Auth Admin account</div>

                    {error && (
                        <div className="mb-4 px-3">
                            <Message severity="error" text={error} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full flex flex-column gap-3 px-3 pb-6">
                        <span className="p-input-icon-left">
                            <i className="pi pi-envelope"></i>
                            <InputText
                                className="w-full"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={loading}
                            />
                        </span>

                        <span className="p-input-icon-left">
                            <i className="pi pi-key"></i>
                            <Password
                                className="w-full"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                feedback={false}
                                disabled={loading}
                            />
                        </span>

                        <div className="flex justify-content-between align-items-center mb-3">
                            <div className="flex align-items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                    className="mr-2"
                                />
                                <label htmlFor="rememberMe" className="text-sm">Remember me</label>
                            </div>
                            <Link to="/auth/forgotpassword" className="text-primary text-sm">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full my-3 px-3"
                            label={loading ? "SIGNING IN..." : "SIGN IN"}
                            disabled={loading}
                            loading={loading}
                        />

                        <div className="text-center mt-3">
                            <span className="text-sm text-color-secondary">Don't have an account? </span>
                            <Link to="/auth/register" className="text-primary text-sm">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
