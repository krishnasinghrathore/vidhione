export const typeDefs = `#graphql
  # Core root queries for health and diagnostics
  extend type Query {
    hello: String!
    health: String!
    dbVersion: String
    systemConfig: SystemConfig!
  }

  type SystemConfig {
    minDriverAge: Int!
    maxUploadSizeMB: Int!
  }

  input SystemConfigInput {
    minDriverAge: Int
    maxUploadSizeMB: Int
  }

  extend type Mutation {
    updateSystemConfig(input: SystemConfigInput!): SystemConfig!
  }
`;
