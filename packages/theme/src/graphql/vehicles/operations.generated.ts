import * as Types from '../../types/graphql';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type VehiclesQueryVariables = Types.Exact<{
    limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
    offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type VehiclesQuery = {
    __typename?: 'Query';
    vehicles: Array<{
        __typename?: 'Vehicle';
        id: string;
        unitNumber: string;
        make?: string | null;
        model?: string | null;
        year?: number | null;
        plateNumber?: string | null;
        vin?: string | null;
        tireSize?: string | null;
        lessorOwner?: string | null;
        registrationExpires?: string | null;
        inspectionExpires?: string | null;
        status: string;
        mileage?: number | null;
        driverId?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    }>;
};

export type VehicleQueryVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type VehicleQuery = {
    __typename?: 'Query';
    vehicle?: {
        __typename?: 'Vehicle';
        id: string;
        unitNumber: string;
        make?: string | null;
        model?: string | null;
        year?: number | null;
        plateNumber?: string | null;
        vin?: string | null;
        tireSize?: string | null;
        lessorOwner?: string | null;
        registrationExpires?: string | null;
        inspectionExpires?: string | null;
        status: string;
        mileage?: number | null;
        driverId?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type CreateVehicleMutationVariables = Types.Exact<{
    input: Types.VehicleCreateInput;
}>;

export type CreateVehicleMutation = {
    __typename?: 'Mutation';
    createVehicle: {
        __typename?: 'Vehicle';
        id: string;
        unitNumber: string;
        make?: string | null;
        model?: string | null;
        year?: number | null;
        plateNumber?: string | null;
        vin?: string | null;
        tireSize?: string | null;
        lessorOwner?: string | null;
        registrationExpires?: string | null;
        inspectionExpires?: string | null;
        status: string;
        mileage?: number | null;
        driverId?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    };
};

export type UpdateVehicleMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
    input: Types.VehicleUpdateInput;
}>;

export type UpdateVehicleMutation = {
    __typename?: 'Mutation';
    updateVehicle?: {
        __typename?: 'Vehicle';
        id: string;
        unitNumber: string;
        make?: string | null;
        model?: string | null;
        year?: number | null;
        plateNumber?: string | null;
        vin?: string | null;
        tireSize?: string | null;
        lessorOwner?: string | null;
        registrationExpires?: string | null;
        inspectionExpires?: string | null;
        status: string;
        mileage?: number | null;
        driverId?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type DeleteVehicleMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type DeleteVehicleMutation = { __typename?: 'Mutation'; deleteVehicle: boolean };

export const VehiclesDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Vehicles' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '10' } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '0' } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vehicles' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'limit' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'offset' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'VehicleFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'VehicleFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Vehicle' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'unitNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'make' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'plateNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vin' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tireSize' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lessorOwner' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'registrationExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inspectionExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'mileage' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<VehiclesQuery, VehiclesQueryVariables>;
export const VehicleDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Vehicle' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vehicle' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'VehicleFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'VehicleFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Vehicle' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'unitNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'make' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'plateNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vin' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tireSize' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lessorOwner' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'registrationExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inspectionExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'mileage' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<VehicleQuery, VehicleQueryVariables>;
export const CreateVehicleDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'CreateVehicle' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'VehicleCreateInput' } } } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createVehicle' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'VehicleFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'VehicleFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Vehicle' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'unitNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'make' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'plateNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vin' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tireSize' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lessorOwner' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'registrationExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inspectionExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'mileage' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<CreateVehicleMutation, CreateVehicleMutationVariables>;
export const UpdateVehicleDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'UpdateVehicle' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'VehicleUpdateInput' } } } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updateVehicle' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'VehicleFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'VehicleFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Vehicle' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'unitNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'make' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'plateNumber' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vin' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tireSize' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lessorOwner' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'registrationExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'inspectionExpires' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'mileage' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'driverId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<UpdateVehicleMutation, UpdateVehicleMutationVariables>;
export const DeleteVehicleDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteVehicle' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'deleteVehicle' }, arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }] }]
            }
        }
    ]
} as unknown as DocumentNode<DeleteVehicleMutation, DeleteVehicleMutationVariables>;
