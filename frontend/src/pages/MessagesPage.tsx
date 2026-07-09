import { FormEvent, useEffect, useState } from 'react';
import { messageApi, MailMessage } from '../api/messageApi';
import { ApiError } from '../api/client';

export function MessagesPage() {
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [composing, setComposing] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  const [composeError, setComposeError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    messageApi
      .inbox(unreadOnly)
      .then(setMessages)
      .catch(() => setError('Unable to load messages. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [unreadOnly]);

  async function handleMarkRead(id: number) {
    try {
      await messageApi.markRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    } catch {
      // best-effort - leave the message as-is if this fails
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setComposeError(null);
    setSending(true);
    try {
      await messageApi.send({ sendTo: sendTo.trim(), subject: subject.trim(), msg: msg.trim() });
      setSendTo('');
      setSubject('');
      setMsg('');
      setComposing(false);
      load();
    } catch (err) {
      setComposeError(err instanceof ApiError ? err.message : 'Unable to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Messages</h2>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setComposing((c) => !c)}>
          {composing ? 'Cancel' : 'Compose'}
        </button>
      </div>

      {composing && (
        <form
          onSubmit={handleSend}
          style={{
            margin: 'var(--space-4) 0',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {composeError && <div className="alert alert-error">{composeError}</div>}
          <div className="form-group">
            <label htmlFor="msg-form-to">To (username)</label>
            <input
              id="msg-form-to"
              className="form-input"
              value={sendTo}
              disabled={sending}
              onChange={(e) => setSendTo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="msg-form-subject">Subject</label>
            <input
              id="msg-form-subject"
              className="form-input"
              value={subject}
              disabled={sending}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="msg-form-body">Message</label>
            <textarea
              id="msg-form-body"
              className="form-input"
              rows={4}
              value={msg}
              disabled={sending}
              onChange={(e) => setMsg(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={sending}>
            {sending && <span className="spinner" />}
            Send
          </button>
        </form>
      )}

      <div className="filter-bar">
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Unread only
        </label>
      </div>

      {error && <div className="error-state">{error}</div>}
      {loading &&
        Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-row" style={{ height: 32 }} />)}
      {!loading && !error && messages.length === 0 && <div className="empty-state">No messages.</div>}
      {!loading && !error && messages.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} style={{ fontWeight: m.read ? 400 : 600 }}>
                <td>{m.sendBy ?? '—'}</td>
                <td>{m.subject ?? '—'}</td>
                <td>{m.msg ?? '—'}</td>
                <td>{m.date ? new Date(m.date).toLocaleString() : '—'}</td>
                <td>{m.read ? 'Read' : 'Unread'}</td>
                <td>
                  {!m.read && (
                    <button className="btn-outline" onClick={() => handleMarkRead(m.id)}>
                      Mark read
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
