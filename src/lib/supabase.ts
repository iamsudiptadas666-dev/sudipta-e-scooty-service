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
    // 1. Try id = 'global_settings'
    const { data: byId } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'global_settings')
      .maybeSingle();

    if (byId && (byId.value || byId.data)) {
      return byId.value || byId.data;
    }

    // 2. Try key = 'global_settings'
    const { data: byKey } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'global_settings')
      .maybeSingle();

    if (byKey && (byKey.value || byKey.data)) {
      return byKey.value || byKey.data;
    }

    // 3. Try app_settings backup table
    const { data: appData } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 'global_settings')
      .maybeSingle();

    if (appData && (appData.data || appData.value)) {
      return appData.data || appData.value;
    }

    return null;
  } catch (err) {
    return null;
  }
}

export async function saveSettingsToSupabase(settingsData: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    const payload = {
      id: 'global_settings',
      key: 'global_settings',
      value: settingsData,
      data: settingsData,
      updated_at: new Date().toISOString()
    };

    // 1. Try upserting into public.settings with onConflict: id
    const { error } = await supabase
      .from('settings')
      .upsert(payload, { onConflict: 'id' });

    if (!error) return true;

    // 2. If id conflict failed or table uses 'key' as primary/unique, try onConflict: key
    if (error.code === 'PGRST116' || error.message?.includes('key') || error.message?.includes('conflict')) {
      const { error: keyErr } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'key' });
      if (!keyErr) return true;
    }

    // 3. Try app_settings table as backup
    try {
      const { error: appErr } = await supabase
        .from('app_settings')
        .upsert({
          id: 'global_settings',
          data: settingsData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      if (!appErr) return true;
    } catch (_) {}

    // 4. Log clear notice if RLS is blocking
    if (error.message?.includes('permission') || error.code === '42501' || (error as any).status === 401) {
      console.warn("Supabase settings notice: Row Level Security (RLS) is enabled on 'settings'. Run 'ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;' in Supabase SQL editor.");
    } else {
      console.warn("Supabase settings save notice:", error.message);
    }
    return false;
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
    return (data || [])
      .filter((v: any) => !v.is_deleted && !v.isDeleted && v.status !== 'deleted')
      .map((v: any) => {
        const imgList = Array.isArray(v.images) && v.images.length > 0 
          ? v.images 
          : (v.image ? [v.image] : ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800"]);
        
        return {
          id: v.id,
          brand: v.brand || '',
          model: v.model || v.name || '',
          name: v.model || v.name || '',
          price: Number(v.price || 0),
          offerPrice: Number(v.offerPrice ?? v.offer_price ?? v.price ?? 0),
          offer_price: Number(v.offer_price ?? v.offerPrice ?? v.price ?? 0),
          emiPrice: Number(v.emiPrice ?? v.emi_price ?? 0),
          emi_price: Number(v.emi_price ?? v.emiPrice ?? 0),
          stock: Number(v.stock || 0),
          stockQuantity: Number(v.stockQuantity ?? v.stock_quantity ?? v.stock ?? 0),
          stock_quantity: Number(v.stock_quantity ?? v.stockQuantity ?? v.stock ?? 0),
          stockStatus: v.stockStatus || v.stock_status || (Number(v.stock || 0) > 0 ? "In Stock" : "Out of Stock"),
          stock_status: v.stock_status || v.stockStatus || (Number(v.stock || 0) > 0 ? "In Stock" : "Out of Stock"),
          status: v.status || 'Available',
          color: v.color || '',
          colorsEng: v.colorsEng || v.color || '',
          colorsBen: v.colorsBen || v.color || '',
          battery: v.battery || '',
          batteryTypeEng: v.batteryTypeEng || v.battery || '',
          batteryTypeBen: v.batteryTypeBen || v.battery || '',
          motor: v.motor || '',
          motorPower: v.motorPower || v.motor || '',
          range: v.range || '',
          chargingTime: v.chargingTime || '4-5 Hours',
          topSpeed: v.topSpeed || v.top_speed || '',
          top_speed: v.top_speed || v.topSpeed || '',
          warrantyEng: v.warrantyEng || '3 Years Battery Warranty',
          warrantyBen: v.warrantyBen || '৩ বছরের ব্যাটারি ওয়ারেন্টি',
          image: v.image || imgList[0],
          images: imgList,
          videoUrl: v.videoUrl || v.video_url || '',
          video_url: v.video_url || v.videoUrl || '',
          descriptionEng: v.descriptionEng || v.description_eng || v.description || '',
          descriptionBen: v.descriptionBen || v.description_ben || v.description || '',
          description: v.description || v.descriptionEng || v.description_eng || '',
          createdAt: v.createdAt || v.created_at || new Date().toISOString()
        };
      });
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
      offer_price: Number(vehicle.offerPrice ?? vehicle.offer_price ?? 0),
      emi_price: Number(vehicle.emiPrice ?? vehicle.emi_price ?? 0),
      stock: Number(vehicle.stock || 0),
      stock_quantity: Number(vehicle.stockQuantity ?? vehicle.stock_quantity ?? vehicle.stock ?? 0),
      stock_status: vehicle.stockStatus || vehicle.stock_status || 'In Stock',
      status: vehicle.status || 'Available',
      color: vehicle.color || '',
      battery: vehicle.battery || '',
      motor: vehicle.motor || '',
      range: vehicle.range || '',
      top_speed: vehicle.top_speed || vehicle.topSpeed || '',
      image: vehicle.image || (vehicle.images && vehicle.images[0]) || '',
      images: Array.isArray(vehicle.images) ? vehicle.images : (vehicle.image ? [vehicle.image] : []),
      description: vehicle.description || vehicle.descriptionEng || '',
      description_eng: vehicle.descriptionEng || vehicle.description_eng || vehicle.description || '',
      description_ben: vehicle.descriptionBen || vehicle.description_ben || '',
      is_deleted: Boolean(vehicle.is_deleted ?? vehicle.isDeleted ?? false),
      created_at: vehicle.created_at || vehicle.createdAt || new Date().toISOString()
    };
    let { error } = await supabase.from('vehicles').upsert(payload);

    // Fallback if older schema is missing some newly added columns
    if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
      console.warn("Retrying vehicle save with core columns:", error.message);
      const basicPayload = {
        id: payload.id,
        brand: payload.brand,
        model: payload.model,
        price: payload.price,
        stock: payload.stock,
        status: payload.status,
        image: payload.image,
        description: payload.description,
        is_deleted: payload.is_deleted
      };
      const retry = await supabase.from('vehicles').upsert(basicPayload);
      if (!retry.error) return true;
      error = retry.error;
    }

    if (error) console.warn("Supabase vehicle save error:", error.message, error.hint || '');
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
  try {
    await softDeleteVehicleInSupabase(id);
    return await permanentDeleteVehicleFromSupabase(id);
  } catch (_) {
    return false;
  }
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
    return (data || [])
      .filter((p: any) => !p.is_deleted && !p.isDeleted && p.status !== 'deleted')
      .map((p: any) => {
        const engTitle = p.titleEng || p.title_eng || p.name || p.title || '';
        const benTitle = p.titleBen || p.title_ben || engTitle;
        const imgList = Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : ["https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800"]);

        const regPrice = Number(p.price || 0);
        const rawOffer = Number(p.offerPrice !== undefined ? p.offerPrice : (p.offer_price !== undefined ? p.offer_price : 0));
        const finalOffer = (rawOffer > 0) ? rawOffer : regPrice;
        const finalPrice = (regPrice > 0) ? regPrice : finalOffer;

        return {
          id: p.id,
          // Support both frontend camelCase and database snake_case/name
          titleEng: engTitle,
          titleBen: benTitle,
          title_eng: engTitle,
          title_ben: benTitle,
          name: engTitle,
          title: engTitle,
          category: p.category || 'General',
          brand: p.brand || 'Sudipta Power',
          price: finalPrice,
          offerPrice: finalOffer,
          offer_price: finalOffer,
          purchasePrice: Number(p.purchasePrice !== undefined ? p.purchasePrice : (p.purchase_price !== undefined ? p.purchase_price : 0)),
          purchase_price: Number(p.purchase_price !== undefined ? p.purchase_price : (p.purchasePrice !== undefined ? p.purchasePrice : 0)),
          stock: Number(p.stock || 0),
          status: p.status || 'Active',
          images: imgList,
          image: p.image || imgList[0],
          descriptionEng: p.descriptionEng || p.description_eng || p.description || '',
          descriptionBen: p.descriptionBen || p.description_ben || p.description || '',
          description_eng: p.description_eng || p.descriptionEng || p.description || '',
          description_ben: p.description_ben || p.descriptionBen || p.description || '',
          description: p.description || p.descriptionEng || p.description_eng || '',
          deliveryCharge: Number(p.deliveryCharge ?? p.delivery_charge ?? 0),
          delivery_charge: Number(p.delivery_charge ?? p.deliveryCharge ?? 0),
          createdAt: p.createdAt || p.created_at || new Date().toISOString()
        };
      });
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return null;
  }
}

