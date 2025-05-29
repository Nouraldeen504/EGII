import { supabase } from './supabase';
import { productService } from './productService';
import { profileService } from './profileService';

export const orderService = {
  // Create a new order
  createOrder: async (orderData, cartItems) => {
    try {
      // Start a Supabase transaction for order creation
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: orderData.userId,
            total_amount: orderData.totalAmount,
            shipping_address: orderData.shippingAddress,
            payment_intent_id: orderData.paymentIntentId,
            payment_status: orderData.paymentStatus || 'pending',
            status: 'pending',
            payment_method: orderData.paymentMethod || 'credit_card'
          }
        ])
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      // Update product stock
      await supabase.rpc('update_stock_after_order', { order_id: order.id });

      return { orderId: order.id };
    } catch (error) {
      console.error('Error creating order:', error.message);
      throw error;
    }
  },

  // Get order by ID with items
  getOrderById: async (orderId, userId = null, isAdmin = false) => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items (
            id,
            quantity,
            price_at_purchase,
            product:product_id (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId);

      // If userId is provided, ensure the order belongs to this user (security)
      if (userId && !isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) {
        throw error;
      }

      const user = await profileService.getProfileById(data.user_id);

      return {...data, user: user};
    } catch (error) {
      console.error(`Error fetching order with id ${orderId}:`, error.message);
      throw error;
    }
  },

  // Get orders for a user
  getUserOrders: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error.message);
      throw error;
    }
  },

  // Admin: Get all orders with pagination
  getAllOrders: async (filters = {}) => {
    try {
      let query = supabase
        .from('orders_with_user_email')
        .select(`
          *
        `).order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        // Search by order ID or user email
        query = query.or(`id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply sorting
      if (filters.sortBy) {
        const [field, direction] = filters.sortBy.split(':');
        query = query.order(field, { ascending: direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      const countQuery = supabase
      .from('orders_with_user_email')
      .select('*', { count: 'exact', head: true });

      const { count } = await countQuery;

      if (error) {
        throw error;
      }

      return { data, count };
    } catch (error) {
      console.error('Error fetching all orders:', error.message);
      throw error;
    }
  },

  // Admin: Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if(status === 'canceled'){
        await supabase.rpc('update_stock_after_order_cancellation', { order_id: orderId });
      }

      return data;
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error.message);
      throw error;
    }
  },

  // Admin: Get order statistics for dashboard
  getOrderStats: async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      // Total orders count
      const { count: totalOrders, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Today's orders
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);
      
      if (todayError) throw todayError;
      
      // Pending orders
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'processing']);
      
      if (pendingError) throw pendingError;
      
      // Calculate total revenue
      const { data: totalRevenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');
      
      if (revenueError) throw revenueError;
      
      const totalRevenue = totalRevenueData.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      
      // Today's revenue
      const todayRevenue = todayOrders.reduce(
        (sum, order) => sum + (order.payment_status === 'paid' ? parseFloat(order.total_amount) : 0), 
        0
      );
      
      return {
        totalOrders,
        todayOrders: todayOrders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        todayRevenue
      };
    } catch (error) {
      console.error('Error fetching order statistics:', error.message);
      throw error;
    }
  }
};