import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService';
import { userRepository } from '../repositories/UserRepository';
import { employeeRepository } from '../repositories/EmployeeRepository';
import { legacyUserRepository } from '../repositories/LegacyUserRepository';
import { ValidationError, NotFoundError } from '../utils/errors';
import { Role } from '../models/User';

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, role, status } = req.query;
      const users = await userService.listUsers({
        name: name as string | undefined,
        role: role as Role | undefined,
        status: status as 'active' | 'inactive' | undefined
      });
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, roles } = req.body ?? {};
      const id = await userService.createUser(req, {
        username,
        password,
        isAdministrator: Array.isArray(roles) && roles.includes('Administrator')
      });
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, roles } = req.body ?? {};
      await userService.updateUser(req, Number(req.params.id), {
        isActive: status ? status === 'active' : undefined,
        isAdministrator: Array.isArray(roles) ? roles.includes('Administrator') : undefined
      });
      res.json({ message: 'User updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body ?? {};
      if (!status) throw new ValidationError('status is required.');
      await userService.updateUser(req, Number(req.params.id), { isActive: status === 'active' });
      res.json({ message: 'Status updated.' });
    } catch (err) {
      next(err);
    }
  }

  async bulkActivate(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds, status } = req.body ?? {};
      if (!Array.isArray(userIds) || !userIds.length) throw new ValidationError('userIds is required.');
      for (const id of userIds) {
        await userService.updateUser(req, Number(id), { isActive: status === 'active' });
      }
      res.json({ message: `${userIds.length} user(s) updated.` });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword } = req.body ?? {};
      if (!newPassword) throw new ValidationError('newPassword is required.');
      await userService.adminResetPassword(req, Number(req.params.id), newPassword);
      res.json({ message: 'Password updated.' });
    } catch (err) {
      next(err);
    }
  }

  async setRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.body ?? {};
      if (!Array.isArray(roles) || !roles.length) throw new ValidationError('Select at least one role.');
      await userService.updateUser(req, Number(req.params.id), { isAdministrator: roles.includes('Administrator') });
      res.json({ message: 'Roles updated.' });
    } catch (err) {
      next(err);
    }
  }

  async getMenuPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findById(Number(req.params.id));
      if (!user) throw new NotFoundError('User not found.');
      const permissions = await userService.getMenuPermissions(user.username);
      res.json(permissions);
    } catch (err) {
      next(err);
    }
  }

  async setMenuPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { menuId, granted } = req.body ?? {};
      if (!menuId || typeof granted !== 'boolean') {
        throw new ValidationError('menuId and granted are required.');
      }
      const user = await userRepository.findById(Number(req.params.id));
      if (!user) throw new NotFoundError('User not found.');
      await userService.setMenuPermission(req, user.username, menuId, granted);
      res.json({ message: 'Permission updated.' });
    } catch (err) {
      next(err);
    }
  }

  // Frontend reads the selected file as text (FileReader) and posts its content as JSON -
  // avoids a multipart/multer dependency for a CSV-only import the spec left undefined.
  async importUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { csv } = req.body ?? {};
      if (!csv || typeof csv !== 'string') throw new ValidationError('CSV file content is required.');
      const lines = csv
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean);
      const [header, ...dataLines] = lines;
      const columns = header
        .toLowerCase()
        .split(',')
        .map((c: string) => c.trim());
      const usernameIdx = columns.indexOf('username');
      const passwordIdx = columns.indexOf('password');
      const roleIdx = columns.indexOf('role');
      if (usernameIdx === -1 || passwordIdx === -1) {
        throw new ValidationError('CSV must have "username" and "password" columns.');
      }
      const rows = dataLines.map((line: string) => {
        const cells = line.split(',').map((c: string) => c.trim());
        return { username: cells[usernameIdx], password: cells[passwordIdx], role: cells[roleIdx] };
      });
      const result = await userService.bulkImportUsers(req, rows);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async exportUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, role, status } = req.query;
      const users = await userService.listUsers({
        name: name as string | undefined,
        role: role as Role | undefined,
        status: status as 'active' | 'inactive' | undefined
      });
      const header = 'username,roles,status\n';
      const body = users
        .map((u) => `${u.username},${u.roles.join('|')},${u.isActive ? 'active' : 'inactive'}`)
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.send(header + body);
    } catch (err) {
      next(err);
    }
  }

  async employeeHelp(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      res.json(q ? await employeeRepository.search(q as string) : []);
    } catch (err) {
      next(err);
    }
  }

  async employees(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, department, section } = req.query;
      const employees = await employeeRepository.list({
        name: name as string | undefined,
        department: department as string | undefined,
        section: section as string | undefined
      });
      res.json(employees);
    } catch (err) {
      next(err);
    }
  }

  async legacyUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const records = await legacyUserRepository.list();
      res.json(records);
    } catch (err) {
      next(err);
    }
  }

  // "Action Log" (/admin/action-logs) - FRONTEND_SPEC_v12.md describes this as a distinct
  // screen from Phase 1's auth-focused /admin/user-logs, but no separate action-log table
  // exists in DB_CONNECTION_SPEC_v12.md - it reuses the same UserLog table/query.
  async actionLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, dateFrom, dateTo, eventType } = req.query;
      const entries = await userRepository.getUserLog({
        userId: userId ? Number(userId) : undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
        eventType: eventType as string | undefined
      });
      res.json(entries);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
