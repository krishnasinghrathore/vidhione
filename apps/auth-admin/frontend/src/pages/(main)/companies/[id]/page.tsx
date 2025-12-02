'use client';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface BusinessNature {
    id: string;
    name: string;
}

interface City {
    id: string;
    name: string;
}

interface State {
    id: string;
    name: string;
}

interface Country {
    id: string;
    name: string;
}

function CompanyForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [company, setCompany] = useState({
        name: '',
        businessNatureId: '',
        address: '',
        cityId: '',
        stateId: '',
        countryId: '',
        zipCode: '',
        phone: '',
        mobile: '',
        email: '',
        altPhone: '',
        altEmail: '',
        website: '',
        isActive: true
    });

    const [businessNatures, setBusinessNatures] = useState<BusinessNature[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);

    const [selectedBusinessNature, setSelectedBusinessNature] = useState<BusinessNature | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedState, setSelectedState] = useState<State | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    // Mock data
    useEffect(() => {
        const mockBusinessNatures: BusinessNature[] = [
            { id: '1', name: 'Technology' },
            { id: '2', name: 'Manufacturing' },
            { id: '3', name: 'Services' }
        ];

        const mockCities: City[] = [
            { id: '1', name: 'New York' },
            { id: '2', name: 'Los Angeles' },
            { id: '3', name: 'Chicago' }
        ];

        const mockStates: State[] = [
            { id: '1', name: 'New York' },
            { id: '2', name: 'California' },
            { id: '3', name: 'Illinois' }
        ];

        const mockCountries: Country[] = [
            { id: '1', name: 'United States' },
            { id: '2', name: 'Canada' },
            { id: '3', name: 'United Kingdom' }
        ];

        setBusinessNatures(mockBusinessNatures);
        setCities(mockCities);
        setStates(mockStates);
        setCountries(mockCountries);

        // Mock company data if editing
        if (isEdit) {
            setCompany({
                name: 'Tech Corp',
                businessNatureId: '1',
                address: '123 Main St',
                cityId: '1',
                stateId: '1',
                countryId: '1',
                zipCode: '10001',
                phone: '+1-555-0123',
                mobile: '+1-555-0124',
                email: 'contact@techcorp.com',
                altPhone: '+1-555-0125',
                altEmail: 'support@techcorp.com',
                website: 'https://techcorp.com',
                isActive: true
            });
            setSelectedBusinessNature(mockBusinessNatures[0]);
            setSelectedCity(mockCities[0]);
            setSelectedState(mockStates[0]);
            setSelectedCountry(mockCountries[0]);
        }
    }, [isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Mock save operation
            console.log('Saving company:', company);
            navigate('/companies/list');
        } catch (error) {
            console.error('Error saving company:', error);
        }
    };

    return (
        <div className="card">
            <div className="flex justify-content-between align-items-center mb-4">
                <span className="text-900 text-xl font-bold">{isEdit ? 'Edit Company' : 'Create Company'}</span>
                <Button label="Back to List" icon="pi pi-arrow-left" className="p-button-secondary" onClick={() => navigate('/companies/list')} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid">
                    <div className="col-12 lg:col-2">
                        <div className="text-900 font-medium text-xl mb-3">Company Details</div>
                        <p className="m-0 p-0 text-600 line-height-3 mr-3">{isEdit ? 'Update company information.' : 'Create a new company profile.'}</p>
                    </div>
                    <div className="col-12 lg:col-10">
                        <div className="grid formgrid p-fluid">
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="name" className="font-medium text-900">
                                    Company Name *
                                </label>
                                <InputText id="name" type="text" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="businessNature" className="font-medium text-900">
                                    Business Nature *
                                </label>
                                <Dropdown
                                    id="businessNature"
                                    options={businessNatures}
                                    value={selectedBusinessNature}
                                    onChange={(e) => {
                                        setSelectedBusinessNature(e.value);
                                        setCompany({ ...company, businessNatureId: e.value?.id || '' });
                                    }}
                                    optionLabel="name"
                                    placeholder="Select Business Nature"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12">
                                <label htmlFor="address" className="font-medium text-900">
                                    Address *
                                </label>
                                <InputTextarea id="address" rows={3} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="country" className="font-medium text-900">
                                    Country *
                                </label>
                                <Dropdown
                                    id="country"
                                    options={countries}
                                    value={selectedCountry}
                                    onChange={(e) => {
                                        setSelectedCountry(e.value);
                                        setCompany({ ...company, countryId: e.value?.id || '' });
                                    }}
                                    optionLabel="name"
                                    placeholder="Select Country"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="state" className="font-medium text-900">
                                    State *
                                </label>
                                <Dropdown
                                    id="state"
                                    options={states}
                                    value={selectedState}
                                    onChange={(e) => {
                                        setSelectedState(e.value);
                                        setCompany({ ...company, stateId: e.value?.id || '' });
                                    }}
                                    optionLabel="name"
                                    placeholder="Select State"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="city" className="font-medium text-900">
                                    City *
                                </label>
                                <Dropdown
                                    id="city"
                                    options={cities}
                                    value={selectedCity}
                                    onChange={(e) => {
                                        setSelectedCity(e.value);
                                        setCompany({ ...company, cityId: e.value?.id || '' });
                                    }}
                                    optionLabel="name"
                                    placeholder="Select City"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="zipCode" className="font-medium text-900">
                                    ZIP Code *
                                </label>
                                <InputText id="zipCode" type="text" value={company.zipCode} onChange={(e) => setCompany({ ...company, zipCode: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="phone" className="font-medium text-900">
                                    Phone *
                                </label>
                                <InputText id="phone" type="tel" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="mobile" className="font-medium text-900">
                                    Mobile
                                </label>
                                <InputText id="mobile" type="tel" value={company.mobile} onChange={(e) => setCompany({ ...company, mobile: e.target.value })} />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="email" className="font-medium text-900">
                                    Email *
                                </label>
                                <InputText id="email" type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="altEmail" className="font-medium text-900">
                                    Alternative Email
                                </label>
                                <InputText id="altEmail" type="email" value={company.altEmail} onChange={(e) => setCompany({ ...company, altEmail: e.target.value })} />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="altPhone" className="font-medium text-900">
                                    Alternative Phone
                                </label>
                                <InputText id="altPhone" type="tel" value={company.altPhone} onChange={(e) => setCompany({ ...company, altPhone: e.target.value })} />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="website" className="font-medium text-900">
                                    Website
                                </label>
                                <InputText id="website" type="url" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
                            </div>
                            <div className="field mb-4 col-12">
                                <div className="flex align-items-center">
                                    <Checkbox id="isActive" checked={company.isActive} onChange={(e) => setCompany({ ...company, isActive: e.checked || false })} />
                                    <label htmlFor="isActive" className="ml-2 font-medium text-900">
                                        Active Company
                                    </label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="flex gap-2">
                                    <Button type="submit" label={isEdit ? 'Update Company' : 'Create Company'} className="w-auto" />
                                    <Button type="button" label="Cancel" className="p-button-secondary w-auto" onClick={() => navigate('/companies/list')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CompanyForm;
