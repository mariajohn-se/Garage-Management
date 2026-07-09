import { queryView, callProcedure, executeWrite } from '../db/callProcedure';
import { MailMessage, SendMessageInput } from '../models/Message';

interface MailRow {
  ID: number;
  Date: string | null;
  SendTo: string | null;
  Subject: string | null;
  Msg: string | null;
  SendBy: string | null;
  Read: number | null;
  ReadOn: string | null;
}

function toMessage(row: MailRow): MailMessage {
  return {
    id: row.ID,
    date: row.Date,
    sendTo: row.SendTo,
    subject: row.Subject,
    msg: row.Msg,
    sendBy: row.SendBy,
    read: !!row.Read,
    readOn: row.ReadOn
  };
}

export class MessageRepository {
  /** Real SP, verified live - returns the count of unread messages for a user. */
  async unreadCount(userId: string): Promise<number> {
    const rows = await callProcedure<{ MailCount: number }>('MailCheck', { mUserID: userId });
    return rows[0]?.MailCount ?? 0;
  }

  /** Real SP, verified live - Option=1 returns the full inbox, Option=0 unread-only. */
  async inbox(userId: string, unreadOnly: boolean): Promise<MailMessage[]> {
    const rows = await callProcedure<MailRow>('MailRead', { Uid: userId, Option: unreadOnly ? 0 : 1 });
    return rows.map(toMessage).sort((a, b) => (b.date && a.date ? Date.parse(b.date) - Date.parse(a.date) : 0));
  }

  async recipientExists(username: string): Promise<boolean> {
    const rows = await queryView<{ User: string }>('SELECT [User] FROM USERS WHERE [User] = @username', {
      username
    });
    return rows.length > 0;
  }

  /** ID is a real IDENTITY column - never inserted explicitly. */
  async send(input: SendMessageInput, fromUser: string): Promise<void> {
    await executeWrite(
      `INSERT INTO MailTable ([Key], Date, SendTo, Subject, Msg, SendBy, [Read], ReadOn)
       VALUES (1, GETDATE(), @sendTo, @subject, @msg, @sendBy, 0, NULL)`,
      { sendTo: input.sendTo, subject: input.subject, msg: input.msg, sendBy: fromUser }
    );
  }

  /**
   * Ownership check (SendTo = the requesting user) so one user can't mark another's mail read.
   * Checked as a separate read first - executeWrite doesn't surface rowsAffected, so an
   * unowned/nonexistent ID would otherwise UPDATE zero rows and still report success.
   */
  async markRead(id: number, userId: string): Promise<boolean> {
    const owned = await queryView<{ ID: number }>('SELECT ID FROM MailTable WHERE ID = @id AND SendTo = @userId', {
      id,
      userId
    });
    if (!owned.length) return false;
    await executeWrite(`UPDATE MailTable SET [Read] = 1, ReadOn = GETDATE() WHERE ID = @id`, { id });
    return true;
  }
}

export const messageRepository = new MessageRepository();
