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

    loadNotifications();

    const token = localStorage.getItem('fixsoon_token');
    if (!token) return;

    const source = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);

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

    return () => {
      source.close();
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
        className="relative p-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B] transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B45309] dark:bg-[#F59E0B] text-[#FFFFFF] dark:text-[#090D16] text-[10px] font-bold flex items-center justify-center tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Unread alerts and notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Alerts
              </span>
              <span className="text-xs text-[#475569] dark:text-[#94A3B8] tabular-nums">
                {unreadCount} unread
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#B45309] dark:text-[#F59E0B] hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#475569] dark:text-[#94A3B8]">
                No notifications yet. You will see quote, job status, and message alerts here.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60 transition-colors flex items-start justify-between gap-3 ${
                    !n.read ? 'bg-[#F8FAFC]/80 dark:bg-[#1E293B]/30' : ''
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                      <span>{n.title}</span>
                      {!n.read && (
                        <span className="text-[10px] font-mono uppercase text-[#B45309] dark:text-[#F59E0B]">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                      {n.body}
                    </p>
                    <div className="text-[11px] text-[#475569]/80 dark:text-[#94A3B8]/70 tabular-nums">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  {n.read && <Check className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8] shrink-0 mt-0.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
