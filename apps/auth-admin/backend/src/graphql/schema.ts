import { typeDefs as base } from './modules/_base/typeDefs';
import { typeDefs as core } from './modules/core/typeDefs';
import { typeDefs as auth } from './modules/auth/typeDefs';

// Compose module SDLs similar to the reference modular structure
export const typeDefs = [base, core, auth];
