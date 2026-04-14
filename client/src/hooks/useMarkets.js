import { useState, useEffect } from 'react';
import axios from 'axios';

// Cache markets in memory to avoid re-fetching on every component mount
let cachedMarkets = null;
let fetchPromise = null;

/**
 * Custom hook to fetch markets from API (DB-driven)
 * Returns React-Select grouped format: [{ label, options: [{ value, label }] }]
 */
export function useMarkets() {
    const [markets, setMarkets] = useState(cachedMarkets || []);

    useEffect(() => {
        if (cachedMarkets) {
            setMarkets(cachedMarkets);
            return;
        }

        if (!fetchPromise) {
            const token = localStorage.getItem('token');
            fetchPromise = axios.get('/api/markets', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                cachedMarkets = res.data;
                return res.data;
            }).catch(err => {
                console.error('Error fetching markets:', err);
                return [];
            });
        }

        fetchPromise.then(data => {
            setMarkets(data);
        });
    }, []);

    return markets;
}

/**
 * Invalidate cache (call after admin adds/edits/deletes markets)
 */
export function invalidateMarketsCache() {
    cachedMarkets = null;
    fetchPromise = null;
}

/**
 * Get all child market names for a given parent group name
 * @param {string} parentName - e.g. "Trung Quốc Đại Lục" 
 * @param {Array} marketTree - The tree from useMarkets()
 * @returns {string[]} - e.g. ["Trung Quốc", "Bắc Kinh", "Giang Nam", ...]
 */
export function getChildMarkets(parentName, marketTree) {
    if (!marketTree || !parentName) return [];
    const group = marketTree.find(g => g.label === parentName);
    if (group && group.options) {
        return group.options.map(o => o.value);
    }
    // Also check if parentName is itself a child value — find its siblings
    for (const g of marketTree) {
        const found = g.options?.find(o => o.value === parentName);
        if (found) {
            return g.options.map(o => o.value);
        }
    }
    return [];
}

/**
 * Get the parent group label for a given child market value
 * @param {string} childValue - e.g. "Bắc Kinh"
 * @param {Array} marketTree - The tree from useMarkets()
 * @returns {string|null} - e.g. "Trung Quốc Đại Lục"
 */
export function getParentMarket(childValue, marketTree) {
    if (!marketTree || !childValue) return null;
    for (const g of marketTree) {
        if (g.options?.some(o => o.value === childValue)) {
            return g.label;
        }
    }
    return null;
}

/**
 * Build a comma-separated market_group string for API filtering
 * When user selects a parent, include all its children
 * When user selects a child, just use the child  
 */
export function buildMarketGroupParam(selectedValue, marketTree) {
    if (!selectedValue || !marketTree) return selectedValue;
    
    // Check if selectedValue is a parent group label
    const group = marketTree.find(g => g.label === selectedValue);
    if (group && group.options) {
        return group.options.map(o => o.value).join(',');
    }
    
    // It's a child value — just use it directly
    return selectedValue;
}
