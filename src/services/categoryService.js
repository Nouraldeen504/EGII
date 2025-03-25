import { supabase } from './supabase';

export const categoryService = {
  // Fetch all categories
  getAllCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      throw error;
    }
  },

  // Fetch a single category by ID
  getCategoryById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error.message);
      throw error;
    }
  },

  // Admin: Create a new category
  createCategory: async (categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating category:', error.message);
      throw error;
    }
  },

  // Admin: Update existing category
  updateCategory: async (id, categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error.message);
      throw error;
    }
  },

  // Admin: Delete category
  deleteCategory: async (id) => {
    try {
      // First, check if there are any products associated with this category
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);

      if (checkError) {
        throw checkError;
      }

      // If products exist with this category, don't allow deletion
      if (products && products.length > 0) {
        throw new Error('Cannot delete category with associated products. Please reassign or delete the products first.');
      }

      // If no products are associated, proceed with deletion
      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error.message);
      throw error;
    }
  }
};