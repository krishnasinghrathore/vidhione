export const typeDefs = `#graphql
  """
  Document Types master and per-module assignments
  """
  type DocumentType {
    id: ID!
    name: String!
    allowedExtensions: [String!]!
    active: Boolean!
    createdAt: String
    updatedAt: String
  }

  type DocumentTypeAssignment {
    id: ID!
    documentTypeId: ID!
    module: String!
    mandatory: Boolean!
    active: Boolean!
    createdAt: String
    updatedAt: String
    documentType: DocumentType
  }

  """
  Stored document metadata (files live on local filesystem for now)
  """
  type Document {
    id: ID!
    module: String!
    entityId: ID!
    documentTypeId: ID!
    originalFilename: String!
    mimeType: String!
    fileExt: String!
    fileSizeBytes: Int!
    storagePath: String!
    uploadedAt: String!
    uploadedBy: ID
    deletedAt: String
    documentType: DocumentType
  }

  """
  Archived document metadata (cold storage)
  Mirrors Document plus archived metadata.
  """
  type ArchivedDocument {
    id: ID!
    module: String!
    entityId: ID!
    documentTypeId: ID!
    originalFilename: String!
    mimeType: String!
    fileExt: String!
    fileSizeBytes: Int!
    storagePath: String!
    uploadedAt: String!
    uploadedBy: ID
    # Relax to nullable to avoid hard failures when legacy rows have null archived_date
    archivedDate: String
    archivedByUser: ID
    documentType: DocumentType
  }

  # Queries
  extend type Query {
    # Admin list for CRUD (includes inactive when includeInactive = true)
    documentTypesAdmin(includeInactive: Boolean = true): [DocumentType!]!
  
    # Per-module assignments
    documentTypeAssignmentsByModule(module: String!): [DocumentTypeAssignment!]!
  
    # List documents for an entity (soft-deleted excluded by default)
    listDocuments(module: String!, entityId: ID!, includeDeleted: Boolean = false): [Document!]!
 
    # List archived documents for a specific entity (admin only)
    listArchivedDocuments(module: String!, entityId: ID!): [ArchivedDocument!]!

    # Module-wise archived list (admin only). When entityId is provided, filters to that entity.
    listArchivedByModule(module: String!, entityId: ID, limit: Int = 100, offset: Int = 0): [ArchivedDocument!]!
  
    # Computed helper for UI to check required docs
    missingMandatoryDocuments(module: String!, entityId: ID!): [DocumentType!]!
  }

  # Inputs
  input DocumentTypeCreateInput {
    name: String!
    allowedExtensions: [String!]!
    active: Boolean
  }

  input DocumentTypeUpdateInput {
    name: String
    allowedExtensions: [String!]
    active: Boolean
  }

  input DocumentTypeAssignmentUpsertInput {
    documentTypeId: ID!
    module: String!
    mandatory: Boolean
    active: Boolean
  }
  
  """
  Base64 upload (no multipart) to keep client simple and avoid extra middleware.
  contentBase64 should be raw base64 (data URL prefix is allowed; server will strip).
  """
  input UploadDocumentInput {
    module: String!
    entityId: ID!
    documentTypeId: ID!
    fileName: String!
    mimeType: String!
    contentBase64: String!
  }

  # Mutations
  extend type Mutation {
    # Admin CRUD
    createDocumentType(input: DocumentTypeCreateInput!): DocumentType!
    updateDocumentType(id: ID!, input: DocumentTypeUpdateInput!): DocumentType
    deleteDocumentType(id: ID!): Boolean!
  
    upsertDocumentTypeAssignment(input: DocumentTypeAssignmentUpsertInput!): DocumentTypeAssignment!
    deleteDocumentTypeAssignment(id: ID!): Boolean!
  
    # Documents
    uploadDocument(input: UploadDocumentInput!): Document!
    deleteDocument(id: ID!): Boolean!
    archiveDocument(id: ID!): Boolean!
    restoreArchivedDocument(id: ID!): Boolean!
  }
`;