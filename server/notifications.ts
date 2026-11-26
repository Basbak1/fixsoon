import type express from 'express';
import { db } from './db.js';
import type { JobStatus, NotificationItem } from '../src/types/fixsoon.js';

export interface NotificationEventPayload {
  userId: string;
  title: string;
  body: string;
  link: string;
}

class NotificationService {
  private subscribers = new Map<string, Set<express.Response>>();

  subscribe(userId: string, res: express.Response): () => void {
    let set = this.subscribers.get(userId);
    if (!set) {
      set = new Set();
      this.subscribers.set(userId, set);
    }
    set.add(res);

    const unreadCount = this.getUnreadCount(userId);
    this.sendSseEvent(res, 'init', { unreadCount });

    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        // connection closed
      }
    }, 25000);

    return () => {
      clearInterval(heartbeat);
      const current = this.subscribers.get(userId);
      if (current) {
        current.delete(res);
        if (current.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  private sendSseEvent(res: express.Response, event: string, data: unknown): void {
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch {
      // ignore closed stream
    }
  }

  private broadcastToUser(userId: string, notification: NotificationItem): void {
    const subs = this.subscribers.get(userId);
    if (!subs || subs.size === 0) return;
    const unreadCount = this.getUnreadCount(userId);
    for (const res of subs) {
      this.sendSseEvent(res, 'notification', { notification, unreadCount });
    }
  }

  emit(payload: NotificationEventPayload): NotificationItem {
    const item: NotificationItem = {
      id: db.newId('notif'),
      user_id: payload.userId,
      title: payload.title,
      body: payload.body,
      link: payload.link,
      read: false,
      created_at: new Date().toISOString(),
    };
    db.data.notifications.unshift(item);
    this.broadcastToUser(payload.userId, item);
    return item;
  }

  listForUser(userId: string, limit = 25): { notifications: NotificationItem[]; unreadCount: number } {
    const userNotifs = db.data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const unreadCount = userNotifs.filter((n) => !n.read).length;
    return {
      notifications: userNotifs.slice(0, limit),
      unreadCount,
    };
  }

  getUnreadCount(userId: string): number {
    return db.data.notifications.filter((n) => n.user_id === userId && !n.read).length;
  }

  markRead(userId: string, notificationId: string): NotificationItem | null {
    const notif = db.data.notifications.find(
      (n) => n.id === notificationId && n.user_id === userId
    );
    if (!notif) return null;
    notif.read = true;
    db.save();
    return notif;
  }

  markAllRead(userId: string): number {
    let updated = 0;
    for (const notif of db.data.notifications) {
      if (notif.user_id === userId && !notif.read) {
        notif.read = true;
        updated += 1;
      }
    }
    if (updated > 0) db.save();
    return updated;
  }

  // Event-based triggers
  onRequestMatched(params: {
    providerUserId: string;
    requestType: 'general' | 'direct';
    customerName: string;
    referenceCode: string;
    city: string;
  }) {
    if (params.requestType === 'direct') {
      return this.emit({
        userId: params.providerUserId,
        title: 'Direct request received',
        body: `${params.customerName} sent you a direct request (${params.referenceCode}) in ${params.city}.`,
        link: '/provider-dashboard',
      });
    }
    return this.emit({
      userId: params.providerUserId,
      title: 'New matched job request',
      body: `New request ${params.referenceCode} in ${params.city} matches your coverage and services.`,
      link: '/provider-dashboard',
    });
  }

  onQuoteSubmitted(params: {
    customerId: string;
    providerBusinessName: string;
    estimatedPrice: number;
    referenceCode: string;
  }) {
    return this.emit({
      userId: params.customerId,
      title: 'New quote received',
      body: `${params.providerBusinessName} quoted $${params.estimatedPrice} for ${params.referenceCode}.`,
      link: '/customer-dashboard',
    });
  }

  onQuoteAccepted(params: {
    providerUserId: string;
    customerName: string;
    referenceCode: string;
  }) {
    return this.emit({
      userId: params.providerUserId,
      title: 'Quote accepted',
      body: `${params.customerName} accepted your quote for ${params.referenceCode}. Full address is now unlocked in Active Jobs.`,
      link: '/provider-dashboard',
    });
  }

  onDirectRequestDeclined(params: {
    customerId: string;
    providerBusinessName: string;
    referenceCode: string;
  }) {
    return this.emit({
      userId: params.customerId,
      title: 'Direct request declined',
      body: `${params.providerBusinessName} could not take ${params.referenceCode}. You can send this request to the general marketplace.`,
      link: '/customer-dashboard',
    });
  }

  onJobStatusUpdated(params: {
    customerId: string;
    providerBusinessName: string;
    referenceCode: string;
    status: JobStatus;
  }) {
    const label = params.status.replace(/_/g, ' ');
    return this.emit({
      userId: params.customerId,
      title: `Job ${label}`,
      body: `${params.providerBusinessName} updated ${params.referenceCode} to "${label}".`,
      link: '/customer-dashboard',
    });
  }

  onNewMessage(params: {
    recipientUserId: string;
    senderName: string;
    referenceCode: string;
    recipientRole: 'customer' | 'provider';
  }) {
    return this.emit({
      userId: params.recipientUserId,
      title: `New message on ${params.referenceCode}`,
      body: `${params.senderName} sent you a message.`,
      link: params.recipientRole === 'provider' ? '/provider-dashboard' : '/customer-dashboard',
    });
  }

  onProviderVerificationUpdated(params: {
    providerUserId: string;
    status: string;
  }) {
    return this.emit({
      userId: params.providerUserId,
      title: 'Provider verification update',
      body: `Your WorldLeo profile status is now: ${params.status.replace(/_/g, ' ')}.`,
      link: '/provider-dashboard',
    });
  }
}

export const notificationService = new NotificationService();
