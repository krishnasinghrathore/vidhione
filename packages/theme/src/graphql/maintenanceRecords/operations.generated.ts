import * as Types from '../../types/graphql';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type MaintenanceRecordsQueryVariables = Types.Exact<{
    limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
    offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type MaintenanceRecordsQuery = {
    __typename?: 'Query';
    maintenanceRecords: Array<{
        __typename?: 'MaintenanceRecord';
        id: string;
        vehicleId?: string | null;
        serviceDate: string;
        maintenanceCompletionTypeId: string;
        completedBy?: string | null;
        meterReading?: string | null;
        laborHours?: string | null;
        totalCost?: string | null;
        partsUsed?: string | null;
        notes?: string | null;
        services: Array<string>;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    }>;
};

export type MaintenanceRecordQueryVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type MaintenanceRecordQuery = {
    __typename?: 'Query';
    maintenanceRecord?: {
        __typename?: 'MaintenanceRecord';
        id: string;
        vehicleId?: string | null;
        serviceDate: string;
        maintenanceCompletionTypeId: string;
        completedBy?: string | null;
        meterReading?: string | null;
        laborHours?: string | null;
        totalCost?: string | null;
        partsUsed?: string | null;
        notes?: string | null;
        services: Array<string>;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type CreateMaintenanceRecordMutationVariables = Types.Exact<{
    input: Types.MaintenanceRecordCreateInput;
}>;

export type CreateMaintenanceRecordMutation = {
    __typename?: 'Mutation';
    createMaintenanceRecord: {
        __typename?: 'MaintenanceRecord';
        id: string;
        vehicleId?: string | null;
        serviceDate: string;
        maintenanceCompletionTypeId: string;
        completedBy?: string | null;
        meterReading?: string | null;
        laborHours?: string | null;
        totalCost?: string | null;
        partsUsed?: string | null;
        notes?: string | null;
        services: Array<string>;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    };
};

export type UpdateMaintenanceRecordMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
    input: Types.MaintenanceRecordUpdateInput;
}>;

export type UpdateMaintenanceRecordMutation = {
    __typename?: 'Mutation';
    updateMaintenanceRecord?: {
        __typename?: 'MaintenanceRecord';
        id: string;
        vehicleId?: string | null;
        serviceDate: string;
        maintenanceCompletionTypeId: string;
        completedBy?: string | null;
        meterReading?: string | null;
        laborHours?: string | null;
        totalCost?: string | null;
        partsUsed?: string | null;
        notes?: string | null;
        services: Array<string>;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type DeleteMaintenanceRecordMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type DeleteMaintenanceRecordMutation = { __typename?: 'Mutation'; deleteMaintenanceRecord: boolean };

export const MaintenanceRecordsDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'MaintenanceRecords' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '100' } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '0' } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maintenanceRecords' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'limit' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'offset' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'MaintenanceRecordFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'MaintenanceRecordFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MaintenanceRecord' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'serviceDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'maintenanceCompletionTypeId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'completedBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'meterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'laborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'partsUsed' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'services' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<MaintenanceRecordsQuery, MaintenanceRecordsQueryVariables>;
export const MaintenanceRecordDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'MaintenanceRecord' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maintenanceRecord' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'MaintenanceRecordFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'MaintenanceRecordFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MaintenanceRecord' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'serviceDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'maintenanceCompletionTypeId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'completedBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'meterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'laborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'partsUsed' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'services' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<MaintenanceRecordQuery, MaintenanceRecordQueryVariables>;
export const CreateMaintenanceRecordDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'CreateMaintenanceRecord' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'MaintenanceRecordCreateInput' } } } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createMaintenanceRecord' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'MaintenanceRecordFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'MaintenanceRecordFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MaintenanceRecord' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'serviceDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'maintenanceCompletionTypeId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'completedBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'meterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'laborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'partsUsed' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'services' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<CreateMaintenanceRecordMutation, CreateMaintenanceRecordMutationVariables>;
export const UpdateMaintenanceRecordDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'UpdateMaintenanceRecord' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'MaintenanceRecordUpdateInput' } } } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updateMaintenanceRecord' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'MaintenanceRecordFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'MaintenanceRecordFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MaintenanceRecord' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'serviceDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'maintenanceCompletionTypeId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'completedBy' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'meterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'laborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'totalCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'partsUsed' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'services' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<UpdateMaintenanceRecordMutation, UpdateMaintenanceRecordMutationVariables>;
export const DeleteMaintenanceRecordDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteMaintenanceRecord' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'deleteMaintenanceRecord' }, arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }] }]
            }
        }
    ]
} as unknown as DocumentNode<DeleteMaintenanceRecordMutation, DeleteMaintenanceRecordMutationVariables>;
