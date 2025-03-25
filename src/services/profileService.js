import { supabase } from './supabase';

export const profileService = {
  // Get user profile by ID
  getProfileById: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error.message);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error updating profile for user ${userId}:`, error.message);
      throw error;
    }
  },

  // Admin: Get all users/profiles with filtering and pagination
  getAllProfiles: async (filters = {}) => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user:id (
            email,
            created_at
          )
        `);

      // Apply filters if provided
      if (filters.isAdmin !== undefined) {
        query = query.eq('is_admin', filters.isAdmin);
      }

      if (filters.search) {
        // Search by name, email, or phone
        query = query.or(
          `full_name.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`
        );
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

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return { data, count };
    } catch (error) {
      console.error('Error fetching all profiles:', error.message);
      throw error;
    }
  },

  // Admin: Toggle admin status
  toggleAdminStatus: async (userId, isAdmin) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_admin: isAdmin,
          updated_at: new Date()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error toggling admin status for user ${userId}:`, error.message);
      throw error;
    }
  },

  // Get user statistics (for admin dashboard)
  getUserStats: async () => {
    try {
      // Total users count
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Admin users count
      const { count: adminUsers, error: adminError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', true);
      
      if (adminError) throw adminError;
      
      // New users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newUsers, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (newUsersError) throw newUsersError;
      
      return {
        totalUsers,
        adminUsers,
        newUsers,
        regularUsers: totalUsers - adminUsers
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error.message);
      throw error;
    }
  }
};