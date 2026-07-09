/**
 * VERIFIED against the live database (2026-07-09): MailTable (335 real rows, ID is a genuine
 * IDENTITY column - left off every insert) backs the PRD's Messaging module. MailCheck
 * (@mUserID) returns an unread count; MailRead (@Uid, @Option) returns the full inbox when
 * Option=1 or unread-only when Option=0 - both real, working procedures, verified live.
 * SendTo/SendBy are plain username strings with no FK/view join (no invisible-row risk here,
 * unlike every other Tier-1 write built this session) - recipients are validated against the
 * live USERS table only as a typo guard for new messages, not because a mismatch would hide
 * the row.
 */
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
