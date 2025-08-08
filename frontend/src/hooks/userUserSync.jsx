// frontend/src/hooks/useUserSync.js
import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { api } from '../services/api';

export function useUserSync() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          await api.post('/auth/sync-user', { idToken: token });
          console.log('User synced with MongoDB');
        } catch (error) {
          console.error('Sync failed:', error);
        }
      }
    });

    return unsubscribe;
  }, []);
}
