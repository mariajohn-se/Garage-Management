import { Request } from 'express';
import { messageRepository } from '../repositories/MessageRepository';
import { NotFoundError, ValidationError } from '../utils/errors';
import { SendMessageInput } from '../models/Message';

export class MessageService {
  async unreadCount(userId: string) {
    return messageRepository.unreadCount(userId);
  }

  async inbox(userId: string, unreadOnly: boolean) {
    return messageRepository.inbox(userId, unreadOnly);
  }

  async send(req: Request, input: SendMessageInput): Promise<void> {
    if (!input.sendTo?.trim()) throw new ValidationError('Recipient is required.');
    if (!input.subject?.trim()) throw new ValidationError('Subject is required.');
    if (!input.msg?.trim()) throw new ValidationError('Message body is required.');
    if (input.sendTo.trim().toLowerCase() === req.user!.username.toLowerCase()) {
      throw new ValidationError('You cannot send a message to yourself.');
    }

    const recipientExists = await messageRepository.recipientExists(input.sendTo);
    if (!recipientExists) {
      throw new ValidationError('Recipient was not found - check the username and try again.');
    }

    await messageRepository.send(input, req.user!.username);
  }

  async markRead(req: Request, id: number): Promise<void> {
    const updated = await messageRepository.markRead(id, req.user!.username);
    if (!updated) throw new NotFoundError('Message not found, or it was not sent to you.');
  }
}

export const messageService = new MessageService();
