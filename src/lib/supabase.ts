/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment variables or process.env
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn("Supabase credentials (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) are not fully configured. Using fallback local state mode.");
}

// Instantiate Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Settings Helper
 */
export async function getSettingsFromSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    // Try key = 'global_settings' (JSONB value)
    let { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'global_settings')
      .maybeSingle();

    if (error) {
      // If key column doesn't exist or table has different schema, return null silently
      return null;
    }

    if (data && (data.value || data.data)) {
      return data.value || data.data;
    }

    return null;
  } catch (err) {
    return null;
  }
}

export async function saveSettingsToSupabase(settingsData: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    // 1. Try upserting as key/value jsonb table structure
    let { error } = await supabase
      .from('settings')
      .upsert({
        key: 'global_settings',
        value: settingsData,
        updated_at: new Date().toISOString()
      });

    if (!error) return true;

    // 2. Fallback: try upserting with id/data
    const fallback = await supabase
      .from('settings')
      .upsert({
        id: 'global_settings',
        data: settingsData,
        updated_at: new Date().toISOString()
      });

    if (!fallback.error) return true;

    // 3. Last fallback: try direct object spread (if columns exist)
    const direct = await supabase
      .from('settings')
      .upsert({
        id: 'global_settings',
        updated_at: new Date().toISOString(),
        ...settingsData
      });

    if (direct.error) {
      console.warn("Supabase settings save warning:", direct.error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error saving settings to Supabase:", err);
    return false;
  }
}

/**
 * Vehicles / Showroom Helper
 */
export async function getVehiclesFromSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn("Supabase vehicles fetch error:", error.message);
      return null;
    }
    return (data || []).filter((v: any) => !v.is_deleted && !v.isDeleted && v.status !== 'deleted');
  } catch (err) {
    console.error("Error fetching vehicles from Supabase:", err);
    return null;
  }
}

export async function saveVehicleToSupabase(vehicle: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    const payload: Record<string, any> = {
      id: vehicle.id || `v_${Date.now()}`,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      price: Number(vehicle.price || 0),
      stock: Number(vehicle.stock || 0),
      status: vehicle.status || 'Available',
      color: vehicle.color || '',
      battery: vehicle.battery || '',
      motor: vehicle.motor || '',
      range: vehicle.range || '',
      top_speed: vehicle.top_speed || vehicle.topSpeed || '',
      image: vehicle.image || '',
      description: vehicle.description || '',
      is_deleted: Boolean(vehicle.is_deleted ?? vehicle.isDeleted ?? false),
      created_at: vehicle.created_at || vehicle.createdAt || new Date().toISOString()
    };
    const { error } = await supabase.from('vehicles').upsert(payload);
    if (error) console.warn("Supabase vehicle save error:", error.message);
    return !error;
  } catch (err) {
    console.warn("Error saving vehicle to Supabase:", err);
    return false;
  }
}

export async function softDeleteVehicleInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase
      .from('vehicles')
      .update({ is_deleted: true, status: 'deleted' })
      .eq('id', id);

    if (error) {
      const fallback = await supabase.from('vehicles').update({ is_deleted: true }).eq('id', id);
      error = fallback.error;
    }
    if (error) console.error("Supabase vehicle delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error soft deleting vehicle in Supabase:", err);
    return false;
  }
}

export async function restoreVehicleInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('vehicles')
      .update({ is_deleted: false, status: 'Available' })
      .eq('id', id);
    if (error) console.error("Supabase vehicle restore error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error restoring vehicle in Supabase:", err);
    return false;
  }
}

export async function permanentDeleteVehicleFromSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) console.error("Supabase vehicle delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error deleting vehicle from Supabase:", err);
    return false;
  }
}

export async function deleteVehicleFromSupabase(id: string) {
  return softDeleteVehicleInSupabase(id);
}

/**
 * Products & Spare Parts Helper
 */
