import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDocs } from 'firebase/firestore';
import { checkWakeupList } from '../wakeupService';
import { sendMessage } from '../chatService';

vi.mock('../chatService', () => ({
  sendMessage: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  Timestamp: {
    fromDate: vi.fn(date => ({ toDate: () => date }))
  }
}));

describe('wakeupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait envoyer des notifications pour les rendez-vous trouvés', async () => {
    const mockAppointments = [
      {
        id: '1',
        title: 'Rendez-vous médical',
        description: 'Consultation',
        type: 'medical',
        start: new Date(),
        end: new Date(),
        userId: 'user1',
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockQuerySnapshot = {
      docs: mockAppointments.map(appointment => ({
        id: appointment.id,
        data: () => appointment
      }))
    };

    (getDocs as any).mockResolvedValue(mockQuerySnapshot);
    (sendMessage as any).mockResolvedValue({ success: true, messageId: '123' });

    const result = await checkWakeupList();

    expect(result).toEqual({
      success: true,
      message: 'Notifications envoyées pour 1 rendez-vous'
    });

    expect(sendMessage).toHaveBeenCalledWith({
      content: expect.stringContaining('Rendez-vous médical'),
      senderId: 'system',
      chatId: 'professionals',
      type: 'system'
    });
  });

  it('devrait gérer le cas où aucun rendez-vous n\'est trouvé', async () => {
    const mockQuerySnapshot = {
      docs: []
    };

    (getDocs as any).mockResolvedValue(mockQuerySnapshot);

    const result = await checkWakeupList();

    expect(result).toEqual({
      success: true,
      message: 'Aucun rendez-vous trouvé pour aujourd\'hui'
    });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('devrait gérer les erreurs lors de l\'envoi des messages', async () => {
    const mockAppointments = [
      {
        id: '1',
        title: 'Rendez-vous médical',
        description: 'Consultation',
        type: 'medical',
        start: new Date(),
        end: new Date(),
        userId: 'user1',
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockQuerySnapshot = {
      docs: mockAppointments.map(appointment => ({
        id: appointment.id,
        data: () => appointment
      }))
    };

    (getDocs as any).mockResolvedValue(mockQuerySnapshot);
    (sendMessage as any).mockResolvedValue({ 
      success: false, 
      error: new Error('Erreur lors de l\'envoi') 
    });

    const result = await checkWakeupList();

    expect(result).toEqual({
      success: false,
      error: expect.any(Error)
    });
  });
}); 