const axios = require('axios');

class MetaCatalogService {
  constructor() {
    this.csvHeaders = [
      'destination_id', 'name', 'description', 'price', 
      'image[0].url', 'image[0].tag[0]', 'video[0].url', 'video[0].tag[0]', 
      'type[0]', 'type[1]', 'url', 'price_change', 
      'custom_label_0', 'custom_label_1', 'custom_label_2', 'custom_label_3', 'custom_label_4', 
      'custom_number_0', 'custom_number_1', 'custom_number_2', 'custom_number_3', 'custom_number_4', 
      'address.addr1', 'address.addr2', 'address.addr3', 'address.city', 'address.city_id', 
      'address.region', 'address.postal_code', 'address.country', 'address.unit_number', 
      'latitude', 'longitude', 'neighborhood[0]', 'target_radius_in_km', 
      'location_polygon[0].latitude', 'location_polygon[0].longitude', 
      'location_polygon[1].latitude', 'location_polygon[1].longitude', 
      'location_polygon[2].latitude', 'location_polygon[2].longitude', 
      'applink.android_app_name', 'applink.android_package', 'applink.android_url', 
      'applink.ios_app_name', 'applink.ios_app_store_id', 'applink.ios_url', 
      'applink.ipad_app_name', 'applink.ipad_app_store_id', 'applink.ipad_url', 
      'applink.iphone_app_name', 'applink.iphone_app_store_id', 'applink.iphone_url', 
      'applink.windows_phone_app_id', 'applink.windows_phone_app_name', 'applink.windows_phone_url', 
      'product_tags[0]', 'product_tags[1]'
    ];
  }

  escapeCSV(field) {
    if (field == null) return '';
    let stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }

  formatTourForDestinationCSV(tour) {
    // Basic formatting
    const description = (tour.highlights || tour.destination || `Mô tả tour ${tour.name}`)
      .replace(/<[^>]*>?/gm, "") // Strip HTML
      .substring(0, 5000) || tour.name;
    
    // The exact 57 columns array initialized with empty strings
    const row = new Array(this.csvHeaders.length).fill('');
    
    // Map existing fields to Facebook Destination Catalog Schema
    row[0] = tour.id.toString(); // destination_id
    row[1] = (tour.name || `Tên tour trống (ID: ${tour.id})`).substring(0, 150); // name
    row[2] = description; // description
    row[3] = `${parseFloat(tour.base_price || 0)} VND`; // price
    row[4] = tour.image_url || 'https://crm.tournuocngoai.com/default-tour.jpg'; // image[0].url
    
    row[8] = 'Tour'; // type[0]
    
    row[10] = tour.website_link || 'https://crm.tournuocngoai.com/'; // url
    
    row[12] = (tour.bu_group || '').substring(0, 100); // custom_label_0
    row[13] = (tour.tour_type || '').substring(0, 100); // custom_label_1
    row[14] = (tour.duration || '').substring(0, 100); // custom_label_2
    
    row[29] = (tour.destination || '').substring(0, 100); // address.country
    
    // Map with escaping
    return row.map((field) => this.escapeCSV(field)).join(',');
  }

  // ====== CSV EXPORT ======
  generateCSV(tours) {
    // Only export valid tours that have the mandatory fields
    const validTours = tours.filter(t => t.image_url && t.website_link && t.is_active !== false); // Exclude inactive from CSV too, just in case!
    const headerRow = this.csvHeaders.join(',');
    const dataRows = validTours.map(t => this.formatTourForDestinationCSV(t));
    return [headerRow, ...dataRows].join('\n');
  }

  // ====== BATCH API INTEGRATION ======

  formatTourForDestinationAPI(tour) {
    const description = (tour.highlights || tour.destination || `Mô tả tour ${tour.name}`)
      .replace(/<[^>]*>?/gm, "")
      .substring(0, 5000) || tour.name;

    return {
      destination_id: tour.id.toString(),
      name: (tour.name || `Tên tour trống`).substring(0, 150),
      description: description,
      price: `${parseFloat(tour.base_price || 0)} VND`,
      url: tour.website_link || 'https://crm.tournuocngoai.com/',
      image: [
        { url: tour.image_url || 'https://crm.tournuocngoai.com/default-tour.jpg' }
      ]
      // Optional fields such as address can be omitted, as per bare minimum DAT requirements
    };
  }

  async sendBatchRequest(catalogId, token, requestsArray) {
    if (!catalogId || !token) {
      console.warn('[MetaCatalog API] Missing catalog_id or token. Cannot sync.');
      return false;
    }

    const payload = {
      item_type: 'DESTINATION',
      requests: requestsArray
      // We don't strictly require top-level retailer_id because Destination format puts it in `data.destination_id`
      // Wait, Facebook's item_batch specifies "method" and "data" for each request!
    };

    try {
      const fbUrl = `https://graph.facebook.com/v19.0/${catalogId}/items_batch`;
      const response = await axios.post(fbUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`[MetaCatalog API] Sync success! Handles: ${response.data?.handles?.join(', ')}`);
      return true;
    } catch (error) {
      console.error('[MetaCatalog API] Sync failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Sync a single tour immediately
   */
  async syncTourToMeta(tour, settings) {
    const catalogId = settings['meta_catalog_id'];
    const token = settings['meta_system_user_token'];
    
    if (!catalogId || !token) return;
    if (!tour.image_url || !tour.website_link) return;

    let apiRequest = {};
    
    if (tour.is_active === false) {
      // If inactive, we delete it from the catalog to stop Ads
      apiRequest = {
        method: "DELETE",
        data: {
          destination_id: tour.id.toString()
        }
      };
    } else {
      // If active, we Create/Update it
      apiRequest = {
        method: "UPDATE",
        data: this.formatTourForDestinationAPI(tour)
      };
    }

    await this.sendBatchRequest(catalogId, token, [apiRequest]);
  }

  /**
   * Sync multiple tours at once (Used by "Đồng bộ tất cả" button)
   */
  async syncAllTours(tours, catalogId, token) {
    const requests = tours
      .filter(t => t.image_url && t.website_link)
      .map(tour => {
        if (tour.is_active === false) {
          return {
            method: "DELETE",
            data: { destination_id: tour.id.toString() }
          };
        } else {
          return {
            method: "UPDATE",
            data: this.formatTourForDestinationAPI(tour)
          };
        }
      });

    // FB Batch API limits to 1000 items per batch, we safely chuck if large, but CRM has few tours
    if (requests.length === 0) return true;

    // chunk array by 500
    const chunkSize = 500;
    for (let i = 0; i < requests.length; i += chunkSize) {
      const chunk = requests.slice(i, i + chunkSize);
      await this.sendBatchRequest(catalogId, token, chunk);
    }
    return true;
  }
}

module.exports = new MetaCatalogService();
