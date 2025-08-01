import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'contract_expiring' | 'process_deadline' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  contractNumber?: string;
  companyName?: string;
  daysRemaining?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar estado de leitura do localStorage
  const getReadNotifications = (): Set<string> => {
    try {
      const stored = localStorage.getItem('readNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  // Salvar estado de leitura no localStorage
  const saveReadNotifications = (readIds: Set<string>) => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(Array.from(readIds)));
    } catch (error) {
      console.error('Erro ao salvar notificações lidas:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Buscar contratos vencendo
      const { data: contracts } = await supabase
        .from('contracts')
        .select('*, companies(name)')
        .eq('status', 'Vigente');

      const today = new Date();
      const alertThreshold = new Date(today.getTime() + (120 * 24 * 60 * 60 * 1000));
      
      const readNotifications = getReadNotifications();
      
      const contractNotifications: Notification[] = (contracts || []).filter(contract => {
        const endDate = new Date(contract.end_date);
        return endDate <= alertThreshold && endDate >= today;
      }).map(contract => {
        const daysRemaining = Math.ceil((new Date(contract.end_date) - today) / (1000 * 60 * 60 * 24));
        const notificationId = `contract_${contract.id}`;
        
        return {
          id: notificationId,
          type: 'contract_expiring' as const,
          title: 'Contrato Vencendo',
          message: `Contrato ${contract.contract_number} da empresa ${contract.companies?.name || 'N/A'} vence em ${daysRemaining} dias`,
          date: contract.created_at || new Date().toISOString(),
          read: readNotifications.has(notificationId),
          contractNumber: contract.contract_number,
          companyName: contract.companies?.name || 'N/A',
          daysRemaining
        };
      });

      setNotifications(contractNotifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const markAsRead = (id: string) => {
    const readNotifications = getReadNotifications();
    readNotifications.add(id);
    saveReadNotifications(readNotifications);
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    const readNotifications = getReadNotifications();
    notifications.forEach(notification => {
      readNotifications.add(notification.id);
    });
    saveReadNotifications(readNotifications);
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isOpen,
      setIsOpen,
      markAsRead,
      markAllAsRead,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};