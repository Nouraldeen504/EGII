import { supabase } from './supabase';

export const productService = {
  // Fetch all products with category information
  getAllProducts: async (filters = {}) => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            id,
            name
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      // Apply filters if provided
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.isFeatured) {
        query = query.eq('is_featured', true);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
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
      console.error('Error fetching products:', error.message);
      throw error;
    }
  },

  // Fetch a single product by ID with category information
  getProductById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            id,
            name
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error.message);
      throw error;
    }
  },

  // Fetch featured products for homepage
  getFeaturedProducts: async (limit = 4) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            id,
            name
          )
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching featured products:', error.message);
      throw error;
    }
  },

  // Check if products are in stock with requested quantities
  checkProductsStock: async (items) => {
    try {
      // Extract product IDs
      const productIds = items.map(item => item.id);
      
      // Fetch current stock information for these products
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .in('id', productIds);
      
      if (error) {
        throw error;
      }
      
      // Check each item against available stock
      const stockCheck = items.map(item => {
        const product = data.find(p => p.id === item.id);
        
        if (!product) {
          return {
            id: item.id,
            name: item.name || 'Unknown Product',
            requested: item.quantity,
            available: 0,
            inStock: false
          };
        }
        
        return {
          id: product.id,
          name: product.name,
          requested: item.quantity,
          available: product.stock_quantity,
          inStock: product.stock_quantity >= item.quantity
        };
      });
      
      // Overall result
      const allInStock = stockCheck.every(item => item.inStock);
      
      return {
        allInStock,
        items: stockCheck
      };
    } catch (error) {
      console.error('Error checking product stock:', error.message);
      throw error;
    }
  },

  // Admin: Create new product
  createProduct: async (productData) => {
    try {
      // Remove the image_url if it's a local blob URL (from file preview)
      if (productData.image_url && productData.image_url.startsWith('blob:')) {
        delete productData.image_url;
      }
      const { image_file, ...dataToSend } = productData;
      const { data, error } = await supabase
        .from('products')
        .insert([dataToSend])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating product:', error.message);
      throw error;
    }
  },

  // Admin: Update existing product
  updateProduct: async (id, productData) => {
    try {

      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (currentProduct.image_url && 
        productData.image_url && 
        currentProduct.image_url !== productData.image_url) {
        try {
          let oldFilePath = currentProduct.image_url;
          
          // Handle both full URLs and storage paths
          if (oldFilePath.startsWith('http')) {
            const url = new URL(oldFilePath);
            oldFilePath = url.pathname.split('/').slice(6).join('/');
          } else if (oldFilePath.startsWith('public/')) {
            oldFilePath = oldFilePath.replace(/^public\/product-images\//, '');
          }
          console.log(`Old path: ${oldFilePath}`);
          // Delete the old image
          const { error: deleteError } = await supabase.storage
            .from('product-images')
            .remove([oldFilePath]);

          if (deleteError) {
            console.warn('Old image deletion failed:', deleteError.message);
          }
        } catch (deleteError) {
          console.warn('Old image deletion failed:', deleteError.message);
        }
      }

      return data;
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error.message);
      throw error;
    }
  },

  // Admin: Delete product (soft delete by setting is_active to false)
  deleteProduct: async (id) => {
    try {
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      
      if (productData.image_url) {
        try {
          let filePath = productData.image_url;
          console.log(filePath);
          
          if (filePath.startsWith('http')) {
            const url = new URL(filePath);
            filePath = url.pathname.split('/').slice(6).join('/');
            console.log(`Here is again: ${filePath}`);
          }
          
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove([filePath]);
  
          if (storageError) {
            console.error(`Product deleted but image removal failed: ${storageError.message}`);
          }
        } catch (storageError) {
          console.error(`Product deleted but image removal failed: ${storageError.message}`);
        }
      }

      return data;
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error.message);
      throw error;
    }
  },

  // Admin: Get low stock products for alerts
  getLowStockProducts: async (threshold = 5) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching low stock products:', error.message);
      throw error;
    }
  },
};