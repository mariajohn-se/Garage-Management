import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { attachmentService } from '../services/AttachmentService';
import { ValidationError } from '../utils/errors';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
  }
});

export const uploadMiddleware = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }).single('file');

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class AttachmentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, codes } = req.query;
      const result = await attachmentService.list({
        type: type as string | undefined,
        codes: codes as string | undefined,
        ...parsePaging(req)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await attachmentService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('A file is required.');
      attachmentService.validateUpload(req.file);
      const { type, codes, remarks } = req.body ?? {};
      const relativePath = `/uploads/${req.file.filename}`;
      const id = await attachmentService.create(req, {
        type: type ?? null,
        codes: codes ?? null,
        remarks: remarks ?? null,
        relativePath
      });
      res.status(201).json({ id, path: relativePath });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await attachmentService.update(req, Number(req.params.id), req.body ?? {});
      res.json({ message: 'Attachment updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await attachmentService.delete(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const attachment = await attachmentService.get(Number(req.params.id));
      if (attachment.isLegacyPath || !attachment.path) {
        throw new ValidationError(
          'This attachment points to a legacy local file path from the original desktop app and cannot be served by this server.',
          'LEGACY_FILE_UNAVAILABLE'
        );
      }
      res.download(path.join(process.cwd(), attachment.path.replace(/^\//, '')));
    } catch (err) {
      next(err);
    }
  }
}

export const attachmentController = new AttachmentController();
