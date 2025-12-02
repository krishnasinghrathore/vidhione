'use client';
import React, { useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import type { Page } from '@/types';

const Verification: Page = () => {
    const [value1, setValue1] = useState<number | null>();
    const [value2, setValue2] = useState<number | null>();
    const [value3, setValue3] = useState<number | null>();
    const [value4, setValue4] = useState<number | null>();

    const onDigitInput = (event: React.KeyboardEvent<HTMLSpanElement>, currentInputId: number) => {
        const isDigit = event.code.includes('Numpad') || event.code.includes('Digit');
        const isBackspace = event.code === 'Backspace';
        let nextInputId: number | null = null;

        if (isDigit) {
            nextInputId = currentInputId + 1;
        } else if (isBackspace) {
            nextInputId = currentInputId - 1;
        }

        const element = nextInputId !== null ? document.getElementById('val' + nextInputId) : null;

        if (element) {
            element.focus();
        }
    };

    return (
        <>
            <div className="h-screen flex w-full surface-ground">
                <div className="flex flex-1 flex-column surface-ground align-items-center justify-content-center">
                    <div className="w-11 sm:w-30rem">
                        <div className="flex flex-column">
                            <div style={{ height: '56px', width: '56px' }} className="bg-primary-50 border-circle flex align-items-center justify-content-center">
                                <i className="pi pi-check-circle text-primary text-4xl"></i>
                            </div>
                            <div className="mt-4">
                                <h1 className="m-0 text-primary font-semibold text-4xl">Authentication?</h1>
                                <span className="block text-700 mt-2">Verify your code</span>
                            </div>
                        </div>
                        <div className="flex gap-3 align-items-center mt-6 p-fluid">
                            <InputNumber id="input1" inputId="val1" value={value1} onValueChange={(e) => setValue1(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 1)}></InputNumber>
                            <InputNumber id="input2" inputId="val2" value={value2} onValueChange={(e) => setValue2(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 2)}></InputNumber>
                            <InputNumber id="input3" inputId="val3" value={value3} onValueChange={(e) => setValue3(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 3)}></InputNumber>
                            <InputNumber id="input4" inputId="val4" value={value4} onValueChange={(e) => setValue4(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 4)}></InputNumber>
                        </div>
                        <div className="mt-3">
                            <Button className="w-full" label="VERIFY NOW"></Button>
                        </div>
                        <div className="mt-3">
                            <Button className="w-full text-primary-500" text label="SEND AGAIN"></Button>
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

export default Verification;