export async function getProductsFromSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    let { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn("Supabase products fetch error:", error.message);
      return null;
    }
    return (data || []).filter((p: any) => !p.is_deleted && !p.isDeleted && p.status !== 'deleted');
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return null;
  }
}

export async function saveProductToSupabase(product: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    const payload: Record<string, any> = {
      id: product.id || `p_${Date.now()}`,
      name: product.name || product.titleEng || product.title || '',
      title_eng: product.titleEng || product.title_eng || product.name || '',
      title_ben: product.titleBen || product.title_ben || '',
      category: product.category || 'General',
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      status: product.status || 'Active',
      image: product.image || '',
      description: product.description || '',
      is_deleted: Boolean(product.is_deleted ?? product.isDeleted ?? false),
      created_at: product.created_at || product.createdAt || new Date().toISOString()
    };
    const { error } = await supabase.from('products').upsert(payload);
    if (error) console.warn("Supabase product save error:", error.message);
    return !error;
  } catch (err) {
    console.warn("Error saving product to Supabase:", err);
    return false;
  }
}

export async function softDeleteProductInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase
      .from('products')
      .update({ is_deleted: true, status: 'deleted' })
      .eq('id', id);

    if (error) {
      const fallback = await supabase.from('products').update({ is_deleted: true }).eq('id', id);
      error = fallback.error;
    }
    if (error) console.error("Supabase product delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error soft deleting product in Supabase:", err);
    return false;
  }
}

export async function restoreProductInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: false, status: 'Active' })
      .eq('id', id);
    if (error) console.error("Supabase product restore error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error restoring product in Supabase:", err);
    return false;
  }
}

export async function permanentDeleteProductFromSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error("Supabase product delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error deleting product from Supabase:", err);
    return false;
  }
}

export async function deleteProductFromSupabase(id: string) {
  return softDeleteProductInSupabase(id);
}

/**
 * Orders Helper
 */
export async function getOrdersFromSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*');

    if (error) {
      console.warn("Supabase orders fetch error:", error.message);
      return null;
    }
    const orders = (data || []).filter((o: any) => !o.is_deleted && !o.isDeleted && o.status !== 'deleted');
    orders.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.created_at || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.created_at || b.date || 0).getTime();
      return timeB - timeA;
    });
    return orders;
  } catch (err) {
    console.error("Error fetching orders from Supabase:", err);
    return null;
  }
}

export async function saveOrderToSupabase(order: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    const orderId = order.id || order.orderId || order.order_id || `ord_${Date.now()}`;
    const payload: Record<string, any> = {
      id: orderId,
      order_id: order.orderId || order.order_id || orderId,
      customer_name: order.customerName || order.customer_name || '',
      customer_phone: order.customerPhone || order.customer_phone || '',
      customer_email: order.customerEmail || order.customer_email || null,
      items: order.items || [],
      total_amount: Number(order.totalAmount !== undefined ? order.totalAmount : (order.total_amount !== undefined ? order.total_amount : 0)),
      status: order.status || 'Pending',
      previous_status: order.previousStatus || order.previous_status || null,
      payment_method: order.paymentMethod || order.payment_method || 'COD',
      shipping_address: order.shippingAddress || order.shipping_address || '',
      is_deleted: Boolean(order.is_deleted ?? order.isDeleted ?? false),
      created_at: order.created_at || order.createdAt || new Date().toISOString()
    };

    const { error } = await supabase.from('orders').upsert(payload);
    if (error) console.warn("Supabase order save error:", error.message);
    return !error;
  } catch (err) {
    console.warn("Error saving order to Supabase:", err);
    return false;
  }
}

export async function updateOrderStatusInSupabase(orderId: string, status: string) {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      const fallback = await supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId);
      error = fallback.error;
    }

    if (error) console.error("Supabase order status update error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error updating order status in Supabase:", err);
    return false;
  }
}

