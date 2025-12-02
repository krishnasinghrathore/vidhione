export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    JSON: { input: any; output: any };
};

/** Driver domain types */
export type Driver = {
    __typename?: 'Driver';
    address?: Maybe<Scalars['String']['output']>;
    cdlClass?: Maybe<Scalars['String']['output']>;
    cdlEndorsements?: Maybe<Scalars['JSON']['output']>;
    createdAt: Scalars['String']['output'];
    dateOfBirth?: Maybe<Scalars['String']['output']>;
    deletedAt?: Maybe<Scalars['String']['output']>;
    driverCode: Scalars['String']['output'];
    email?: Maybe<Scalars['String']['output']>;
    fullName: Scalars['String']['output'];
    hireDate?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    licenseExpires?: Maybe<Scalars['String']['output']>;
    licenseNumber?: Maybe<Scalars['String']['output']>;
    licenseState?: Maybe<Scalars['String']['output']>;
    medicalCardExpires?: Maybe<Scalars['String']['output']>;
    notes?: Maybe<Scalars['String']['output']>;
    phone?: Maybe<Scalars['String']['output']>;
    ssnEncrypted?: Maybe<Scalars['String']['output']>;
    ssnLast4?: Maybe<Scalars['String']['output']>;
    status: Scalars['String']['output'];
    twicCardExpires?: Maybe<Scalars['String']['output']>;
    twicCardNumber?: Maybe<Scalars['String']['output']>;
    updatedAt: Scalars['String']['output'];
};

export type DriverCreateInput = {
    address?: InputMaybe<Scalars['String']['input']>;
    cdlClass?: InputMaybe<Scalars['String']['input']>;
    cdlEndorsements?: InputMaybe<Scalars['JSON']['input']>;
    dateOfBirth?: InputMaybe<Scalars['String']['input']>;
    driverCode: Scalars['String']['input'];
    email?: InputMaybe<Scalars['String']['input']>;
    fullName: Scalars['String']['input'];
    hireDate?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['ID']['input'];
    licenseExpires?: InputMaybe<Scalars['String']['input']>;
    licenseNumber?: InputMaybe<Scalars['String']['input']>;
    licenseState?: InputMaybe<Scalars['String']['input']>;
    medicalCardExpires?: InputMaybe<Scalars['String']['input']>;
    notes?: InputMaybe<Scalars['String']['input']>;
    phone?: InputMaybe<Scalars['String']['input']>;
    ssnEncrypted?: InputMaybe<Scalars['String']['input']>;
    ssnLast4?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<Scalars['String']['input']>;
    twicCardExpires?: InputMaybe<Scalars['String']['input']>;
    twicCardNumber?: InputMaybe<Scalars['String']['input']>;
};

