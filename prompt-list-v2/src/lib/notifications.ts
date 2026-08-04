import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  type: 'system' | 'monetization' | 'moderation' | 'support';
}

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: 'system' | 'monetization' | 'moderation' | 'support' = 'system'
): Promise<void> {
  if (!userId) return;
  try {
    const notifRef = collection(db, `users/${userId}/notifications`);
    await addDoc(notifRef, {
      title,
      message,
      read: false,
      type,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}:`, error);
  }
}
