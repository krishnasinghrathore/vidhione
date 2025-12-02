import { gql } from '@apollo/client';

// Authentication Queries
export const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            user {
                id
                email
                firstName
                lastName
                isActive
                emailConfirmed
                phoneNumber
                phoneNumberConfirmed
                twoFactorEnabled
                lastLoginAt
                createdAt
                updatedAt
                company {
                    id
                    name
                    address
                    city
                    state
                    country
                    zipCode
                    phone
                    mobile
                    email
                    altPhone
                    altEmail
                    website
                    isProfileComplete
                    isActive
                    businessNature {
                        id
                        name
                        isActive
                    }
                }
                roles {
                    id
                    name
                    normalizedName
                    isActive
                    permissions {
                        id
                        name
                        description
                        resource
                        action
                        isActive
                    }
                }
                permissions {
                    id
                    name
                    description
                    resource
                    action
                    isActive
                }
            }
            token
            refreshToken
            expiresAt
        }
    }
`;

export const REGISTER_MUTATION = gql`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
            user {
                id
                email
                firstName
                lastName
                isActive
                emailConfirmed
                phoneNumber
                createdAt
                updatedAt
                company {
                    id
                    name
                    address
                    city
                    state
                    country
                    zipCode
                    phone
                    mobile
                    email
                    isProfileComplete
                    isActive
                }
            }
            emailVerificationRequired
            message
        }
    }
`;

export const VERIFY_EMAIL_MUTATION = gql`
    mutation VerifyEmail($input: VerifyEmailInput!) {
        verifyEmail(input: $input) {
            success
            message
        }
    }
`;

export const RESEND_EMAIL_VERIFICATION_MUTATION = gql`
    mutation ResendEmailVerification($email: String!) {
        resendEmailVerification(email: $email) {
            success
            message
        }
    }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
    mutation ForgotPassword($input: ForgotPasswordInput!) {
        forgotPassword(input: $input) {
            success
            message
        }
    }
`;

export const RESET_PASSWORD_MUTATION = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
        resetPassword(input: $input) {
            success
            message
        }
    }
`;

export const REFRESH_TOKEN_MUTATION = gql`
    mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
            user {
                id
                email
                firstName
                lastName
                isActive
                company {
                    id
                    name
                }
                roles {
                    id
                    name
                }
            }
            token
            refreshToken
            expiresAt
        }
    }
`;

export const LOGOUT_MUTATION = gql`
    mutation Logout {
        logout
    }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
        changePassword(input: $input)
    }
`;

// User Queries
export const ME_QUERY = gql`
    query Me {
        me {
            id
            email
            firstName
            lastName
            isActive
            emailConfirmed
            phoneNumber
            phoneNumberConfirmed
            twoFactorEnabled
            lastLoginAt
            createdAt
            updatedAt
            company {
                id
                name
                address
                city
                state
                country
                zipCode
                phone
                mobile
                email
                altPhone
                altEmail
                website
                isProfileComplete
                isActive
                businessNature {
                    id
                    name
                    isActive
                }
            }
            roles {
                id
                name
                normalizedName
                isActive
                permissions {
                    id
                    name
                    description
                    resource
                    action
                    isActive
                }
            }
            permissions {
                id
                name
                description
                resource
                action
                isActive
            }
        }
    }
`;

export const VALIDATE_TOKEN_QUERY = gql`
    query ValidateToken {
        validateToken
    }
`;

// User Invitations
export const CREATE_INVITATION_MUTATION = gql`
    mutation CreateInvitation($input: CreateInvitationInput!) {
        createInvitation(input: $input) {
            success
            message
            invitation {
                id
                email
                token
                expiresAt
                isUsed
                createdAt
                company {
                    id
                    name
                }
                role {
                    id
                    name
                }
                invitedBy {
                    id
                    email
                    firstName
                    lastName
                }
            }
        }
    }
`;

export const ACCEPT_INVITATION_MUTATION = gql`
    mutation AcceptInvitation($input: AcceptInvitationInput!) {
        acceptInvitation(input: $input) {
            success
            message
            user {
                id
                email
                firstName
                lastName
                isActive
                company {
                    id
                    name
                }
                roles {
                    id
                    name
                }
            }
            token
        }
    }
`;

export const USER_INVITATIONS_QUERY = gql`
    query UserInvitations($limit: Int, $offset: Int, $companyId: ID, $isUsed: Boolean) {
        userInvitations(limit: $limit, offset: $offset, companyId: $companyId, isUsed: $isUsed) {
            id
            email
            token
            expiresAt
            isUsed
            createdAt
            updatedAt
            company {
                id
                name
            }
            role {
                id
                name
            }
            invitedBy {
                id
                email
                firstName
                lastName
            }
        }
    }
`;