export type DriverUpdateInput = {
    address?: InputMaybe<Scalars['String']['input']>;
    cdlClass?: InputMaybe<Scalars['String']['input']>;
    cdlEndorsements?: InputMaybe<Scalars['JSON']['input']>;
    dateOfBirth?: InputMaybe<Scalars['String']['input']>;
    deletedAt?: InputMaybe<Scalars['String']['input']>;
    driverCode?: InputMaybe<Scalars['String']['input']>;
    email?: InputMaybe<Scalars['String']['input']>;
    fullName?: InputMaybe<Scalars['String']['input']>;
    hireDate?: InputMaybe<Scalars['String']['input']>;
    licenseExpires?: InputMaybe<Scalars['String']['input']>;
    licenseNumber?: InputMaybe<Scalars['String']['input']>;
    licenseState?: InputMaybe<Scalars['String']['input']>;
    medicalCardExpires?: InputMaybe<Scalars['String']['input']>;
    notes?: InputMaybe<Scalars['String']['input']>;
    phone?: InputMaybe<Scalars['String']['input']>;
    ssnEncrypted?: InputMaybe<Scalars['String']['input']>;
    ssnLast4?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<Scalars['String']['input']>;
    twicCardExpires?: InputMaybe<Scalars['String']['input']>;
    twicCardNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Maintenance Record domain types */
export type MaintenanceRecord = {
    __typename?: 'MaintenanceRecord';
    completedBy?: Maybe<Scalars['String']['output']>;
    createdAt: Scalars['String']['output'];
    deletedAt?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    laborHours?: Maybe<Scalars['String']['output']>;
    meterReading?: Maybe<Scalars['String']['output']>;
    notes?: Maybe<Scalars['String']['output']>;
    partsUsed?: Maybe<Scalars['String']['output']>;
    serviceDate: Scalars['String']['output'];
    maintenanceCompletionTypeId: Scalars['ID']['output'];
    services: Array<Scalars['String']['output']>;
    totalCost?: Maybe<Scalars['String']['output']>;
    updatedAt: Scalars['String']['output'];
    vehicleId?: Maybe<Scalars['ID']['output']>;
};

export type MaintenanceRecordCreateInput = {
    id: Scalars['ID']['input'];
    vehicleId: Scalars['ID']['input'];
    serviceDate: Scalars['String']['input'];
    maintenanceCompletionTypeId: Scalars['ID']['input'];
    completedBy: Scalars['String']['input'];
    meterReading?: InputMaybe<Scalars['String']['input']>;
    laborHours?: InputMaybe<Scalars['String']['input']>;
    totalCost?: InputMaybe<Scalars['String']['input']>;
    partsUsed?: InputMaybe<Scalars['String']['input']>;
    notes?: InputMaybe<Scalars['String']['input']>;
    services: Array<Scalars['String']['input']>;
};

export type MaintenanceRecordUpdateInput = {
    vehicleId?: InputMaybe<Scalars['ID']['input']>;
    serviceDate?: InputMaybe<Scalars['String']['input']>;
    maintenanceCompletionTypeId?: InputMaybe<Scalars['ID']['input']>;
    completedBy?: InputMaybe<Scalars['String']['input']>;
    meterReading?: InputMaybe<Scalars['String']['input']>;
    laborHours?: InputMaybe<Scalars['String']['input']>;
    totalCost?: InputMaybe<Scalars['String']['input']>;
    partsUsed?: InputMaybe<Scalars['String']['input']>;
    notes?: InputMaybe<Scalars['String']['input']>;
    services?: InputMaybe<Array<Scalars['String']['input']>>;
    deletedAt?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
    __typename?: 'Mutation';
    _empty?: Maybe<Scalars['Boolean']['output']>;
    createDriver: Driver;
    createMaintenanceRecord: MaintenanceRecord;
    createVehicle: Vehicle;
    createWorkOrder: WorkOrder;
    deleteDriver: Scalars['Boolean']['output'];
    deleteMaintenanceRecord: Scalars['Boolean']['output'];
    deleteVehicle: Scalars['Boolean']['output'];
    deleteWorkOrder: Scalars['Boolean']['output'];
    updateDriver?: Maybe<Driver>;
    updateMaintenanceRecord?: Maybe<MaintenanceRecord>;
    updateVehicle?: Maybe<Vehicle>;
    updateWorkOrder?: Maybe<WorkOrder>;
};

export type MutationCreateDriverArgs = {
    input: DriverCreateInput;
};

export type MutationCreateMaintenanceRecordArgs = {
    input: MaintenanceRecordCreateInput;
};

export type MutationCreateVehicleArgs = {
    input: VehicleCreateInput;
};

export type MutationCreateWorkOrderArgs = {
    input: WorkOrderCreateInput;
};

export type MutationDeleteDriverArgs = {
    id: Scalars['ID']['input'];
};

export type MutationDeleteMaintenanceRecordArgs = {
    id: Scalars['ID']['input'];
};

export type MutationDeleteVehicleArgs = {
    id: Scalars['ID']['input'];
};

export type MutationDeleteWorkOrderArgs = {
    id: Scalars['ID']['input'];
};

export type MutationUpdateDriverArgs = {
    id: Scalars['ID']['input'];
    input: DriverUpdateInput;
};

export type MutationUpdateMaintenanceRecordArgs = {
    id: Scalars['ID']['input'];
    input: MaintenanceRecordUpdateInput;
};

export type MutationUpdateVehicleArgs = {
    id: Scalars['ID']['input'];
    input: VehicleUpdateInput;
};

export type MutationUpdateWorkOrderArgs = {
    id: Scalars['ID']['input'];
    input: WorkOrderUpdateInput;
};

export type Query = {
    __typename?: 'Query';
    _empty?: Maybe<Scalars['Boolean']['output']>;
    dbVersion?: Maybe<Scalars['String']['output']>;
    driver?: Maybe<Driver>;
    drivers: Array<Driver>;
    health: Scalars['String']['output'];
    hello: Scalars['String']['output'];
    maintenanceRecord?: Maybe<MaintenanceRecord>;
    maintenanceRecords: Array<MaintenanceRecord>;
    vehicle?: Maybe<Vehicle>;
    vehicles: Array<Vehicle>;
    workOrder?: Maybe<WorkOrder>;
    workOrders: Array<WorkOrder>;
};

export type QueryDriverArgs = {
    id: Scalars['ID']['input'];
};

export type QueryDriversArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMaintenanceRecordArgs = {
    id: Scalars['ID']['input'];
};

export type QueryMaintenanceRecordsArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryVehicleArgs = {
    id: Scalars['ID']['input'];
};

export type QueryVehiclesArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryWorkOrderArgs = {
    id: Scalars['ID']['input'];
};

export type QueryWorkOrdersArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    offset?: InputMaybe<Scalars['Int']['input']>;
};

