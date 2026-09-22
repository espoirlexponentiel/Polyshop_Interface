import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const SiteConfigContext = createContext();

export const SiteConfigProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('7shop_site_config');
      return saved ? JSON.parse(saved) : {
        brandName: 'PolyShop',
        brandBadge: 'P',
        logoUrl: '/poly.jpg',
        tagline: 'Boutique Officielle'
      };
    } catch {
      return {
        brandName: 'PolyShop',
        brandBadge: 'P',
        logoUrl: '/poly.jpg',
        tagline: 'Boutique Officielle'
      };
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchSiteConfig = useCallback(async () => {
    try {
      const res = await axios.get('/settings');
      if (res.data) {
        const configData = {
          brandName: res.data.brandName || 'PolyShop',
          brandBadge: res.data.brandBadge || 'P',
          logoUrl: res.data.logoUrl || '/poly.jpg',
          tagline: res.data.tagline || 'Boutique Officielle'
        };
        setSiteConfig(configData);
        localStorage.setItem('7shop_site_config', JSON.stringify(configData));
      }
    } catch (err) {
      console.warn('⚠️ Impossible de charger la configuration du site :', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteConfig();
  }, [fetchSiteConfig]);

  const updateSiteConfig = async (newConfig) => {
    try {
      const res = await axios.put('/settings', newConfig);
      if (res.data?.config) {
        const updated = {
          brandName: res.data.config.brandName || '7 SHOP',
          brandBadge: res.data.config.brandBadge || '7',
          logoUrl: res.data.config.logoUrl || '',
          tagline: res.data.config.tagline || 'Boutique Officielle'
        };
        setSiteConfig(updated);
        localStorage.setItem('7shop_site_config', JSON.stringify(updated));
        return { success: true, config: updated };
      }
      return { success: false, error: 'Réponse serveur inattendue' };
    } catch (err) {
      console.error('Erreur mise à jour site config :', err);
      return { 
        success: false, 
        error: err.response?.data?.error || err.response?.data?.message || err.message 
      };
    }
  };

  const uploadLogo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/settings/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.config) {
        const updated = {
          brandName: res.data.config.brandName || '7 SHOP',
          brandBadge: res.data.config.brandBadge || '7',
          logoUrl: res.data.config.logoUrl || res.data.logoUrl || '',
          tagline: res.data.config.tagline || 'Boutique Officielle'
        };
        setSiteConfig(updated);
        localStorage.setItem('7shop_site_config', JSON.stringify(updated));
        return { success: true, logoUrl: updated.logoUrl, config: updated };
      }
      return { success: false, error: 'Échec du téléversement' };
    } catch (err) {
      console.error('Erreur upload logo :', err);
      return { 
        success: false, 
        error: err.response?.data?.error || err.response?.data?.message || err.message 
      };
    }
  };

  return (
    <SiteConfigContext.Provider
      value={{
        siteConfig,
        loading,
        updateSiteConfig,
        uploadLogo,
        refreshSiteConfig: fetchSiteConfig
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);
