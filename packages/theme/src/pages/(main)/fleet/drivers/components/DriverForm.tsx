import React, { useEffect, useRef, useState } from 'react';
import DocumentUploader from '../../../../../components/documents/DocumentUploader';
import type { DocumentUploaderHandle } from '../../../../../components/documents/DocumentUploader';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputMask } from 'primereact/inputmask';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateDriverDocument, UpdateDriverDocument, DriverDocument } from '../../../../../graphql/drivers/operations.generated';
import { uploadAttachment } from '../../../../../lib/upload';
import { DriverCreateSchema, DriverUpdateSchema } from '../../../../../validation/driver';
import { zodErrorToRecord } from '../../../../../validation/utils';
import { getGraphQLErrorMessage } from '../../../../../lib/errors';
import { listAttachments, getAttachmentContent, deleteAttachment, type AttachmentListItem } from '../../../../../lib/attachments';
import { useSystemConfig } from '../../../../../lib/systemConfig';

type DriverFormProps = { id?: string };

type Endorsements = {
    hazardousMaterials: boolean;
    tankVehicles: boolean;
    passenger: boolean;
    schoolBus: boolean;
    doubleTripleTrailers: boolean;
    hazmatTank: boolean;
};

type DriverVM = {
    driverId: string;
    fullName: string;
    dateOfBirth: Date | null;
    status: 'active' | 'inactive' | 'on_leave';
    phoneNumber: string;
    emailAddress: string;
    address: string;
    licenseNumber: string;
    licenseState: string;
    licenseExpires: Date | null;
    socialSecurityNumber: string;
    cdlClass: string;
    medicalCardExpires: Date | null;
    cdlEndorsements: Endorsements;
    twicCardNumber: string;
    twicCardExpiration: Date | null;
    hireDate: Date | null;
    notes: string;
    driversLicenseFront: File | null;
    driversLicenseBack: File | null;
    medicalCard: File | null;
    twicCard: File | null;
    i9Form: File | null;
};