/** Vehicle domain types */
export type Vehicle = {
    __typename?: 'Vehicle';
    createdAt: Scalars['String']['output'];
    deletedAt?: Maybe<Scalars['String']['output']>;
    driverId?: Maybe<Scalars['ID']['output']>;
    id: Scalars['ID']['output'];
    inspectionExpires?: Maybe<Scalars['String']['output']>;
    lessorOwner?: Maybe<Scalars['String']['output']>;
    make?: Maybe<Scalars['String']['output']>;
    mileage?: Maybe<Scalars['Int']['output']>;
    model?: Maybe<Scalars['String']['output']>;
    plateNumber?: Maybe<Scalars['String']['output']>;
    registrationExpires?: Maybe<Scalars['String']['output']>;
    status: Scalars['String']['output'];
    tireSize?: Maybe<Scalars['String']['output']>;
    unitNumber: Scalars['String']['output'];
    updatedAt: Scalars['String']['output'];
    vin?: Maybe<Scalars['String']['output']>;
    year?: Maybe<Scalars['Int']['output']>;
};

export type VehicleCreateInput = {
    driverId?: InputMaybe<Scalars['ID']['input']>;
    id: Scalars['ID']['input'];
    inspectionExpires?: InputMaybe<Scalars['String']['input']>;
    lessorOwner?: InputMaybe<Scalars['String']['input']>;
    make?: InputMaybe<Scalars['String']['input']>;
    mileage?: InputMaybe<Scalars['Int']['input']>;
    model?: InputMaybe<Scalars['String']['input']>;
    plateNumber?: InputMaybe<Scalars['String']['input']>;
    registrationExpires?: InputMaybe<Scalars['String']['input']>;
    status: Scalars['String']['input'];
    tireSize?: InputMaybe<Scalars['String']['input']>;
    unitNumber: Scalars['String']['input'];
    vin?: InputMaybe<Scalars['String']['input']>;
    year?: InputMaybe<Scalars['Int']['input']>;
};

export type VehicleUpdateInput = {
    deletedAt?: InputMaybe<Scalars['String']['input']>;
    driverId?: InputMaybe<Scalars['ID']['input']>;
    inspectionExpires?: InputMaybe<Scalars['String']['input']>;
    lessorOwner?: InputMaybe<Scalars['String']['input']>;
    make?: InputMaybe<Scalars['String']['input']>;
    mileage?: InputMaybe<Scalars['Int']['input']>;
    model?: InputMaybe<Scalars['String']['input']>;
    plateNumber?: InputMaybe<Scalars['String']['input']>;
    registrationExpires?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<Scalars['String']['input']>;
    tireSize?: InputMaybe<Scalars['String']['input']>;
    unitNumber?: InputMaybe<Scalars['String']['input']>;
    vin?: InputMaybe<Scalars['String']['input']>;
    year?: InputMaybe<Scalars['Int']['input']>;
};

/** Work Order domain types */
export type WorkOrder = {
    __typename?: 'WorkOrder';
    assignedTo?: Maybe<Scalars['ID']['output']>;
    createdAt: Scalars['String']['output'];
    deletedAt?: Maybe<Scalars['String']['output']>;
    description?: Maybe<Scalars['String']['output']>;
    notes?: Maybe<Scalars['String']['output']>;
    dueDate?: Maybe<Scalars['String']['output']>;
    dueMeterReading?: Maybe<Scalars['String']['output']>;
    estCost?: Maybe<Scalars['String']['output']>;
    estLaborHours?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    number: Scalars['String']['output'];
    priority: Scalars['String']['output'];
    status: Scalars['String']['output'];
    taskName: Scalars['String']['output'];
    updatedAt: Scalars['String']['output'];
    vehicleId: Scalars['ID']['output'];
};

export type WorkOrderCreateInput = {
    assignedTo?: InputMaybe<Scalars['ID']['input']>;
    description?: InputMaybe<Scalars['String']['input']>;
    notes?: InputMaybe<Scalars['String']['input']>;
    dueDate?: InputMaybe<Scalars['String']['input']>;
    dueMeterReading?: InputMaybe<Scalars['String']['input']>;
    estCost?: InputMaybe<Scalars['String']['input']>;
    estLaborHours?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['ID']['input'];
    number?: InputMaybe<Scalars['String']['input']>;
    priority?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<Scalars['String']['input']>;
    taskName: Scalars['String']['input'];
    vehicleId: Scalars['ID']['input'];
};

export type WorkOrderUpdateInput = {
    assignedTo?: InputMaybe<Scalars['ID']['input']>;
    deletedAt?: InputMaybe<Scalars['String']['input']>;
    description?: InputMaybe<Scalars['String']['input']>;
    notes?: InputMaybe<Scalars['String']['input']>;
    dueDate?: InputMaybe<Scalars['String']['input']>;
    dueMeterReading?: InputMaybe<Scalars['String']['input']>;
    estCost?: InputMaybe<Scalars['String']['input']>;
    estLaborHours?: InputMaybe<Scalars['String']['input']>;
    number?: InputMaybe<Scalars['String']['input']>;
    priority?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<Scalars['String']['input']>;
    taskName?: InputMaybe<Scalars['String']['input']>;
    vehicleId?: InputMaybe<Scalars['ID']['input']>;
};
