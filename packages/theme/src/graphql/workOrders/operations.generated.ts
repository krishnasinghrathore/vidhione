import * as Types from '../../types/graphql';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type WorkOrdersQueryVariables = Types.Exact<{
    limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
    offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type WorkOrdersQuery = {
    __typename?: 'Query';
    workOrders: Array<{
        __typename?: 'WorkOrder';
        id: string;
        number: string;
        vehicleId: string;
        taskName: string;
        description?: string | null;
        priority: string;
        dueDate?: string | null;
        dueMeterReading?: string | null;
        estLaborHours?: string | null;
        estCost?: string | null;
        status: string;
        assignedTo?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    }>;
};

export type WorkOrderQueryVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type WorkOrderQuery = {
    __typename?: 'Query';
    workOrder?: {
        __typename?: 'WorkOrder';
        id: string;
        number: string;
        vehicleId: string;
        taskName: string;
        description?: string | null;
        priority: string;
        dueDate?: string | null;
        dueMeterReading?: string | null;
        estLaborHours?: string | null;
        estCost?: string | null;
        status: string;
        assignedTo?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type CreateWorkOrderMutationVariables = Types.Exact<{
    input: Types.WorkOrderCreateInput;
}>;

export type CreateWorkOrderMutation = {
    __typename?: 'Mutation';
    createWorkOrder: {
        __typename?: 'WorkOrder';
        id: string;
        number: string;
        vehicleId: string;
        taskName: string;
        description?: string | null;
        priority: string;
        dueDate?: string | null;
        dueMeterReading?: string | null;
        estLaborHours?: string | null;
        estCost?: string | null;
        status: string;
        assignedTo?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    };
};

export type UpdateWorkOrderMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
    input: Types.WorkOrderUpdateInput;
}>;

export type UpdateWorkOrderMutation = {
    __typename?: 'Mutation';
    updateWorkOrder?: {
        __typename?: 'WorkOrder';
        id: string;
        number: string;
        vehicleId: string;
        taskName: string;
        description?: string | null;
        priority: string;
        dueDate?: string | null;
        dueMeterReading?: string | null;
        estLaborHours?: string | null;
        estCost?: string | null;
        status: string;
        assignedTo?: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
    } | null;
};

export type DeleteWorkOrderMutationVariables = Types.Exact<{
    id: Types.Scalars['ID']['input'];
}>;

export type DeleteWorkOrderMutation = { __typename?: 'Mutation'; deleteWorkOrder: boolean };

export const WorkOrdersDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'WorkOrders' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '10' } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } }, defaultValue: { kind: 'IntValue', value: '0' } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'workOrders' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'limit' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'offset' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WorkOrderFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WorkOrderFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WorkOrder' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'taskName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueMeterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estLaborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'assignedTo' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<WorkOrdersQuery, WorkOrdersQueryVariables>;
export const WorkOrderDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'WorkOrder' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'workOrder' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WorkOrderFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WorkOrderFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WorkOrder' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'taskName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueMeterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estLaborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'assignedTo' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<WorkOrderQuery, WorkOrderQueryVariables>;
export const CreateWorkOrderDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'CreateWorkOrder' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'WorkOrderCreateInput' } } } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createWorkOrder' },
                        arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WorkOrderFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WorkOrderFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WorkOrder' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'taskName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueMeterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estLaborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'assignedTo' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<CreateWorkOrderMutation, CreateWorkOrderMutationVariables>;
export const UpdateWorkOrderDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'UpdateWorkOrder' },
            variableDefinitions: [
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } },
                { kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'WorkOrderUpdateInput' } } } }
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updateWorkOrder' },
                        arguments: [
                            { kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } },
                            { kind: 'Argument', name: { kind: 'Name', value: 'input' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } } }
                        ],
                        selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'WorkOrderFields' } }] }
                    }
                ]
            }
        },
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'WorkOrderFields' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'WorkOrder' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'vehicleId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'taskName' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'dueMeterReading' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estLaborHours' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'estCost' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'assignedTo' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'deletedAt' } }
                ]
            }
        }
    ]
} as unknown as DocumentNode<UpdateWorkOrderMutation, UpdateWorkOrderMutationVariables>;
export const DeleteWorkOrderDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'DeleteWorkOrder' },
            variableDefinitions: [{ kind: 'VariableDefinition', variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }, type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } } }],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'deleteWorkOrder' }, arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'id' }, value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } } }] }]
            }
        }
    ]
} as unknown as DocumentNode<DeleteWorkOrderMutation, DeleteWorkOrderMutationVariables>;