export async function saveProductToSupabase(product: Record<string, any>) {
  if (!isSupabaseConfigured) return false;
  try {
    const regPrice = Number(product.price || 0);
    const rawOffer = Number(product.offerPrice !== undefined ? product.offerPrice : (product.offer_price !== undefined ? product.offer_price : 0));
    const offerPriceToSave = rawOffer > 0 ? rawOffer : regPrice;
    const finalPriceToSave = regPrice > 0 ? regPrice : offerPriceToSave;

    const payload: Record<string, any> = {
      id: product.id || `p_${Date.now()}`,
      name: product.name || product.titleEng || product.title || '',
      title_eng: product.titleEng || product.title_eng || product.name || '',
      title_ben: product.titleBen || product.title_ben || '',
      category: product.category || 'General',
      brand: product.brand || 'Sudipta Power',
      price: finalPriceToSave,
      offer_price: offerPriceToSave,
      purchase_price: Number(product.purchasePrice ?? product.purchase_price ?? 0),
      stock: Number(product.stock || 0),
      status: product.status || 'Active',
      image: (product.images && product.images[0]) || product.image || '',
      images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
      description: product.description || product.descriptionEng || '',
      description_eng: product.descriptionEng || product.description_eng || product.description || '',
      description_ben: product.descriptionBen || product.description_ben || '',
      delivery_charge: Number(product.deliveryCharge ?? product.delivery_charge ?? 0),
      is_deleted: Boolean(product.is_deleted ?? product.isDeleted ?? false),
      created_at: product.created_at || product.createdAt || new Date().toISOString()
    };
    let { error } = await supabase.from('products').upsert(payload);

    // If it fails due to missing columns in an older/partial schema, retry with basic columns
    if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
      console.warn("Retrying product save with basic columns due to schema difference:", error.message);
      const basicPayload: Record<string, any> = {
        id: payload.id,
        name: payload.name,
        price: payload.price,
        stock: payload.stock,
        category: payload.category,
        image: payload.image,
        description: payload.description,
        is_deleted: payload.is_deleted
      };
      const retry = await supabase.from('products').upsert(basicPayload);
      if (!retry.error) return true;
      error = retry.error;
    }

    if (error) console.warn("Supabase product save error:", error.message, error.hint || '');
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
  try {
    await softDeleteProductInSupabase(id);
    return await permanentDeleteProductFromSupabase(id);
  } catch (_) {
    return false;
  }
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
    const orders = (data || [])
      .filter((o: any) => !o.is_deleted && !o.isDeleted && o.status !== 'deleted')
      .map((o: any) => ({
        id: o.id || o.order_id,
        orderId: o.orderId || o.order_id || o.id,
        order_id: o.order_id || o.orderId || o.id,
        customerName: o.customerName || o.customer_name || '',
        customer_name: o.customer_name || o.customerName || '',
        customerPhone: o.customerPhone || o.customer_phone || '',
        customer_phone: o.customer_phone || o.customerPhone || '',
        customerEmail: o.customerEmail || o.customer_email || null,
        customerAddress: o.customerAddress || o.customer_address || o.shippingAddress || o.shipping_address || '',
        items: Array.isArray(o.items) ? o.items : [],
        totalAmount: Number(o.totalAmount ?? o.total_amount ?? 0),
        total_amount: Number(o.total_amount ?? o.totalAmount ?? 0),
        status: o.status || 'Pending',
        previousStatus: o.previousStatus || o.previous_status || null,
        paymentMethod: o.paymentMethod || o.payment_method || 'COD',
        shippingAddress: o.shippingAddress || o.shipping_address || o.customerAddress || '',
        createdAt: o.createdAt || o.created_at || new Date().toISOString()
      }));

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

    let { error } = await supabase.from('orders').upsert(payload);

    if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
      console.warn("Retrying order save with basic columns:", error.message);
      const basicPayload = {
        id: payload.id,
        order_id: payload.order_id,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        items: payload.items,
        total_amount: payload.total_amount,
        status: payload.status,
        is_deleted: payload.is_deleted
      };
      const retry = await supabase.from('orders').upsert(basicPayload);
      if (!retry.error) return true;
      error = retry.error;
    }

    if (error) console.warn("Supabase order save error:", error.message, error.hint || '');
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
      vehicle_details: customer.vehicleDetails || customer.vehicle_details || '',
      service_history: customer.serviceHistory || customer.service_history || [],
      payment_history: customer.paymentHistory || customer.payment_history || [],
      emi_records: customer.emiRecords || customer.emi_records || [],
      is_deleted: Boolean(customer.is_deleted ?? customer.isDeleted ?? false),
      created_at: customer.created_at || customer.createdAt || new Date().toISOString()
    };
    let { error } = await supabase.from('customers').upsert(payload);

    if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
      console.warn("Retrying customer save with basic columns:", error.message);
      const basicPayload = {
        id: payload.id,
        name: payload.name,
        phone: payload.phone,
        status: payload.status,
        is_deleted: payload.is_deleted
      };
      const retry = await supabase.from('customers').upsert(basicPayload);
      if (!retry.error) return true;
      error = retry.error;
    }

    if (error) console.warn("Supabase customer save error:", error.message, error.hint || '');
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
    let { error } = await supabase.from('bookings').upsert(payload);

    if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
      console.warn("Retrying booking save with basic columns:", error.message);
      const basicPayload = {
        id: payload.id,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        status: payload.status,
        is_deleted: payload.is_deleted
      };
      const retry = await supabase.from('bookings').upsert(basicPayload);
      if (!retry.error) return true;
      error = retry.error;
    }

    if (error) console.warn("Supabase booking save error:", error.message, error.hint || '');
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
