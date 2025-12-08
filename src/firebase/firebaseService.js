import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'customBingoCards';

// Generate a unique user ID (simple approach for anonymous users)
const getUserId = () => {
  let userId = localStorage.getItem('anonymousUserId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('anonymousUserId', userId);
  }
  return userId;
};

export class FirebaseService {
  // Save a new custom card
  static async saveCustomCard(cardData) {
    try {
      const userId = getUserId();

      const cardToSave = {
        ...cardData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        usageCount: 0,
        isPublic: cardData.isPublic || false,
        category: cardData.category || 'custom',
        lastModified: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), cardToSave);

      // Return the card with the generated ID
      return {
        id: docRef.id,
        ...cardData,
        createdBy: userId,
        createdAt: new Date(),
        usageCount: 0,
        isPublic: cardData.isPublic || false,
        category: cardData.category || 'custom'
      };
    } catch (error) {
      console.error('Error saving custom card:', error);
      throw new Error('Failed to save card. Please try again.');
    }
  }

  // Get all cards for the current user
  static async getUserCards() {
    try {
      const userId = getUserId();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const cards = [];

      querySnapshot.forEach((doc) => {
        cards.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      return cards;
    } catch (error) {
      console.error('Error fetching user cards:', error);
      throw new Error('Failed to load your cards. Please try again.');
    }
  }

  // Get a specific card by ID
  static async getCardById(cardId) {
    try {
      const cardRef = doc(db, COLLECTION_NAME, cardId);
      const cardSnap = await getDoc(cardRef);

      if (cardSnap.exists()) {
        const cardData = cardSnap.data();
        return {
          id: cardSnap.id,
          ...cardData,
          createdAt: cardData.createdAt?.toDate?.() || new Date(),
          lastModified: cardData.lastModified?.toDate?.() || new Date()
        };
      } else {
        return null; // Card not found
      }
    } catch (error) {
      console.error('Error fetching card by ID:', error);
      throw new Error('Failed to load the requested card.');
    }
  }

  // Create or get the default Business Lingo Bingo card
  static async ensureDefaultCard(defaultPhrases) {
    try {
      // Check if default card already exists
      const q = query(
        collection(db, COLLECTION_NAME),
        where('name', '==', 'Business Lingo Bingo'),
        where('category', '==', 'business'),
        where('isSystemDefault', '==', true)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Default card exists, return the first one
        const doc = querySnapshot.docs[0];
        const cardData = doc.data();
        return {
          id: doc.id,
          ...cardData,
          createdAt: cardData.createdAt?.toDate?.() || new Date(),
          lastModified: cardData.lastModified?.toDate?.() || new Date()
        };
      }

      // Create the default card
      const defaultCardData = {
        name: 'Business Lingo Bingo',
        phrases: defaultPhrases,
        isDefault: true,
        isPublic: true,
        isSystemDefault: true, // Special flag for the default card
        category: 'business',
        createdBy: 'system',
        createdAt: serverTimestamp(),
        usageCount: 0,
        lastModified: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), defaultCardData);

      // Return the created card
      return {
        id: docRef.id,
        ...defaultCardData,
        createdAt: new Date(),
        lastModified: new Date()
      };

    } catch (error) {
      console.error('Error ensuring default card:', error);
      throw new Error('Failed to create default card.');
    }
  }

  // Get public cards for discovery
  static async getPublicCards(limit = 20) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isPublic', '==', true),
        orderBy('usageCount', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const cards = [];

      querySnapshot.forEach((doc) => {
        cards.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      return cards.slice(0, limit);
    } catch (error) {
      console.error('Error fetching public cards:', error);
      throw new Error('Failed to load public cards. Please try again.');
    }
  }

  // Update a card
  static async updateCard(cardId, updates) {
    try {
      const userId = getUserId();
      const cardRef = doc(db, COLLECTION_NAME, cardId);

      const updateData = {
        ...updates,
        lastModified: serverTimestamp()
      };

      await updateDoc(cardRef, updateData);
      return { id: cardId, ...updates };
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card. Please try again.');
    }
  }

  // Delete a card
  static async deleteCard(cardId) {
    try {
      const userId = getUserId();
      await deleteDoc(doc(db, COLLECTION_NAME, cardId));
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw new Error('Failed to delete card. Please try again.');
    }
  }

  // Increment usage count when someone plays a card
  static async incrementUsageCount(cardId) {
    try {
      const cardRef = doc(db, COLLECTION_NAME, cardId);
      const cardDoc = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', cardId)));

      if (!cardDoc.empty) {
        const currentCount = cardDoc.docs[0].data().usageCount || 0;
        await updateDoc(cardRef, {
          usageCount: currentCount + 1,
          lastUsed: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      // Don't throw error for analytics - fail silently
    }
  }

  // Set up real-time listener for user's cards
  static subscribeToUserCards(callback) {
    const userId = getUserId();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const cards = [];
      querySnapshot.forEach((doc) => {
        cards.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });
      callback(cards);
    }, (error) => {
      console.error('Error in real-time listener:', error);
    });
  }

  // Migrate existing localStorage data to Firestore
  static async migrateLocalStorageData() {
    try {
      const existingCards = JSON.parse(localStorage.getItem('customBingoCards') || '[]');
      const migratedCards = [];

      for (const card of existingCards) {
        try {
          const migratedCard = await this.saveCustomCard({
            name: card.name,
            phrases: card.phrases,
            isDefault: card.isDefault || false,
            isPublic: false, // Default to private for migrated cards
            category: 'custom'
          });
          migratedCards.push(migratedCard);
        } catch (error) {
          console.error('Failed to migrate card:', card.name, error);
        }
      }

      // Clear localStorage after successful migration
      if (migratedCards.length > 0) {
        localStorage.removeItem('customBingoCards');
        localStorage.setItem('dataMigrated', 'true');
      }

      return migratedCards;
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
      return [];
    }
  }

  // Check if data has been migrated
  static isDataMigrated() {
    return localStorage.getItem('dataMigrated') === 'true';
  }
}