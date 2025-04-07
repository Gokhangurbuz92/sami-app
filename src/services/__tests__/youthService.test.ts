import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { youthService } from '../youthService';
import { notificationService } from '../notificationService';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firebase
vi.mock('firebase/firestore');
vi.mock('../notificationService');

describe('youthService', () => {
  const mockYouth = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCollection = {
    id: 'youth',
    docs: [
      {
        id: '1',
        data: () => ({
          ...mockYouth,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        })
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createYouth', () => {
    it('should create a new youth and return it', async () => {
      const mockDocRef = {
        id: '1',
        converter: null,
        type: 'document',
        firestore: {} as any,
        path: 'youth/1',
        parent: {} as any,
        withConverter: () => ({} as any)
      };
      
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const result = await youthService.createYouth({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2000-01-01',
        createdBy: 'user1'
      });

      expect(addDoc).toHaveBeenCalledWith(collection(db, 'youth'), expect.any(Object));
      expect(notificationService.createYouthNotification).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });

    it('should handle errors during creation', async () => {
      vi.mocked(addDoc).mockRejectedValue(new Error('Creation failed'));

      await expect(
        youthService.createYouth({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '2000-01-01',
          createdBy: 'user1'
        })
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('updateYouth', () => {
    it('should update an existing youth', async () => {
      const mockDocRef = doc(db, 'youth', '1');
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await youthService.updateYouth('1', {
        firstName: 'Jane'
      });

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, expect.any(Object));
    });

    it('should handle errors during update', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Update failed'));

      await expect(
        youthService.updateYouth('1', {
          firstName: 'Jane'
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteYouth', () => {
    it('should delete a youth', async () => {
      const mockDocRef = doc(db, 'youth', '1');
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await youthService.deleteYouth('1');

      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should handle errors during deletion', async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Deletion failed'));

      await expect(youthService.deleteYouth('1')).rejects.toThrow('Deletion failed');
    });
  });

  describe('searchYouth', () => {
    it('should search for youth and return results', async () => {
      const mockQueryResult = vi.fn() as unknown as ReturnType<typeof query>;
      vi.mocked(query).mockReturnValue(mockQueryResult);
      vi.mocked(getDocs).mockResolvedValue(mockCollection as any);

      const results = await youthService.searchYouth('John', 'user1');

      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalledWith(mockQueryResult);
      
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(
        expect.objectContaining({
          id: '1',
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });

    it('should handle errors during search', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Search failed'));

      await expect(youthService.searchYouth('John', 'user1')).rejects.toThrow('Search failed');
    });
  });

  describe('subscribeToYouth', () => {
    it('should set up a real-time subscription', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      const mockQueryResult = vi.fn() as unknown as ReturnType<typeof query>;
      vi.mocked(query).mockReturnValue(mockQueryResult);
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = youthService.subscribeToYouth('user1', mockCallback);

      expect(query).toHaveBeenCalled();
      expect(onSnapshot).toHaveBeenCalledWith(mockQueryResult, expect.any(Function));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
