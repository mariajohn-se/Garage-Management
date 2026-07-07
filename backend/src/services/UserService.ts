import { Request } from 'express';
import { userRepository } from '../repositories/UserRepository';
import { hashPassword, validatePasswordPolicy } from '../auth/password';
import { checkAccountLocked, unlockAccount } from '../auth/userSessionStore';
import { logUserEvent } from '../auth/userlog';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { Role, UserListItem, MenuPermission } from '../models/User';

export class UserService {
  async listUsers(filters: { name?: string; role?: Role; status?: 'active' | 'inactive' }): Promise<UserListItem[]> {
    const users = await userRepository.listUsers(filters);
    return users.map((u) => ({ ...u, isLocked: checkAccountLocked(u.id) }));
  }

  async createUser(req: Request, input: { username: string; password: string; isAdministrator: boolean }) {
    if (!input.username?.trim()) {
      throw new ValidationError('Username is required.');
    }
    const existing = await userRepository.findByUsername(input.username.trim());
    if (existing) {
      throw new ValidationError('This username is already used.', 'DUPLICATE_USERNAME');
    }
    const policyError = validatePasswordPolicy(input.password ?? '');
    if (policyError) {
      throw new ValidationError(policyError, 'INVALID_PASSWORD');
    }
    const passwordHash = await hashPassword(input.password);
    const newId = await userRepository.createUser({
      username: input.username.trim(),
      passwordHash,
      isAdministrator: input.isAdministrator
    });
    await logUserEvent(req, {
      userId: newId ?? -1,
      userName: input.username.trim(),
      action: 'User Created',
      remarks: `Created by ${req.user?.username ?? 'unknown'}`
    });
    return newId;
  }

  async updateUser(
    req: Request,
    targetUserId: number,
    changes: { isAdministrator?: boolean; isActive?: boolean }
  ): Promise<void> {
    const target = await userRepository.findById(targetUserId);
    if (!target) throw new NotFoundError('User not found.');

    if (req.user?.sub === targetUserId && changes.isAdministrator !== undefined) {
      throw new ForbiddenError('You cannot change your own role.', 'SELF_ROLE_CHANGE');
    }
    if (req.user?.sub === targetUserId && changes.isActive === false) {
      throw new ForbiddenError('You cannot deactivate your own account.', 'SELF_DEACTIVATE');
    }

    await userRepository.updateUser(targetUserId, changes);
    if (changes.isActive !== undefined) unlockAccount(targetUserId);
    await logUserEvent(req, {
      userId: targetUserId,
      userName: target.username,
      action: changes.isAdministrator !== undefined ? 'Role Changed' : 'User Updated',
      remarks: `Updated by ${req.user?.username ?? 'unknown'}: ${JSON.stringify(changes)}`
    });
  }

  async deleteUser(req: Request, targetUserId: number): Promise<void> {
    if (req.user?.sub === targetUserId) {
      throw new ForbiddenError('You cannot delete your own account.', 'SELF_DELETE');
    }
    const target = await userRepository.findById(targetUserId);
    if (!target) throw new NotFoundError('User not found.');
    await userRepository.deleteUser(targetUserId);
    await logUserEvent(req, {
      userId: targetUserId,
      userName: target.username,
      action: 'User Deleted',
      remarks: `Deleted by ${req.user?.username ?? 'unknown'}`
    });
  }

  async adminResetPassword(req: Request, targetUserId: number, newPassword: string): Promise<void> {
    const target = await userRepository.findById(targetUserId);
    if (!target) throw new NotFoundError('User not found.');
    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) throw new ValidationError(policyError, 'INVALID_PASSWORD');

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(targetUserId, passwordHash);
    unlockAccount(targetUserId);
    await logUserEvent(req, {
      userId: targetUserId,
      userName: target.username,
      action: 'Password Reset',
      remarks: `Reset by administrator ${req.user?.username ?? 'unknown'}`
    });
  }

  async getMenuPermissions(username: string): Promise<MenuPermission[]> {
    return userRepository.getMenuPermissionsForUser(username);
  }

  /**
   * FRONTEND_SPEC_v12.md's User List "Import" button is specified only as "opens file
   * dialog/modal" with no field list or format defined. This implements a plain CSV import
   * (username,password,role) rather than leaving the button non-functional - BR-18 (bulk
   * import must check for duplicates) is enforced per row.
   */
  async bulkImportUsers(
    req: Request,
    rows: Array<{ username: string; password: string; role?: string }>
  ): Promise<{ created: number; skipped: Array<{ username: string; reason: string }> }> {
    let created = 0;
    const skipped: Array<{ username: string; reason: string }> = [];
    for (const row of rows) {
      try {
        await this.createUser(req, {
          username: row.username,
          password: row.password,
          isAdministrator: (row.role ?? '').trim().toLowerCase() === 'administrator'
        });
        created++;
      } catch (err) {
        skipped.push({ username: row.username, reason: (err as Error).message });
      }
    }
    return { created, skipped };
  }

  async setMenuPermission(req: Request, username: string, menuId: string, granted: boolean): Promise<void> {
    if (granted) {
      await userRepository.grantMenuPermission(username, menuId);
    } else {
      await userRepository.revokeMenuPermission(username, menuId);
    }
    await logUserEvent(req, {
      userId: req.user?.sub ?? -1,
      userName: username,
      action: granted ? 'Permission Granted' : 'Permission Revoked',
      remarks: `${menuId} ${granted ? 'granted to' : 'revoked from'} ${username} by ${req.user?.username ?? 'unknown'}`
    });
  }
}

export const userService = new UserService();
