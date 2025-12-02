import * as Types from '../../types/graphql';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type DriversQueryVariables = Types.Exact<{
    limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
    offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type DriversQuery = {
    __typename?: 'Query';
    drivers: Array<{
        __typename?: 'Driver';
        id: string;
        driverCode: string;
        fullName: string;
        dateOfBirth?: string | null;
        status: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
        licenseNumber?: string | null;
        licenseState?: string | null;
        licenseExpires?: string | null;
        ssnLast4?: string | null;
        ssnEncrypted?: string | null;
        cdlClass?: string | null;
        medicalCardExpires?: string | null;
        cdlEndorsements?: any | null;
        twicCardNumber?: string | null;
        twicCardExpires?: string | null;
        hireDate?: string | null;
        notes?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    }>;
};

export type DriverQueryVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type DriverQuery = {
    __typename?: 'Query';
    driver?: {
        __typename?: 'Driver';
        id: string;
        driverCode: string;
        fullName: string;
        dateOfBirth?: string | null;
        status: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
        licenseNumber?: string | null;
        licenseState?: string | null;
        licenseExpires?: string | null;
        ssnLast4?: string | null;
        ssnEncrypted?: string | null;
        cdlClass?: string | null;
        medicalCardExpires?: string | null;
        cdlEndorsements?: any | null;
        twicCardNumber?: string | null;
        twicCardExpires?: string | null;
        hireDate?: string | null;
        notes?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type CreateDriverMutationVariables = Types.Exact<{
    input: Types.DriverCreateInput;
}>;

export type CreateDriverMutation = {
    __typename?: 'Mutation';
    createDriver: {
        __typename?: 'Driver';
        id: string;
        driverCode: string;
        fullName: string;
        dateOfBirth?: string | null;
        status: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
        licenseNumber?: string | null;
        licenseState?: string | null;
        licenseExpires?: string | null;
        ssnLast4?: string | null;
        ssnEncrypted?: string | null;
        cdlClass?: string | null;
        medicalCardExpires?: string | null;
        cdlEndorsements?: any | null;
        twicCardNumber?: string | null;
        twicCardExpires?: string | null;
        hireDate?: string | null;
        notes?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    };
};

export type UpdateDriverMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
    input: Types.DriverUpdateInput;
}>;

export type UpdateDriverMutation = {
    __typename?: 'Mutation';
    updateDriver?: {
        __typename?: 'Driver';
        id: string;
        driverCode: string;
        fullName: string;
        dateOfBirth?: string | null;
        status: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
        licenseNumber?: string | null;
        licenseState?: string | null;
        licenseExpires?: string | null;
        ssnLast4?: string | null;
        ssnEncrypted?: string | null;
        cdlClass?: string | null;
        medicalCardExpires?: string | null;
        cdlEndorsements?: any | null;
        twicCardNumber?: string | null;
        twicCardExpires?: string | null;
        hireDate?: string | null;
        notes?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type DeleteDriverMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type DeleteDriverMutation = { __typename?: 'Mutation'; deleteDriver: boolean };

export const DriversDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Drivers' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '10' } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '0' } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'drivers' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'limit' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'offset' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'DriverFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'DriverFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Driver' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverCode' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dateOfBirth' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseState' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnLast4' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnEncrypted' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlClass' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'medicalCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlEndorsements' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'hireDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<DriversQuery, DriversQueryVariables>;
export const DriverDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Driver' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'driver' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'DriverFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'DriverFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Driver' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverCode' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dateOfBirth' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseState' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnLast4' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnEncrypted' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlClass' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'medicalCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlEndorsements' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'hireDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<DriverQuery, DriverQueryVariables>;
export const CreateDriverDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'CreateDriver' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'DriverCreateInput' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createDriver' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'DriverFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'DriverFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Driver' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverCode' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dateOfBirth' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseState' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnLast4' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnEncrypted' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlClass' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'medicalCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlEndorsements' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'hireDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<CreateDriverMutation, CreateDriverMutationVariables>;
export const UpdateDriverDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'UpdateDriver' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'DriverUpdateInput' } } } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updateDriver' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'DriverFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'DriverFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Driver' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverCode' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dateOfBirth' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseState' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'licenseExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnLast4' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'ssnEncrypted' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlClass' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'medicalCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'cdlEndorsements' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'twicCardExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'hireDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<UpdateDriverMutation, UpdateDriverMutationVariables>;
export const DeleteDriverDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteDriver' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'deleteDriver' }, arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }] }]
            }
        }
    ]
} as unknown as DocumentNode<DeleteDriverMutation, DeleteDriverMutationVariables>;