export default function DriverForm(props: DriverFormProps) {
    const navigate = useNavigate();
    const routeParams = useParams();
    const recordId = (props.id ?? (routeParams.id as string | undefined)) || undefined;
    const isEdit = !!recordId;
    const toast = useRef<Toast>(null);

    const driverIdRef = useRef<HTMLInputElement>(null);
    const fullNameRef = useRef<HTMLInputElement>(null);
    const statusRef = useRef<any>(null);
    const dobRef = useRef<any>(null);
    const docUploaderRef = useRef<DocumentUploaderHandle>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'info' | 'warn'; text: string } | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Documents mandatory validation coming from DocumentUploader
    const [docsOk, setDocsOk] = useState(true);
    const [missingDocNames, setMissingDocNames] = useState<string[]>([]);
    // Dirty flags
    const [docDirty, setDocDirty] = useState(false); // from DocumentUploader
    // Use a comparable snapshot shape (not DriverVM) to track initial state for enabling Save only after edits
    const [initialSnapshot, setInitialSnapshot] = useState<any>(null); // snapshot of form on load

    const [attachmentsList, setAttachmentsList] = useState<AttachmentListItem[]>([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState<Record<string, string>>({});
    const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
    const [stagedUploads, setStagedUploads] = useState<{ docType: string; file: File }[]>([]);
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<AttachmentListItem | null>(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');
    const [previewType, setPreviewType] = useState<string | undefined>(undefined);
    const [existingSsnLast4, setExistingSsnLast4] = useState<string | null>(null);
    const [showSsn, setShowSsn] = useState(false);

    const uploadDriverDocs = async (ownerId: string) => {
        const tasks: Promise<any>[] = [];
        const push = (file: File | null, docType: string) => {
            if (file) {
                tasks.push(uploadAttachment({ ownerType: 'driver', ownerId, docType: docType as any, file }));
            }
        };
        push(driver.driversLicenseFront, 'drivers_license_front');
        push(driver.driversLicenseBack, 'drivers_license_back');
        push(driver.medicalCard, 'medical_card');
        push(driver.twicCard, 'twic_card');
        push(driver.i9Form, 'i9_form');
        for (const s of stagedUploads) push(s.file, s.docType);
        if (tasks.length === 0) return;
        const results = await Promise.allSettled(tasks);
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        const fail = results.length - ok;
        if (ok > 0) toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `Uploaded ${ok} document(s)`, life: 1500 });
        if (fail > 0) toast.current?.show({ severity: 'warn', summary: 'Upload issues', detail: `${fail} upload(s) failed`, life: 2500 });
    };

    const normalizeApiStatus = (s?: string | null): 'active' | 'inactive' | 'on_leave' => {
        if (!s) return 'active';
        const v = String(s).trim().toLowerCase().replace(/\s+/g, '_');
        if (v === 'inactive') return 'inactive';
        if (v === 'on_leave') return 'on_leave';
        return 'active';
    };

    const [createDriver] = useMutation(CreateDriverDocument);
    const [updateDriver] = useMutation(UpdateDriverDocument);

    // Global system config (min driver age)
    const { minDriverAge } = useSystemConfig();

    // UUID helper (guard fallback attachment lookup to avoid server 500s when code is not a UUID)
    const isUuid = (s?: string | null) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

    // Demo-only local cache for full SSN (no auth/session). Stored in localStorage on this device.
    function ssnLocalKey(dbId?: string | null, code?: string | null): string {
        const key = String(dbId || code || '').trim() || 'unknown';
        return `driver:ssn:${key}`;
    }
    function loadLocalSsn(dbId?: string | null, code?: string | null): string | null {
        try {
            const v = localStorage.getItem(ssnLocalKey(dbId, code)) || '';
            const digits = v.replace(/\D/g, '');
            return /^\d{9}$/.test(digits) ? digits : null;
        } catch {
            return null;
        }
    }
    function saveLocalSsn(dbId?: string | null, code?: string | null, ssn?: string | null): void {
        try {
            const digits = String(ssn ?? '').replace(/\D/g, '');
            if (/^\d{9}$/.test(digits)) {
                localStorage.setItem(ssnLocalKey(dbId, code), digits);
            }
        } catch {
            // ignore storage errors
        }
    }

    // Normalize phone values coming from API or user input to unmasked digits (last 10 for US format)
    const toDigits = (s?: string | null) => String(s ?? '').replace(/\D+/g, '');
    const normalizePhone = (s?: string | null) => {
        const d = toDigits(s);
        return d.length >= 10 ? d.slice(-10) : d;
    };

    const { data: driverData, loading: driverLoading } = useQuery(DriverDocument, {
        variables: { id: recordId as string },
        skip: !isEdit || !recordId
    });

    const [driver, setDriver] = useState<DriverVM>({
        driverId: '',
        fullName: '',
        dateOfBirth: null,
        status: 'active',
        phoneNumber: '',
        emailAddress: '',
        address: '',
        licenseNumber: '',
        licenseState: '',
        licenseExpires: null,
        socialSecurityNumber: '',
        cdlClass: '',
        medicalCardExpires: null,
        cdlEndorsements: {
            hazardousMaterials: false,
            tankVehicles: false,
            passenger: false,
            schoolBus: false,
            doubleTripleTrailers: false,
            hazmatTank: false
        },
        twicCardNumber: '',
        twicCardExpiration: null,
        hireDate: null,
        notes: '',
        driversLicenseFront: null,
        driversLicenseBack: null,
        medicalCard: null,
        twicCard: null,
        i9Form: null
    });

    const [prefilled, setPrefilled] = useState(false);
    const [phoneMaskKey, setPhoneMaskKey] = useState(0);
    const [ssnMaskKey, setSsnMaskKey] = useState(0);

    // SSN helpers for masked display and visibility toggle
    const maskSsnLast4 = (last4?: string | null) => (last4 ? `XXX-XX-${String(last4).padStart(4, 'X')}` : 'XXX-XX-XXXX');
    const getSsnLast4FromState = () => {
        const digits = (driver.socialSecurityNumber || '').replace(/\D/g, '');
        return digits ? digits.slice(-4) : null;
    };
    const toggleSsnVisibility = () => {
        const willShow = !showSsn;
        if (willShow) {
            const digits = String(driver.socialSecurityNumber || '').replace(/\D/g, '');
            if (digits.length !== 9) {
                // Try to hydrate from device-local cache (demo-only, no auth)
                const cached = loadLocalSsn(recordId, driver.driverId);
                if (cached) {
                    setDriver((prev) => ({ ...prev, socialSecurityNumber: cached }));
                } else {
                    toast.current?.show({
                        severity: 'info',
                        summary: 'SSN',
                        detail: 'Only last 4 is available to display right now.',
                        life: 1800
                    });
                }
            }
        }
        setShowSsn(willShow);
        setSsnMaskKey((k) => k + 1);
    };

    useEffect(() => {
        if (!isEdit || !driverData?.driver || prefilled) return;
        const d = driverData.driver as any;
        setDriver((prev) => ({
            ...prev,
            driverId: d.driverCode || d.id,
            fullName: d.fullName || '',
            dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
            status: normalizeApiStatus(d.status),
            phoneNumber: normalizePhone(d.phone),
            emailAddress: d.email || '',
            address: d.address || '',
            licenseNumber: d.licenseNumber || '',
            licenseState: d.licenseState || '',
            licenseExpires: d.licenseExpires ? new Date(d.licenseExpires) : null,
            // Prefill SSN from session cache if available; otherwise attempt to derive from API (rare)
            socialSecurityNumber: (() => {
                // Prefer device-local cached full SSN when editing the same driver
                const local = loadLocalSsn(recordId, d.driverCode || d.id);
                if (local) return local;
                const raw = String(d.ssnEncrypted ?? '').trim();
                const digits = raw.replace(/\D/g, '');
                return digits.length === 9 ? digits : '';
            })(),
            cdlClass: d.cdlClass || '',
            medicalCardExpires: d.medicalCardExpires ? new Date(d.medicalCardExpires) : null,
            cdlEndorsements:
                d.cdlEndorsements && typeof d.cdlEndorsements === 'object'
                    ? {
                          hazardousMaterials: !!d.cdlEndorsements.hazardousMaterials,
                          tankVehicles: !!d.cdlEndorsements.tankVehicles,
                          passenger: !!d.cdlEndorsements.passenger,
                          schoolBus: !!d.cdlEndorsements.schoolBus,
                          doubleTripleTrailers: !!d.cdlEndorsements.doubleTripleTrailers,
                          hazmatTank: !!d.cdlEndorsements.hazmatTank
                      }
                    : prev.cdlEndorsements,
            twicCardNumber: d.twicCardNumber || '',
            twicCardExpiration: d.twicCardExpires ? new Date(d.twicCardExpires) : null,
            hireDate: d.hireDate ? new Date(d.hireDate) : null,
            notes: d.notes || ''
        }));
        setExistingSsnLast4(d.ssnLast4 ?? null);
        setPrefilled(true);
        setPhoneMaskKey((k) => k + 1);
    }, [isEdit, recordId, driverData?.driver, prefilled]);

    // Persist full SSN locally on this device (demo-only) once 9 digits are present
    useEffect(() => {
        const digits = (driver.socialSecurityNumber || '').replace(/\D/g, '');
        if (digits.length === 9) {
            saveLocalSsn(recordId, driver.driverId, digits);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId, driver.driverId, driver.socialSecurityNumber]);

    useEffect(() => {
        const run = async () => {
            if (!isEdit || !recordId) return;
            try {
                // Always fetch by canonical DB id; do not attempt fallback to non-UUID driverCode
                const items = (await listAttachments('driver', recordId)) || [];
                setAttachmentsList(items);
            } catch (err: any) {
                const msg = getGraphQLErrorMessage(err);
                toast.current?.show({ severity: 'warn', summary: 'Documents', detail: msg, life: 2000 });
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, recordId, prefilled]);

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'On Leave', value: 'on_leave' }
    ];

    const defaultStateOptions = [
        { label: 'Alabama (AL)', value: 'AL' },
        { label: 'Alaska (AK)', value: 'AK' },
        { label: 'Arizona (AZ)', value: 'AZ' },
        { label: 'Arkansas (AR)', value: 'AR' },
        { label: 'California (CA)', value: 'CA' },
        { label: 'Colorado (CO)', value: 'CO' },
        { label: 'Connecticut (CT)', value: 'CT' },
        { label: 'Delaware (DE)', value: 'DE' },
        { label: 'District Of Columbia (DC)', value: 'DC' },
        { label: 'Florida (FL)', value: 'FL' },
        { label: 'Georgia (GA)', value: 'GA' },
        { label: 'Hawaii (HI)', value: 'HI' },
        { label: 'Idaho (ID)', value: 'ID' },
        { label: 'Illinois (IL)', value: 'IL' },
        { label: 'Indiana (IN)', value: 'IN' },
        { label: 'Iowa (IA)', value: 'IA' },
        { label: 'Kansas (KS)', value: 'KS' },
        { label: 'Kentucky (KY)', value: 'KY' },
        { label: 'Louisiana (LA)', value: 'LA' },
        { label: 'Maine (ME)', value: 'ME' },
        { label: 'Maryland (MD)', value: 'MD' },
        { label: 'Massachusetts (MA)', value: 'MA' },
        { label: 'Michigan (MI)', value: 'MI' },
        { label: 'Minnesota (MN)', value: 'MN' },
        { label: 'Mississippi (MS)', value: 'MS' },
        { label: 'Missouri (MO)', value: 'MO' },
        { label: 'Montana (MT)', value: 'MT' },
        { label: 'Nebraska (NE)', value: 'NE' },
        { label: 'Nevada (NV)', value: 'NV' },
        { label: 'New Hampshire (NH)', value: 'NH' },
        { label: 'New Jersey (NJ)', value: 'NJ' },
        { label: 'New Mexico (NM)', value: 'NM' },
        { label: 'New York (NY)', value: 'NY' },
        { label: 'North Carolina (NC)', value: 'NC' },
        { label: 'North Dakota (ND)', value: 'ND' },
        { label: 'Ohio (OH)', value: 'OH' },
        { label: 'Oklahoma (OK)', value: 'OK' },
        { label: 'Oregon (OR)', value: 'OR' },
        { label: 'Pennsylvania (PA)', value: 'PA' },
        { label: 'Rhode Island (RI)', value: 'RI' },
        { label: 'South Carolina (SC)', value: 'SC' },
        { label: 'South Dakota (SD)', value: 'SD' },
        { label: 'Tennessee (TN)', value: 'TN' },
        { label: 'Texas (TX)', value: 'TX' },
        { label: 'Utah (UT)', value: 'UT' },
        { label: 'Vermont (VT)', value: 'VT' },
        { label: 'Virginia (VA)', value: 'VA' },
        { label: 'Washington (WA)', value: 'WA' },
        { label: 'West Virginia (WV)', value: 'WV' },
        { label: 'Wisconsin (WI)', value: 'WI' },
        { label: 'Wyoming (WY)', value: 'WY' }
    ];
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>(defaultStateOptions);
    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch('/data/usStates.json', { credentials: 'same-origin' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const body = await res.json();
                if (Array.isArray(body) && body.every((x) => typeof x?.label === 'string' && typeof x?.value === 'string')) {
                    setStateOptions(body);
                }
            } catch (_err) {
                toast.current?.show({ severity: 'warn', summary: 'States', detail: 'Using built-in state list.', life: 1500 });
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toISO = (d: Date | null) => (d ? new Date(d).toISOString() : null);
 
    // Comparable snapshot for detecting user edits (convert dates to ISO and ignore volatile fields)
    const toComparable = (vm: DriverVM) => ({
        driverId: (vm.driverId || '').trim(),
        fullName: (vm.fullName || '').trim(),
        dateOfBirth: toISO(vm.dateOfBirth),
        status: vm.status,
        phoneNumber: (vm.phoneNumber || '').trim(),
        emailAddress: (vm.emailAddress || '').trim(),
        address: (vm.address || '').trim(),
        licenseNumber: (vm.licenseNumber || '').trim(),
        licenseState: (vm.licenseState || '').trim(),
        licenseExpires: toISO(vm.licenseExpires),
        socialSecurityNumber: (vm.socialSecurityNumber || '').trim(),
        cdlClass: (vm.cdlClass || '').trim(),
        medicalCardExpires: toISO(vm.medicalCardExpires),
        cdlEndorsements: vm.cdlEndorsements,
        twicCardNumber: (vm.twicCardNumber || '').trim(),
        twicCardExpiration: toISO(vm.twicCardExpiration),
        hireDate: toISO(vm.hireDate),
        notes: (vm.notes || '').trim(),
        // Files are not part of this form's "dirty" detection (managed separately by docDirty)
        driversLicenseFront: null,
        driversLicenseBack: null,
        medicalCard: null,
        twicCard: null,
        i9Form: null
    });
    // Initialize snapshot once the edit form is prefilled
    useEffect(() => {
        if (isEdit && prefilled && !initialSnapshot) {
            setInitialSnapshot(toComparable(driver));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, prefilled, driver]);
    // True if any form field differs from the initial snapshot
    const isFormDirty = React.useMemo(() => {
        if (!initialSnapshot) return false;
        try {
            return JSON.stringify(toComparable(driver)) !== JSON.stringify(initialSnapshot);
        } catch {
            return false;
        }
    }, [driver, initialSnapshot]);
    // Local age compute
    const computeAgeYears = (d: Date | null): number | null => {
        if (!d) return null;
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age;
    };

    // Helper to reliably focus the DOB input (PrimeReact Calendar)
    // Note: Calendar may re-render on validation state changes; attempt focus a few times.
    const focusDob = () => {
        const tryFocus = () => {
            try {
                // Prefer component focus if available
                (dobRef as any)?.current?.focus?.();
            } catch {}
            try {
                // Fallback to input element via inputId
                const el = document.getElementById('dobInput') as HTMLInputElement | null;
                if (el) {
                    el.focus();
                    // Ensure field is visible when focusing after validation
                    el.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
                }
            } catch {}
        };
        // Immediate attempt
        tryFocus();
        // Retry after render cycle(s) to survive re-renders from state updates
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(tryFocus);
        }
        setTimeout(tryFocus, 0);
        setTimeout(tryFocus, 150);
    };

    function formatBytes(bytes?: number | null): string {
        if (bytes == null || Number.isNaN(bytes as any)) return '';
        const b = Number(bytes);
        if (b < 1024) return `${b} B`;
        const kb = b / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        if (mb < 1024) return `${mb.toFixed(1)} MB`;
        const gb = mb / 1024;
        return `${gb.toFixed(2)} GB`;
    }
    const isImage = (ct?: string | null) => !!ct && /^image\//i.test(ct);
    const loadPreview = async (id: string): Promise<string | undefined> => {
        try {
            if (attachmentPreviews[id]) return attachmentPreviews[id];
            const res = await getAttachmentContent(id);
            setAttachmentPreviews((prev) => ({ ...prev, [id]: res.contentBase64 }));
            return res.contentBase64;
        } catch (err: any) {
            const msg = getGraphQLErrorMessage(err);
            toast.current?.show({ severity: 'warn', summary: 'Preview', detail: msg, life: 2000 });
            return undefined;
        }
    };
    const openPreview = async (a: AttachmentListItem) => {
        const src = (await loadPreview(a.id)) ?? attachmentPreviews[a.id];
        if (!src) return;
        setPreviewTitle(a.fileName);
        setPreviewType(a.contentType || undefined);
        setPreviewSrc(src);
        setPreviewOpen(true);
    };
    const markDelete = (a: AttachmentListItem) => {
        setPendingDeletes((prev) => {
            const next = new Set(prev);
            next.add(a.id);
            return next;
        });
    };
    const undoDelete = (a: AttachmentListItem) => {
        setPendingDeletes((prev) => {
            const next = new Set(prev);
            next.delete(a.id);
            return next;
        });
    };
    const requestMarkDelete = (a: AttachmentListItem) => {
        setRemoveTarget(a);
        setConfirmRemoveOpen(true);
    };
    const confirmMarkDelete = () => {
        if (removeTarget) {
            markDelete(removeTarget);
        }
        setConfirmRemoveOpen(false);
        setRemoveTarget(null);
    };
    const handleReplaceFile = (a: AttachmentListItem, file: File | null) => {
        if (!file) return;
        markDelete(a);
        setStagedUploads((prev) => [...prev, { docType: a.docType || 'other', file }]);
        toast.current?.show({ severity: 'info', summary: 'Staged', detail: `New file staged to replace ${a.fileName}`, life: 1500 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side min-age validation prior to GraphQL call
        const ageNow = computeAgeYears(driver.dateOfBirth);
        if (ageNow == null) {
            setValidationErrors((prev) => ({ ...prev, dateOfBirthIso: 'Please provide a valid Date of Birth.' }));
            // Focus DOB input on validation error
            focusDob();
            return;
        }
        if (ageNow < (minDriverAge || 18)) {
            setValidationErrors((prev) => ({ ...prev, dateOfBirthIso: `Driver must be at least ${minDriverAge} years old.` }));
            // Focus DOB input on validation error
            focusDob();
            return;
        }

        if (isEdit) {
            try {
                DriverUpdateSchema.parse({ fullName: driver.fullName.trim(), status: driver.status });
                setValidationErrors({});
            } catch (err: any) {
                const rec = zodErrorToRecord(err);
                setValidationErrors(rec);
                if (rec.fullName) fullNameRef.current?.focus?.();
                else if (rec.status) statusRef.current?.focus?.();
                return;
            }
        } else {
            const toValidate = {
                id: driver.driverId.trim(),
                fullName: driver.fullName.trim(),
                dateOfBirthIso: String(toISO(driver.dateOfBirth) || ''),
                status: driver.status
            };
            try {
                DriverCreateSchema.parse(toValidate);
                setValidationErrors({});
            } catch (err: any) {
                const rec = zodErrorToRecord(err);
                setValidationErrors(rec);
                if (rec.id) driverIdRef.current?.focus?.();
                else if (rec.fullName) fullNameRef.current?.focus?.();
                else if (rec.status) statusRef.current?.focus?.();
                else if (rec.dateOfBirthIso) focusDob();
                return;
            }
        }

        if (isEdit && driverLoading) {
            setMessage({ severity: 'warn', text: 'Loading existing driver. Please wait and try again.' });
            toast.current?.show({ severity: 'warn', summary: 'Please wait', detail: 'Loading existing driver. Try again shortly.', life: 2000 });
            return;
        }

        setLoading(true);

        try {
            const ssnDigits = (driver.socialSecurityNumber || '').replace(/\D/g, '');
            const ssnLast4 = ssnDigits.slice(-4) || null;

            if (isEdit && recordId) {
                const input = {
                    driverCode: driver.driverId || null,
                    fullName: driver.fullName || null,
                    dateOfBirth: toISO(driver.dateOfBirth),
                    status: driver.status || null,
                    phone: driver.phoneNumber || null,
                    email: driver.emailAddress || null,
                    address: driver.address || null,
                    licenseNumber: driver.licenseNumber || null,
                    licenseState: driver.licenseState || null,
                    licenseExpires: toISO(driver.licenseExpires),
                    ssnLast4: ssnDigits ? ssnDigits.slice(-4) : null,
                    ssnEncrypted: ssnDigits || null,
                    cdlClass: driver.cdlClass || null,
                    medicalCardExpires: toISO(driver.medicalCardExpires),
                    cdlEndorsements: driver.cdlEndorsements,
                    twicCardNumber: driver.twicCardNumber || null,
                    twicCardExpires: toISO(driver.twicCardExpiration),
                    hireDate: toISO(driver.hireDate),
                    notes: driver.notes || null
                } as any;

                await updateDriver({ variables: { id: recordId, input }, context: { suppressGlobalError: true } });

                // Commit staged document changes (uploads + deletes) via new documents module
                try {
                    await docUploaderRef.current?.commit(recordId);
                } catch (e) {
                    console.error('Document commit error', e);
                }

                setMessage({ severity: 'success', text: 'Driver updated successfully!' });
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Driver updated successfully', life: 1500 });
                setTimeout(() => navigate('/fleet/drivers/list'), 800);
            } else {
                const input = {
                    id: driver.driverId,
                    driverCode: driver.driverId,
                    fullName: driver.fullName,
                    dateOfBirth: toISO(driver.dateOfBirth),
                    status: driver.status,
                    phone: driver.phoneNumber || null,
                    email: driver.emailAddress || null,
                    address: driver.address || null,
                    licenseNumber: driver.licenseNumber || null,
                    licenseState: driver.licenseState || null,
                    licenseExpires: toISO(driver.licenseExpires),
                    ssnLast4,
                    ssnEncrypted: ssnDigits || null,
                    cdlClass: driver.cdlClass || null,
                    medicalCardExpires: toISO(driver.medicalCardExpires),
                    cdlEndorsements: driver.cdlEndorsements,
                    twicCardNumber: driver.twicCardNumber || null,
                    twicCardExpires: toISO(driver.twicCardExpiration),
                    hireDate: toISO(driver.hireDate),
                    notes: driver.notes || null
                } as any;

                const res = await createDriver({ variables: { input }, context: { suppressGlobalError: true } });

                try {
                    const newId = (res as any)?.data?.createDriver?.id;
                    if (newId) {
                        // Commit staged document changes after create with the new id
                        await docUploaderRef.current?.commit(newId);
                    } else {
                        toast.current?.show({ severity: 'warn', summary: 'Documents', detail: 'Could not determine new driver ID to attach documents. Skipped uploads.', life: 2500 });
                    }
                } catch (e) {
                    console.error('Document commit error', e);
                }

                setMessage({ severity: 'success', text: 'Driver created successfully!' });
                toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Driver created successfully', life: 1500 });
                setTimeout(() => navigate('/fleet/drivers/list'), 800);
            }
        } catch (err) {
            console.error(isEdit ? 'UpdateDriver error' : 'CreateDriver error', err);
            const msg = getGraphQLErrorMessage(err);
            setMessage({ severity: 'error', text: msg });
            toast.current?.show({ severity: 'error', summary: 'Save failed', detail: msg, life: 2500 });

            // Heuristic: focus the field indicated by the error
            const m = String(msg || '').toLowerCase();
            if (m.includes('date of birth') || /at least \d+\s*years/.test(m)) {
                focusDob();
            } else if (m.includes('full name')) {
                fullNameRef.current?.focus?.();
            } else if (m.includes('driver code') || /\bid\b/.test(m)) {
                driverIdRef.current?.focus?.();
            } else if (m.includes('status')) {
                statusRef.current?.focus?.();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/fleet/drivers/list');
    };

    const onFileSelect = (e: any, field: keyof DriverVM) => {
        const file = e.files?.[0];
        setDriver((prev) => ({ ...prev, [field]: file ?? null } as DriverVM));
    };

    const onFileClear = (field: keyof DriverVM) => {
        setDriver((prev) => ({ ...prev, [field]: null }));
    };

    const handleEndorsementChange = (endorsement: keyof Endorsements, checked: boolean) => {
        setDriver((prev) => ({
            ...prev,
            cdlEndorsements: { ...prev.cdlEndorsements, [endorsement]: checked }
        }));
    };

    const errDOB = validationErrors.dateOfBirthIso;

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <Toast ref={toast} />
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="m-0">{isEdit ? 'Edit Driver' : 'Add New Driver'}</h2>
                            <p className="text-500 mt-2 mb-0">{isEdit ? 'Update driver profile and FMCSA compliance information' : 'Create a new driver profile with FMCSA compliance information'}</p>
                        </div>
                        <Button label="Back to Drivers" icon="pi pi-arrow-left" onClick={handleCancel} className="p-button-outlined" />
                    </div>

                    {message && <Message severity={message.severity} text={message.text} className="mb-4" />}
                    {isEdit && driverLoading && (
                        <div className="mb-3">
                            <i className="pi pi-spin pi-spinner mr-2" /> Loading existing driver...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid">
                            <div className="col-12">
                                <h3 className="mb-3">Driver Information</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="driverId" className="font-bold block mb-2">
                                    {isEdit ? 'Driver Code (read-only)' : 'Driver Code *'}
                                </label>
                                <InputText
                                    id="driverId"
                                    value={driver.driverId}
                                    ref={driverIdRef}
                                    onChange={(e) => {
                                        setDriver((prev) => ({ ...prev, driverId: e.target.value }));
                                        if (validationErrors.id) {
                                            const { id, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    placeholder={isEdit ? 'D-0001' : 'D-0001'}
                                    className={`w-full ${!isEdit && validationErrors.id ? 'p-invalid' : ''}`}
                                    disabled={isEdit}
                                />
                                {!isEdit && validationErrors.id && <small className="p-error">{validationErrors.id}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="fullName" className="font-bold block mb-2">
                                    Full Name *
                                </label>
                                <InputText
                                    id="fullName"
                                    value={driver.fullName}
                                    ref={fullNameRef}
                                    onChange={(e) => {
                                        setDriver((prev) => ({ ...prev, fullName: e.target.value }));
                                        if (validationErrors.fullName) {
                                            const { fullName, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    placeholder="John Smith"
                                    className={`w-full ${validationErrors.fullName ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.fullName && <small className="p-error">{validationErrors.fullName}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="dateOfBirth" className="font-bold block mb-2">
                                    Date of Birth *
                                </label>
                                <div className="flex align-items-center gap-2">
                                    <div className="w-auto">
                                        <Calendar
                                            id="dateOfBirth"
                                            inputId="dobInput"
                                            ref={dobRef}
                                            value={driver.dateOfBirth}
                                            onChange={(e) => {
                                                const next = (e.value as Date) ?? null;
                                                setDriver((prev) => ({ ...prev, dateOfBirth: next }));
                                                // Inline min-age feedback
                                                const age = computeAgeYears(next);
                                                if (age != null && age < (minDriverAge || 18)) {
                                                    setValidationErrors((prev) => ({ ...prev, dateOfBirthIso: `Driver must be at least ${minDriverAge} years old.` }));
                                                } else {
                                                    if (validationErrors.dateOfBirthIso) {
                                                        const { dateOfBirthIso, ...rest } = validationErrors;
                                                        setValidationErrors(rest);
                                                    }
                                                }
                                            }}
                                            showIcon
                                            dateFormat="mm/dd/yy"
                                            placeholder="mm/dd/yyyy"
                                            className={`${errDOB ? 'p-invalid' : ''}`}
                                            style={{ width: '16rem' }}
                                        />
                                    </div>
                                    <div className="ml-2">
                                        <small className="text-600">
                                            {(() => {
                                                const a = computeAgeYears(driver.dateOfBirth);
                                                return a != null && a >= 0 ? `Age: ${a} yr${a === 1 ? '' : 's'}` : 'Age: —';
                                            })()}
                                        </small>
                                    </div>
                                </div>
                                {errDOB && <small className="p-error">{errDOB}</small>}
                                {!errDOB && driver.dateOfBirth && <small className="text-600 mt-1 block">Minimum allowed age: {minDriverAge} years</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="status" className="font-bold block mb-2">
                                    Status *
                                </label>
                                <Dropdown
                                    id="status"
                                    value={driver.status}
                                    ref={statusRef}
                                    options={statusOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) => {
                                        setDriver((prev) => ({ ...prev, status: (e as any).value?.value ?? (e as any).value }));
                                        if (validationErrors.status) {
                                            const { status, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    placeholder="Select Status"
                                    className={`w-full ${validationErrors.status ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.status && <small className="p-error">{validationErrors.status}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="phoneNumber" className="font-bold block mb-2">
                                    Phone Number
                                </label>
                                <React.Fragment key={phoneMaskKey}>
                                    <InputMask
                                        id="phoneNumber"
                                        mask="(999) 999-9999"
                                        slotChar="_"
                                        unmask
                                        autoClear={false}
                                        value={driver.phoneNumber}
                                        onChange={(e: any) => setDriver((prev) => ({ ...prev, phoneNumber: e.value || '' }))}
                                        placeholder="(555) 123-4567"
                                        className="w-full"
                                    />
                                </React.Fragment>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="emailAddress" className="font-bold block mb-2">
                                    Email Address
                                </label>
                                <InputText id="emailAddress" value={driver.emailAddress} onChange={(e) => setDriver((prev) => ({ ...prev, emailAddress: e.target.value }))} placeholder="john@example.com" className="w-full" />
                            </div>

                            <div className="col-12">
                                <label htmlFor="address" className="font-bold block mb-2">
                                    Address
                                </label>
                                <InputTextarea id="address" value={driver.address} onChange={(e) => setDriver((prev) => ({ ...prev, address: e.target.value }))} placeholder="123 Main Street, City, State 12345" className="w-full" rows={3} />
                            </div>

                            <div className="col-12">
                                <h3 className="mb-3 mt-4">License Information</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="licenseNumber" className="font-bold block mb-2">
                                    License Number
                                </label>
                                <InputText id="licenseNumber" value={driver.licenseNumber} onChange={(e) => setDriver((prev) => ({ ...prev, licenseNumber: e.target.value }))} placeholder="D123456789" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="licenseState" className="font-bold block mb-2">
                                    License State
                                </label>
                                <Dropdown
                                    id="licenseState"
                                    value={driver.licenseState}
                                    options={stateOptions}
                                    onChange={(e) => setDriver((prev) => ({ ...prev, licenseState: (e as any).value }))}
                                    placeholder="Select State"
                                    className="w-full"
                                    filter
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="licenseExpires" className="font-bold block mb-2">
                                    License Expires
                                </label>
                                <Calendar
                                    id="licenseExpires"
                                    value={driver.licenseExpires}
                                    onChange={(e) => setDriver((prev) => ({ ...prev, licenseExpires: (e.value as Date) ?? null }))}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                    placeholder="mm/dd/yyyy"
                                    style={{ width: '16rem' }}
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="socialSecurityNumber" className="font-bold block mb-2">
                                    Social Security Number
                                </label>
                                <div className="p-input-icon-right w-full">
                                    <i
                                        className={`pi ${showSsn ? 'pi-eye-slash' : 'pi-eye'}`}
                                        onClick={toggleSsnVisibility}
                                        style={{ cursor: 'pointer' }}
                                        aria-label={showSsn ? 'Hide SSN' : 'Show SSN'}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSsnVisibility()}
                                    />
                                    {showSsn ? (
                                        <InputMask
                                            key={`ssn-${ssnMaskKey}-mask`}
                                            id="socialSecurityNumber"
                                            mask="999-99-9999"
                                            slotChar="_"
                                            unmask
                                            autoClear={false}
                                            value={driver.socialSecurityNumber}
                                            onChange={(e: any) => setDriver((prev) => ({ ...prev, socialSecurityNumber: (e as any).value || '' }))}
                                            placeholder="XXX-XX-XXXX"
                                            className="w-full"
                                        />
                                    ) : (
                                        <InputText key={`ssn-${ssnMaskKey}-masked`} id="socialSecurityNumber_masked" value={maskSsnLast4(getSsnLast4FromState() ?? existingSsnLast4)} readOnly className="w-full" />
                                    )}
                                </div>
                                <small className="text-500 mt-1 block">
                                    <i className="pi pi-shield mr-1"></i>
                                    Encrypted and secured for compliance
                                </small>
                            </div>

                            <div className="col-12">
                                <h3 className="mb-3 mt-4">CDL Information</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="cdlClass" className="font-bold block mb-2">
                                    CDL Class
                                </label>
                                <Dropdown
                                    id="cdlClass"
                                    value={driver.cdlClass}
                                    options={[
                                        { label: 'Select CDL class', value: '' },
                                        { label: 'Class A', value: 'A' },
                                        { label: 'Class B', value: 'B' },
                                        { label: 'Class C', value: 'C' }
                                    ]}
                                    onChange={(e) => setDriver((prev) => ({ ...prev, cdlClass: (e as any).value }))}
                                    placeholder="Select CDL class"
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="medicalCardExpires" className="font-bold block mb-2">
                                    Medical Card Expires
                                </label>
                                <Calendar
                                    id="medicalCardExpires"
                                    value={driver.medicalCardExpires}
                                    onChange={(e) => setDriver((prev) => ({ ...prev, medicalCardExpires: (e.value as Date) ?? null }))}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                    placeholder="mm/dd/yyyy"
                                    style={{ width: '16rem' }}
                                />
                            </div>

                            <div className="col-12">
                                <label className="font-bold block mb-3">CDL Endorsements</label>
                                <div className="grid">
                                    <div className="col-12 md:col-4">
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="hazardousMaterials" checked={driver.cdlEndorsements.hazardousMaterials} onChange={(e) => handleEndorsementChange('hazardousMaterials', (e as any).checked || false)} />
                                            <label htmlFor="hazardousMaterials" className="ml-2">
                                                H - Hazardous Materials
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="tankVehicles" checked={driver.cdlEndorsements.tankVehicles} onChange={(e) => handleEndorsementChange('tankVehicles', (e as any).checked || false)} />
                                            <label htmlFor="tankVehicles" className="ml-2">
                                                N - Tank Vehicles
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="passenger" checked={driver.cdlEndorsements.passenger} onChange={(e) => handleEndorsementChange('passenger', (e as any).checked || false)} />
                                            <label htmlFor="passenger" className="ml-2">
                                                P - Passenger
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="schoolBus" checked={driver.cdlEndorsements.schoolBus} onChange={(e) => handleEndorsementChange('schoolBus', (e as any).checked || false)} />
                                            <label htmlFor="schoolBus" className="ml-2">
                                                S - School Bus
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="doubleTripleTrailers" checked={driver.cdlEndorsements.doubleTripleTrailers} onChange={(e) => handleEndorsementChange('doubleTripleTrailers', (e as any).checked || false)} />
                                            <label htmlFor="doubleTripleTrailers" className="ml-2">
                                                T - Double/Triple Trailers
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <div className="flex align-items-center">
                                            <Checkbox inputId="hazmatTank" checked={driver.cdlEndorsements.hazmatTank} onChange={(e) => handleEndorsementChange('hazmatTank', (e as any).checked || false)} />
                                            <label htmlFor="hazmatTank" className="ml-2">
                                                X - Hazmat + Tank
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <h3 className="mb-3 mt-4">TWIC Card Information</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="twicCardNumber" className="font-bold block mb-2">
                                    TWIC Card Number
                                </label>
                                <InputText id="twicCardNumber" value={driver.twicCardNumber} onChange={(e) => setDriver((prev) => ({ ...prev, twicCardNumber: e.target.value }))} placeholder="Enter TWIC card number" className="w-full" />
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="twicCardExpiration" className="font-bold block mb-2">
                                    TWIC Card Expiration
                                </label>
                                <Calendar
                                    id="twicCardExpiration"
                                    value={driver.twicCardExpiration}
                                    onChange={(e) => setDriver((prev) => ({ ...prev, twicCardExpiration: (e.value as Date) ?? null }))}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                    placeholder="mm/dd/yyyy"
                                    style={{ width: '16rem' }}
                                />
                            </div>

                            <div className="col-12">
                                <h3 className="mb-3 mt-4">Employment Information</h3>
                            </div>

                            <div className="col-12 md:col-6">
                                <label htmlFor="hireDate" className="font-bold block mb-2">
                                    Hire Date
                                </label>
                                <Calendar id="hireDate" value={driver.hireDate} onChange={(e) => setDriver((prev) => ({ ...prev, hireDate: (e.value as Date) ?? null }))} showIcon dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" style={{ width: '16rem' }} />
                            </div>



                            <div className="col-12">
                                <h3 className="mb-3 mt-4">Documents</h3>
                                <DocumentUploader
                                    ref={docUploaderRef}
                                    module="driver"
                                    entityId={recordId as string}
                                    allowDeleteWithoutReplacement={true}
                                    onValidityChange={(ok, names) => {
                                        setDocsOk(!!ok);
                                        setMissingDocNames(Array.isArray(names) ? names : []);
                                    }}
                                    onDirtyChange={(dirty) => setDocDirty(!!dirty)}
                                />
                                {isEdit && !docsOk && (
                                    <div className="mt-2">
                                        <Message severity="warn" text={`Missing mandatory document(s): ${missingDocNames.join(', ')}`} />
                                    </div>
                                )}
                            </div>

                            <div className="col-12">
                                <div className="flex justify-content-end gap-3 mt-4">
                                    <Button type="button" label="Cancel" icon="pi pi-times" onClick={handleCancel} className="p-button-outlined" />
                                    <Button
                                        type="submit"
                                        label={isEdit ? 'Save Changes' : 'Create Driver'}
                                        icon={isEdit ? 'pi pi-save' : 'pi pi-plus'}
                                        loading={loading}
                                        disabled={
                                            loading ||
                                            (isEdit && driverLoading) ||
                                            (isEdit && !docsOk) ||
                                            (isEdit && !(isFormDirty || docDirty))
                                        }
                                        className="p-button-success"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    <Dialog
                        header={previewTitle}
                        visible={previewOpen}
                        onHide={() => setPreviewOpen(false)}
                        style={{ width: '92vw', maxWidth: '1200px' }}
                        contentStyle={{ height: '82vh', padding: 0 }}
                        dismissableMask
                    >
                        {previewSrc ? (
                            isImage(previewType) ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={previewSrc} alt={previewTitle} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            ) : (
                                <object data={previewSrc} type={previewType || 'application/pdf'} width="100%" height="100%">
                                    <a href={previewSrc} download={previewTitle}>
                                        Download {previewTitle}
                                    </a>
                                </object>
                            )
                        ) : (
                            <div className="text-600">No preview available.</div>
                        )}
                    </Dialog>

                    <Dialog header="Confirm removal" visible={confirmRemoveOpen} onHide={() => setConfirmRemoveOpen(false)} style={{ width: '420px' }} modal>
                        <p>Mark "{removeTarget?.fileName}" for removal? It will be deleted when you save.</p>
                        <div className="flex justify-content-end gap-2 mt-3">
                            <Button label="Cancel" text onClick={() => setConfirmRemoveOpen(false)} />
                            <Button label="Mark for Removal" icon="pi pi-trash" severity="danger" onClick={confirmMarkDelete} />
                        </div>
                    </Dialog>
                </Card>
            </div>
        </div>
    );
}
