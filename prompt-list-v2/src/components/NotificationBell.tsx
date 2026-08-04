import React, { useState, useEffect, useRef } from 'react';
import styles from './NotificationBell.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserNotification } from '@/lib/notifications';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/notifications`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: UserNotification[] = [];
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let isExpired = false;
        if (d.createdAt && typeof d.createdAt.toDate === 'function') {
          const createdTime = d.createdAt.toDate().getTime();
          if (now - createdTime > ONE_DAY_MS) {
            isExpired = true;
            deleteDoc(docSnap.ref).catch(e => console.error("Error deleting expired notification:", e));
          }
        }

        if (!isExpired) {
          items.push({
            id: docSnap.id,
            title: d.title || 'Notification',
            message: d.message || '',
            read: d.read || false,
            type: d.type || 'system',
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'New'
          });
        }
      });
      items.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1));
      setNotifications(items);
    }, (err) => {
      console.error("Error subscribing to user notifications:", err);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        if (!n.read) {
          batch.update(doc(db, `users/${user.uid}/notifications`, n.id), { read: true });
        }
      });
      await batch.commit();
    } catch (e) {
      console.error("Failed to mark notifications read:", e);
    }
  };

  const handleItemClick = async (notif: UserNotification) => {
    if (!user || notif.read) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/notifications`, notif.id), { read: true });
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  return (
    <div className={styles.bellContainer} ref={dropdownRef}>
      <button 
        type="button" 
        className={styles.bellBtn} 
        onClick={() => setIsOpen(!isOpen)}
        title="View Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownPanel}>
          <div className={styles.panelHeader}>
            <strong>Notifications ({unreadCount} new)</strong>
            {unreadCount > 0 && (
              <button type="button" className={styles.markReadBtn} onClick={handleMarkAllRead}>
                <CheckCheck size={14} style={{ display: 'inline', marginRight: '3px' }} />
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.itemsList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <BellOff size={28} style={{ opacity: 0.5 }} />
                <span>No notifications in your inbox yet</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`${styles.notifItem} ${!n.read ? styles.unreadItem : ''}`}
                  onClick={() => handleItemClick(n)}
                >
                  {!n.read && <span className={styles.unreadDot} />}
                  <div className={styles.itemHeader}>
                    <span className={styles.itemTitle}>{n.title}</span>
                    <span className={styles.itemDate}>{n.createdAt}</span>
                  </div>
                  <p className={styles.itemMessage}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
