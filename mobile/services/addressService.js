import axios from 'axios';

const BASE_URL = 'https://psgc.gitlab.io/api';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

class Cache {
    constructor() {
        this.data = new Map();
    }

    set(key, value) {
        this.data.set(key, {
        value,
        timestamp: Date.now()
        });
    }

    get(key) {
        const item = this.data.get(key);
        if (!item) return null;
        if (Date.now() - item.timestamp > CACHE_DURATION) {
        this.data.delete(key);
        return null;
        }
        return item.value;
    }
}

const cache = new Cache();

const cleanCityName = (name) => {
    return name
        .replace(/(City of|Municipality of|District of)/i, '')
        .replace(/City$/i, '')
        .replace(/Municipality$/i, '')
        .replace(/District$/i, '')
        .trim();
};

export const addressService = {
    async getCities(searchTerm = '') {
        const cacheKey = 'cities';
        const cachedData = cache.get(cacheKey);
        
        try {
        let cities;
        if (!cachedData) {
            const response = await axios.get(`${BASE_URL}/cities.json`);
            cities = response.data
            .map(city => ({
                label: cleanCityName(city.name),
                value: city.code,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
            cache.set(cacheKey, cities);
        } else {
            cities = cachedData;
        }

        if (searchTerm) {
            return cities.filter(city => 
            city.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return cities;
        } catch (error) {
        throw new Error('Failed to fetch cities');
        }
    },

    
    async getBarangays(cityCode) {
        if (!cityCode) {
        throw new Error('City code is required');
        }

        const cacheKey = `barangays_${cityCode}`;
        const cachedData = cache.get(cacheKey);

        try {
        let barangays;
        if (!cachedData) {
            const response = await axios.get(`${BASE_URL}/cities/${cityCode}/barangays.json`);
            barangays = response.data
            .map(barangay => ({
                label: barangay.name,
                value: barangay.code
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
            cache.set(cacheKey, barangays);
        } else {
            barangays = cachedData;
        }
        
        return barangays;
        } catch (error) {
        throw new Error('Failed to fetch barangays');
        }
    },

    async searchCities(searchText) {
        try {
        if (!searchText || searchText.length < 2) return [];
        
        const cities = await this.getCities();
        return cities.filter(city => 
            city.label.toLowerCase().includes(searchText.toLowerCase())
        ).slice(0, 10); // Limit results to prevent performance issues
        
        } catch (error) {
        console.error('City search error:', error);
        throw new Error('Failed to search cities');
        }
    },

    async handleCityChange(cityId) {
        try {
        const cityList = await this.getCities();
        const selectedCity = cityList.find(city => city.value === cityId);
        const barangayList = await this.getBarangays(cityId);
        
        return {
            cityName: selectedCity?.label || '',
            barangays: barangayList
        };
        } catch (error) {
        throw new Error('Failed to handle city change');
        }
    },

    async getGeoLocation(address) {
        try {
        // First try with complete address
        const fullAddress = `${address.streetName},${address.barangay},${address.city},Philippines`;
        let response = await this.geocode(fullAddress);
    
        // If no results, try without street name
        if (!response.data || response.data.length === 0) {
            console.log('Address not found with street name, trying without...');
            const simpleAddress = `${address.barangay},${address.city},Philippines`;
            response = await this.geocode(simpleAddress);
        }
    
        if (response.data && response.data.length > 0) {
            return {
            latitude: parseFloat(response.data[0].lat),
            longitude: parseFloat(response.data[0].lon)
            };
        }
    
        // Return default coordinates if nothing found
        return {
            latitude: 14.5995,
            longitude: 120.9842
        };
        } catch (error) {
        console.error('Geocoding error:', error.response || error);
        throw error;
        }
    },
    
  // Helper method for geocoding
    async geocode(address) {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
        
        console.log('Geocoding URL:', url);
        
        return await axios.get(url, {
        headers: {
            'User-Agent': 'KNMobile/1.0'
        }
        });
    },

    async formatAddress(addressData) {
        try {
        const coordinates = await this.getGeoLocation(addressData);
        
        return {
            deliveryAddress: {
            houseNo: addressData.houseNo || 'none',
            streetName: addressData.streetName || 'none',
            barangay: addressData.barangay || 'none',
            city: addressData.city || 'none',
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
            }
        };
        } catch (error) {
        throw new Error('Failed to format address with coordinates');
        }
    },



    clearCache() {
        cache.data.clear();
    }
};

export const validateCityCode = (cityCode) => {
    return typeof cityCode === 'string' && cityCode.length === 9;
};