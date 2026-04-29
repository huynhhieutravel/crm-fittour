const axios = require('axios');

class MetaCatalogService {
  constructor() {
    this.csvHeaders = [
      'destination_id', 'name', 'description', 'price', 
      'image[0].url', 'image[0].tag[0]', 'video[0].url', 'video[0].tag[0]', 
      'type[0]', 'type[1]', 'url', 'price_change', 
      'custom_label_0', 'custom_label_1', 'custom_label_2', 'custom_label_3', 'custom_label_4', 
      'address.addr1', 'address.city', 'address.region', 'address.country'
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
    const description = (tour.highlights || tour.destination || `Mô tả tour ${tour.name}`)
      .replace(/<[^>]*>?/gm, "") // Strip HTML
      .substring(0, 5000) || tour.name;
    
    const row = new Array(this.csvHeaders.length).fill('');
    
    row[0] = tour.id.toString(); // destination_id
    row[1] = (tour.name || `Tên tour trống (ID: ${tour.id})`).substring(0, 150); // name
    row[2] = description; // description
    row[3] = `${parseInt(parseFloat(tour.base_price || 0)) || 0} VND`; // price
    row[4] = tour.image_url || 'https://erp.fittour.vn/default-tour.jpg'; // image[0].url
    
    row[8] = 'Tour'; // type[0]
    
    row[10] = tour.website_link || 'https://erp.fittour.vn/'; // url
    
    row[12] = (tour.bu_group || '').substring(0, 100); // custom_label_0
    row[13] = (tour.tour_type || '').substring(0, 100); // custom_label_1
    row[14] = (tour.duration || '').substring(0, 100); // custom_label_2
    row[17] = '19 Đ. Lương Hữu Khánh, P. Phạm Ngũ Lão, Quận 1'; // address.addr1
    row[18] = 'Hồ Chí Minh'; // address.city
    row[19] = 'Hồ Chí Minh'; // address.region
    row[20] = 'VN'; // address.country
    
    return row.map((field) => this.escapeCSV(field)).join(',');
  }

  generateCSV(tours) {
    const validTours = tours.filter(t => t.image_url && t.website_link && t.is_active !== false);
    const headerRow = this.csvHeaders.join(',');
    const dataRows = validTours.map(t => this.formatTourForDestinationCSV(t));
    return [headerRow, ...dataRows].join('\n');
  }

  formatTourForDestinationAPI(tour) {
    const description = (tour.highlights || tour.destination || `Mô tả tour ${tour.name}`)
      .replace(/<[^>]*>?/gm, "")
      .substring(0, 5000) || tour.name;

    return {
      destination_id: tour.id.toString(),
      name: (tour.name || `Tên tour trống`).substring(0, 150),
      description: description,
      price: `${parseInt(parseFloat(tour.base_price || 0)) || 0} VND`,
      url: tour.website_link || 'https://erp.fittour.vn/',
      image: [
        { url: tour.image_url || 'https://erp.fittour.vn/default-tour.jpg' }
      ],
      type: ["Tour"],
      address: {
        street1: "19 Đ. Lương Hữu Khánh, P. Phạm Ngũ Lão, Quận 1",
        city: "Hồ Chí Minh",
        region: "Hồ Chí Minh",
        country: "VN"
      }
    };
  }

  async sendBatchRequest(catalogId, token, requestsArray) {
    if (!catalogId || !token) return false;

    // Must wrap in item_type for synchronous catalog batch API or items_batch
    const payload = {
      item_type: 'DESTINATION',
      requests: requestsArray
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

  async syncTourToMeta(tour, settings) {
    const catalogId = settings['meta_catalog_id'];
    const token = settings['meta_system_user_token'];
    if (!catalogId || !token) return;

    let apiRequest = {};
    
    if (tour.is_active === false) {
      apiRequest = {
        method: "DELETE",
        data: { destination_id: tour.id.toString() }
      };
    } else {
      apiRequest = {
        method: "UPDATE",
        data: this.formatTourForDestinationAPI(tour)
      };
    }

    await this.sendBatchRequest(catalogId, token, [apiRequest]);
  }

  async syncAllTours(tours, catalogId, token) {
    const requests = tours.map(tour => {
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

    if (requests.length === 0) return true;

    const chunkSize = 500;
    for (let i = 0; i < requests.length; i += chunkSize) {
      const chunk = requests.slice(i, i + chunkSize);
      await this.sendBatchRequest(catalogId, token, chunk);
    }
    return true;
  }
}

module.exports = new MetaCatalogService();
