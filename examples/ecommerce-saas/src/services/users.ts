// examples/ecommerce-saas/src/services/users.ts

import {
  _compactIncludes,
  demoUsers,
  _nextId,
  type DemoUserRole,
} from './demo-data.js';

export interface User {
  id:        string;
  email:     string;
  name:      string;
  role:      DemoUserRole;
  createdAt: Date;
}

// ── Safe reads ─────────────────────────────────────────────────────────────────

/** Find a user by their email address. */
export async function getUserByEmail(email: string): Promise<User | null> {
  return demoUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

/** Get a user by ID. */
export async function getUserById(userId: string): Promise<User | null> {
  return demoUsers.find(user => user.id === userId) ?? null;
}

/** List all users with optional role filter. */
export async function listUsers(role?: User['role']): Promise<User[]> {
  return role ? demoUsers.filter(user => user.role === role) : [...demoUsers];
}

/** Search users by name or email fragment. */
export async function searchUsers(query: string): Promise<User[]> {
  return demoUsers.filter(user =>
    _compactIncludes(user.name, query) ||
    _compactIncludes(user.email, query)
  );
}

// ── Mutations (REQUIRES_CONFIRMATION) ─────────────────────────────────────────

/**
 * Registers a new user account.
 * @param email    - User's email address
 * @param name     - Full name
 * @param password - Hashed password
 */
export async function registerUser(
  email:    string,
  name:     string,
  password: string
): Promise<User> {
  const existing = await getUserByEmail(email);
  if (existing) return existing;

  const user: User & { status: 'active' } = {
    id: _nextId('user', demoUsers.length),
    email,
    name,
    role: 'customer',
    status: 'active' as const,
    createdAt: new Date(),
  };
  demoUsers.push(user);
  return user;
}

/**
 * Authenticates a user and returns a session token.
 * @param email    - User email
 * @param password - User password
 */
export async function authenticateUser(
  email:    string,
  password: string
): Promise<{ token: string; user: User }> {
  const user = await getUserByEmail(email) ?? await registerUser(email, 'Demo User', password);
  return {
    token: `demo_session_${user.id}`,
    user,
  };
}

/**
 * Updates a user's role (admin action).
 * @param userId  - Target user
 * @param newRole - New role to assign
 */
export async function updateUserRole(userId: string, newRole: User['role']): Promise<User> {
  const user = demoUsers.find(item => item.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);
  user.role = newRole;
  return user;
}

/**
 * Suspends a user account.
 * @param userId - Target user
 * @param reason - Reason for suspension
 */
export async function suspendUser(userId: string, reason: string): Promise<User> {
  const user = demoUsers.find(item => item.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);
  user.status = 'suspended';
  return user;
}

/**
 * Sends a password reset email.
 */
export async function initiatePasswordReset(email: string): Promise<{ email: string; resetId: string }> {
  const user = await getUserByEmail(email);
  if (!user) throw new Error(`User not found for email: ${email}`);
  return { email, resetId: `reset_${user.id}` };
}

/**
 * Invites a new team member by email.
 */
export async function inviteTeamMember(email: string, role: User['role']): Promise<{ email: string; role: User['role']; inviteId: string }> {
  return { email, role, inviteId: `invite_${Date.now()}` };
}