export async function softDeleteOrderInSupabase(orderId: string) {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase
      .from('orders')
      .update({ is_deleted: true, status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      const fallback = await supabase.from('orders').update({ is_deleted: true }).eq('id', orderId);
      error = fallback.error;
    }
    if (error) console.error("Supabase order delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error soft deleting order in Supabase:", err);
    return false;
  }
}

export async function restoreOrderInSupabase(orderId: string, status = 'Delivered') {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .update({ is_deleted: false, status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) console.error("Supabase order restore error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error restoring order in Supabase:", err);
    return false;
  }
}

export async function permanentDeleteOrderFromSupabase(orderId: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) console.error("Supabase order permanent delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error permanently deleting order from Supabase:", err);
    return false;
  }
}

/**
 * Customers Helper
 */
export async function getCustomersFromSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn("Supabase customers fetch error:", error.message);
      return null;
    }
    return (data || []).filter((c: any) => !c.is_deleted && !c.isDeleted && c.status !== 'deleted');
  } catch (err) {
    console.error("Error fetching customers from Supabase:", err);
    return null;
  }
}

export async function saveCustomerToSupabase(customer: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    const payload: Record<string, any> = {
      id: customer.id || `c_${Date.now()}`,
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || null,
      address: customer.address || '',
      status: customer.status || 'Active',
      photo: customer.photo || '',
      is_deleted: Boolean(customer.is_deleted ?? customer.isDeleted ?? false),
      created_at: customer.created_at || customer.createdAt || new Date().toISOString()
    };
    const { error } = await supabase.from('customers').upsert(payload);
    if (error) console.warn("Supabase customer save error:", error.message);
    return !error;
  } catch (err) {
    console.warn("Error saving customer to Supabase:", err);
    return false;
  }
}

export async function softDeleteCustomerInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase
      .from('customers')
      .update({ is_deleted: true, status: 'deleted' })
      .eq('id', id);

    if (error) {
      const fallback = await supabase.from('customers').update({ is_deleted: true }).eq('id', id);
      error = fallback.error;
    }
    if (error) console.error("Supabase customer delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error soft deleting customer in Supabase:", err);
    return false;
  }
}

export async function restoreCustomerInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('customers')
      .update({ is_deleted: false, status: 'Active' })
      .eq('id', id);
    if (error) console.error("Supabase customer restore error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error restoring customer in Supabase:", err);
    return false;
  }
}

export async function permanentDeleteCustomerFromSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) console.error("Supabase customer permanent delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error deleting customer from Supabase:", err);
    return false;
  }
}

export async function deleteCustomerFromSupabase(id: string) {
  return softDeleteCustomerInSupabase(id);
}

/**
 * Service Bookings Helper
 */
export async function getBookingsFromSupabase() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn("Supabase bookings fetch error:", error.message);
      return null;
    }
    return (data || []).filter((b: any) => !b.is_deleted && !b.isDeleted && b.status !== 'deleted');
  } catch (err) {
    console.error("Error fetching bookings from Supabase:", err);
    return null;
  }
}

export async function saveBookingToSupabase(booking: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    const payload: Record<string, any> = {
      id: booking.id || `b_${Date.now()}`,
      customer_name: booking.customer_name || booking.customerName || '',
      customer_phone: booking.customer_phone || booking.customerPhone || '',
      vehicle_model: booking.vehicle_model || booking.vehicleModel || '',
      vehicle_number: booking.vehicle_number || booking.vehicleNumber || '',
      service_type: booking.service_type || booking.serviceType || 'General Service',
      issue_description: booking.issue_description || booking.issueDescription || '',
      estimated_cost: Number(booking.estimated_cost ?? booking.estimatedCost ?? booking.totalAmount ?? 0),
      status: booking.status || 'Pending',
      is_deleted: Boolean(booking.is_deleted ?? booking.isDeleted ?? false),
      created_at: booking.created_at || booking.createdAt || new Date().toISOString()
    };
    const { error } = await supabase.from('bookings').upsert(payload);
    if (error) console.warn("Supabase booking save error:", error.message);
    return !error;
  } catch (err) {
    console.warn("Error saving booking to Supabase:", err);
    return false;
  }
}

