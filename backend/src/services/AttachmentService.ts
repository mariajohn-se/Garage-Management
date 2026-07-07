import { Request } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { attachmentRepository } from '../repositories/AttachmentRepository';
import { logUserEvent } from '../auth/userlog';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { Attachment } from '../models/Document';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx']);
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export class AttachmentService {
  async list(filters: { type?: string; codes?: string; page: number; limit: number }) {
    return attachmentRepository.list(filters);
  }

  async get(id: number): Promise<Attachment> {
    const attachment = await attachmentRepository.findById(id);
    if (!attachment) throw new NotFoundError('Attachment not found.');
    return attachment;
  }

  validateUpload(file: { originalname: string; size: number }): void {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new ValidationError(`File type ${ext || '(none)'} is not allowed.`, 'INVALID_FILE_TYPE');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('File exceeds the 15MB size limit.', 'FILE_TOO_LARGE');
    }
  }

  async create(
    req: Request,
    input: { type: string | null; codes: string | null; remarks: string | null; relativePath: string }
  ): Promise<number> {
    const id = await attachmentRepository.create({
      type: input.type,
      codes: input.codes,
      remarks: input.remarks,
      path: input.relativePath
    });
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Attachment Uploaded',
      remarks: `Uploaded attachment ${input.relativePath}`
    });
    return id;
  }

  async update(req: Request, id: number, changes: { type?: string; codes?: string; remarks?: string }): Promise<void> {
    const existing = await attachmentRepository.findById(id);
    if (!existing) throw new NotFoundError('Attachment not found.');
    await attachmentRepository.update(id, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Attachment Updated',
      remarks: `Updated attachment ${id}: ${JSON.stringify(changes)}`
    });
  }

  /**
   * BR-35: deletions are non-restorable and standard users cannot delete - enforced by the
   * Supervisor/Administrator RBAC gate on the route, checked again here defensively.
   */
  async delete(req: Request, id: number): Promise<void> {
    if (!req.user?.roles.some((r) => r === 'Supervisor' || r === 'Administrator')) {
      throw new ForbiddenError('Only a supervisor or administrator can delete attachments.');
    }
    const existing = await attachmentRepository.findById(id);
    if (!existing) throw new NotFoundError('Attachment not found.');
    await attachmentRepository.delete(id);
    if (!existing.isLegacyPath && existing.path) {
      const absolutePath = path.join(process.cwd(), existing.path.replace(/^\//, ''));
      await fs.unlink(absolutePath).catch(() => undefined);
    }
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Attachment Deleted',
      remarks: `Deleted attachment ${id}`
    });
  }
}

export const attachmentService = new AttachmentService();
