import { apiRequest } from './client';

export interface MailMessage {
  id: number;
  date: string | null;
  sendTo: string | null;
  subject: string | null;
  msg: string | null;
  sendBy: string | null;
  read: boolean;
  readOn: string | null;
}

export interface SendMessageInput {
  sendTo: string;
  subject: string;
  msg: string;
}

export const messageApi = {
  unreadCount: () => apiRequest<{ count: number }>('/messages/unread-count'),
  inbox: (unreadOnly = false) => apiRequest<MailMessage[]>(`/messages${unreadOnly ? '?unreadOnly=true' : ''}`),
  send: (input: SendMessageInput) => apiRequest<{ message: string }>('/messages', { method: 'POST', body: input }),
  markRead: (id: number) => apiRequest<{ message: string }>(`/messages/${id}/read`, { method: 'PUT' })
};
