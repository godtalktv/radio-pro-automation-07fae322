/**
 * @file OfflineManager.js
 * @description Manages offline functionality for RadioPro
 */

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.setupEventListeners();
    this.initializeStorage();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners({ type: 'online' });
      console.log('[OfflineManager] Back online - syncing data...');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners({ type: 'offline' });
      console.log('[OfflineManager] Gone offline - switching to cached data');
    });
  }

  initializeStorage() {
    // Initialize IndexedDB for offline data storage
    this.openDatabase().then(db => {
      this.db = db;
      console.log('[OfflineManager] Database initialized');
    });
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RadioProDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('shows')) {
          db.createObjectStore('shows', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // Store data locally
  async storeOfflineData(storeName, data) {
    if (!this.db) await this.initializeStorage();
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    if (Array.isArray(data)) {
      for (const item of data) {
        await store.put(item);
      }
    } else {
      await store.put(data);
    }
    
    console.log(`[OfflineManager] Stored ${Array.isArray(data) ? data.length : 1} items in ${storeName}`);
  }

  // Retrieve data locally
  async getOfflineData(storeName, key = null) {
    if (!this.db) await this.initializeStorage();
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    if (key) {
      return await store.get(key);
    } else {
      return await store.getAll();
    }
  }

  // Queue actions for when back online
  async queueForSync(action, data) {
    if (!this.db) await this.initializeStorage();
    
    const transaction = this.db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    await store.add({
      action,
      data,
      timestamp: Date.now()
    });
    
    console.log('[OfflineManager] Queued action for sync:', action);
  }

  // Sync pending data when back online
  async syncPendingData() {
    if (!this.isOnline || !this.db) return;
    
    const pendingActions = await this.getOfflineData('pendingSync');
    
    for (const item of pendingActions) {
      try {
        await this.executeSyncAction(item);
        
        // Remove from pending queue after successful sync
        const transaction = this.db.transaction(['pendingSync'], 'readwrite');
        const store = transaction.objectStore('pendingSync');
        await store.delete(item.id);
        
      } catch (error) {
        console.error('[OfflineManager] Failed to sync action:', item.action, error);
      }
    }
  }

  async executeSyncAction(item) {
    // This would integrate with your entity APIs when online
    console.log('[OfflineManager] Syncing action:', item.action, item.data);
    
    switch (item.action) {
      case 'createTrack':
        // await Track.create(item.data);
        break;
      case 'updateTrack':
        // await Track.update(item.data.id, item.data);
        break;
      case 'deleteTrack':
        // await Track.delete(item.data.id);
        break;
      // Add other sync actions as needed
    }
  }

  // Preload audio files for offline use
  async preloadAudioFiles(tracks) {
    for (const track of tracks) {
      if (track.file_url && !track.file_url.includes('youtube.com')) {
        try {
          const response = await fetch(track.file_url);
          if (response.ok) {
            const cache = await caches.open('radiopro-audio-v1');
            await cache.put(track.file_url, response);
            console.log('[OfflineManager] Preloaded audio:', track.title);
          }
        } catch (error) {
          console.warn('[OfflineManager] Failed to preload:', track.title, error);
        }
      }
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(callback => callback(event));
  }
}

const offlineManager = new OfflineManager();
export default offlineManager;