export const USER_INVITATION_BY_TOKEN_QUERY = gql`
    query UserInvitationByToken($token: String!) {
        userInvitationByToken(token: $token) {
            id
            email
            token
            expiresAt
            isUsed
            createdAt
            company {
                id
                name
                address
                city
                state
                country
                businessNature {
                    id
                    name
                }
            }
            role {
                id
                name
                description
            }
            invitedBy {
                id
                email
                firstName
                lastName
            }
        }
    }
`;

// User Management Queries
export const GET_USERS_QUERY = gql`
    query GetUsers($limit: Int, $offset: Int, $search: String, $companyId: ID, $isActive: Boolean) {
        users(limit: $limit, offset: $offset, search: $search, companyId: $companyId, isActive: $isActive) {
            id
            email
            firstName
            lastName
            isActive
            emailConfirmed
            phoneNumber
            lastLoginAt
            createdAt
            updatedAt
            company {
                id
                name
            }
            roles {
                id
                name
            }
        }
    }
`;

export const GET_USER_QUERY = gql`
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            email
            firstName
            lastName
            isActive
            emailConfirmed
            phoneNumber
            lastLoginAt
            createdAt
            updatedAt
            company {
                id
                name
            }
            roles {
                id
                name
            }
        }
    }
`;

export const CREATE_USER_MUTATION = gql`
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            id
            email
            firstName
            lastName
            isActive
            emailConfirmed
            phoneNumber
            createdAt
            updatedAt
            company {
                id
                name
            }
            roles {
                id
                name
            }
        }
    }
`;

export const UPDATE_USER_MUTATION = gql`
    mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
            id
            email
            firstName
            lastName
            isActive
            emailConfirmed
            phoneNumber
            updatedAt
            company {
                id
                name
            }
            roles {
                id
                name
            }
        }
    }
`;

export const DELETE_USER_MUTATION = gql`
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
    }
`;

// Company Management Queries
export const GET_COMPANIES_QUERY = gql`
    query GetCompanies($limit: Int, $offset: Int, $search: String, $isActive: Boolean) {
        companies(limit: $limit, offset: $offset, search: $search, isActive: $isActive) {
            id
            name
            address
            city
            state
            country
            zipCode
            phone
            mobile
            email
            isProfileComplete
            isActive
            businessNature {
                id
                name
            }
            createdAt
            updatedAt
        }
    }
`;

export const GET_COMPANY_QUERY = gql`
    query GetCompany($id: ID!) {
        company(id: $id) {
            id
            name
            address
            city
            state
            country
            zipCode
            phone
            mobile
            email
            isProfileComplete
            isActive
            businessNature {
                id
                name
            }
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_COMPANY_MUTATION = gql`
    mutation CreateCompany($input: CreateCompanyInput!) {
        createCompany(input: $input) {
            id
            name
            address
            city
            state
            country
            zipCode
            phone
            mobile
            email
            isProfileComplete
            isActive
            businessNature {
                id
                name
            }
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_COMPANY_MUTATION = gql`
    mutation UpdateCompany($input: UpdateCompanyInput!) {
        updateCompany(input: $input) {
            id
            name
            address
            city
            state
            country
            zipCode
            phone
            mobile
            email
            isProfileComplete
            isActive
            businessNature {
                id
                name
            }
            updatedAt
        }
    }
`;

export const DELETE_COMPANY_MUTATION = gql`
    mutation DeleteCompany($id: ID!) {
        deleteCompany(id: $id)
    }
`;

// Role Management Queries
export const GET_ROLES_QUERY = gql`
    query GetRoles($limit: Int, $offset: Int, $search: String, $isActive: Boolean) {
        roles(limit: $limit, offset: $offset, search: $search, isActive: $isActive) {
            id
            name
            normalizedName
            isActive
            userCount
            permissions {
                id
                name
                description
                resource
                action
            }
            createdAt
            updatedAt
        }
    }
`;

export const GET_ROLE_QUERY = gql`
    query GetRole($id: ID!) {
        role(id: $id) {
            id
            name
            normalizedName
            isActive
            userCount
            permissions {
                id
                name
                description
                resource
                action
            }
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_ROLE_MUTATION = gql`
    mutation CreateRole($input: CreateRoleInput!) {
        createRole(input: $input) {
            id
            name
            normalizedName
            isActive
            userCount
            permissions {
                id
                name
                description
                resource
                action
            }
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_ROLE_MUTATION = gql`
    mutation UpdateRole($input: UpdateRoleInput!) {
        updateRole(input: $input) {
            id
            name
            normalizedName
            isActive
            userCount
            permissions {
                id
                name
                description
                resource
                action
            }
            updatedAt
        }
    }
`;

export const DELETE_ROLE_MUTATION = gql`
    mutation DeleteRole($id: ID!) {
        deleteRole(id: $id)
    }
`;

// Statistics and Analytics
export const AUTH_STATS_QUERY = gql`
    query AuthStats {
        authStats {
            totalUsers
            activeUsers
            totalCompanies
            activeCompanies
            totalRoles
            recentLogins
            failedLoginAttempts
        }
    }
`;