export async function softDeleteBookingInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    let { error } = await supabase
      .from('bookings')
      .update({ is_deleted: true, status: 'deleted' })
      .eq('id', id);

    if (error) {
      const fallback = await supabase.from('bookings').update({ is_deleted: true }).eq('id', id);
      error = fallback.error;
    }
    if (error) console.error("Supabase booking delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error soft deleting booking in Supabase:", err);
    return false;
  }
}

export async function restoreBookingInSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ is_deleted: false, status: 'Pending' })
      .eq('id', id);
    if (error) console.error("Supabase booking restore error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error restoring booking in Supabase:", err);
    return false;
  }
}

export async function permanentDeleteBookingFromSupabase(id: string) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) console.error("Supabase booking permanent delete error:", error.message);
    return !error;
  } catch (err) {
    console.error("Error deleting booking from Supabase:", err);
    return false;
  }
}

/**
 * Universal Trash & Recycle Bin Helpers for Supabase
 */
export async function getTrashFromSupabase() {
  if (!isSupabaseConfigured) return [];
  const trash: any[] = [];

  const fetchTableTrash = async (
    table: string,
    entity: string,
    getName: (item: any) => string
  ) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      if (!error && Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item.is_deleted === true || item.isDeleted === true || item.status === 'deleted') {
            trash.push({
              id: item.id || item.order_id,
              entity: entity,
              name: getName(item),
              deletedAt: item.deletedAt || item.deleted_at || item.updated_at || new Date().toISOString(),
              originalData: item
            });
          }
        });
      }
    } catch (e) {
      console.warn(`Error fetching trash for ${table} from Supabase:`, e);
    }
  };

  await Promise.all([
    fetchTableTrash('vehicles', 'vehicles', (v) => `${v.brand || ''} ${v.model || ''}`.trim() || v.name || v.id),
    fetchTableTrash('products', 'products', (p) => p.titleEng || p.name || p.title || p.id),
    fetchTableTrash('orders', 'orders', (o) => `Order #${o.id || o.order_id} - ${o.customerName || o.customer_name || 'Customer'}`),
    fetchTableTrash('customers', 'customers', (c) => c.name || c.id),
    fetchTableTrash('bookings', 'bookings', (b) => `Job Card #${b.id} - ${b.customerName || 'Customer'}`)
  ]);

  return trash;
}

export async function restoreItemInSupabase(entity: string, id: string, originalData?: any) {
  if (!isSupabaseConfigured) return false;
  const table = entity;
  try {
    const updatePayload: any = { is_deleted: false };
    if (entity === 'orders') {
      updatePayload.status = originalData?.previousStatus || originalData?.previous_status || 'Delivered';
    } else if (entity === 'vehicles') {
      updatePayload.status = 'Available';
    } else if (entity === 'products' || entity === 'customers') {
      updatePayload.status = 'Active';
    } else if (entity === 'bookings') {
      updatePayload.status = 'Pending';
    }

    let { error } = await supabase.from(table).update(updatePayload).eq('id', id);
    if (error && entity === 'orders') {
      const retry = await supabase.from(table).update(updatePayload).eq('order_id', id);
      error = retry.error;
    }
    return !error;
  } catch (err) {
    console.error(`Error restoring ${entity} in Supabase:`, err);
    return false;
  }
}

export async function permanentDeleteItemFromSupabase(entity: string, id: string) {
  if (!isSupabaseConfigured) return false;
  const table = entity;
  try {
    let { error } = await supabase.from(table).delete().eq('id', id);
    if (error && entity === 'orders') {
      const retry = await supabase.from(table).delete().eq('order_id', id);
      error = retry.error;
    }
    return !error;
  } catch (err) {
    console.error(`Error permanently deleting ${entity} from Supabase:`, err);
    return false;
  }
}
