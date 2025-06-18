import { supabase } from './supabase';

export const notificationService = {
  // Send order confirmation email to customer
  sendOrderConfirmation: async (orderId, userEmail) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'confirmation',
          orderId,
          userEmail
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error sending order confirmation email:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Send order notification email to admin
  sendAdminOrderNotification: async (orderId) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'admin-notification',
          orderId
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error sending admin order notification:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Send low stock alerts to admin
  sendLowStockAlert: async (products) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          type: 'low-stock',
          products
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error sending low stock alert:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Send order status update to customer
  sendOrderStatusUpdate: async (orderId, status, userEmail) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'status-update',
          orderId,
          status,
          userEmail
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error sending order status update:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Send contact form submission notification
  sendContactFormNotification: async (formData) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error sending contact form notification:', error.message);
      return { success: false, error: error.message };
    }
  }
};