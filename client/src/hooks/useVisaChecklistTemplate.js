import { useState, useEffect } from 'react';
import axios from 'axios';
import { VISA_CHECKLIST_TEMPLATE as FALLBACK_TEMPLATE } from '../components/modals/VisaChecklistTemplate';

export const useVisaChecklistTemplate = () => {
    const [template, setTemplate] = useState(FALLBACK_TEMPLATE);
    const [loading, setLoading] = useState(true);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/settings/visa-checklist');
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setTemplate(res.data);
            }
        } catch (error) {
            console.error('Error fetching visa checklist template:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplate();
    }, []);

    const saveTemplate = async (newTemplate) => {
        try {
            await axios.post('/api/settings/visa-checklist', { template: newTemplate });
            setTemplate(newTemplate);
            return true;
        } catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
    };

    return { template, loading, fetchTemplate, saveTemplate };
};
