import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { NotificationItem } from '../types/fixsoon';

interface NotificationBellProps {
  onNavigate: (path: string) => void;
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const res = await apiFetch<{ notifications: NotificationItem[]; unreadCount: number }>(
        '/api/notifications'
      );
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // ignore transient fetch errors
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    let source: EventSource | null = null;

    loadNotifications();

    (async () => {
      try {
        const { ticket } = await apiFetch<{ ticket: string }>('/api/notifications/sse-ticket', {
          method: 'POST',
        });
        if (cancelled) return;

        source = new EventSource(
          `/api/notifications/stream?ticket=${encodeURIComponent(ticket)}`,
          { withCredentials: true }
        );

        source.addEventListener('init', (event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data) as { unreadCount: number };
            setUnreadCount(data.unreadCount);
          } catch {
            // ignore parse error
          }
        });

        source.addEventListener('notification', (event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data) as {
              notification: NotificationItem;
              unreadCount: number;
            };
            setNotifications((prev) => {
              const withoutDup = prev.filter((n) => n.id !== data.notification.id);
              return [data.notification, ...withoutDup].slice(0, 25);
            });
            setUnreadCount(data.unreadCount);
          } catch {
            // ignore parse error
          }
        });
      } catch {
        // SSE optional fallback to polling on open
      }
    })();

    return () => {
      cancelled = true;
      source?.close();
    };
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  if (!user) return null;

  const markAsRead = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        const res = await apiFetch<{ notification: NotificationItem; unreadCount: number }>(
          `/api/notifications/${notif.id}/read`,
          { method: 'POST' }
        );
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? res.notification : n)));
        setUnreadCount(res.unreadCount);
      } catch {
        // ignore
      }
    }
    setOpen(false);
    if (notif.link) {
      onNavigate(notif.link);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) loadNotifications();
        }}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative p-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#063B2B] dark:bg-[#C6A45B] text-[#F8F7F2] dark:text-[#071E17] text-[10px] font-bold flex items-center justify-center tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Unread alerts and notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#D8D4C7] dark:border-[#1E4438] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Alerts
              </span>
              <span className="text-xs text-[#6D756F] dark:text-[#B4C2BC] tabular-nums">
                {unreadCount} unread
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#9F7B37] dark:text-[#D8B66F] hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#D8D4C7] dark:divide-[#1E4438]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6D756F] dark:text-[#B4C2BC]">
                No notifications yet. Quote, job status, and message alerts appear here.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/35 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                    !n.read ? 'bg-[#F6F2E8]/80 dark:bg-[#145443]/25' : ''
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] flex items-center gap-1.5">
                      <span>{n.title}</span>
                      {!n.read && (
                        <span className="text-[10px] font-mono uppercase text-[#9F7B37] dark:text-[#D8B66F]">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6D756F] dark:text-[#B4C2BC] leading-relaxed">
                      {n.body}
                    </p>
                    <div className="text-[11px] text-[#6D756F]/85 dark:text-[#B4C2BC]/75 tabular-nums">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  {n.read && <Check className="w-3.5 h-3.5 text-[#6D756F] dark:text-[#B4C2BC] shrink-0 mt-0.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
