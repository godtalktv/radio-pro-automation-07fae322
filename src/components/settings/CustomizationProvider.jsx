
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StationSettings, User } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";

const CustomizationContext = createContext();

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

// Define a set of professional default categories
const DEFAULT_CATEGORIES = [
  { name: 'Top 40', icon: 'Music', color: '#3b82f6' }, // Blue
  { name: 'Rock Hits', icon: 'Music', color: '#ef4444' }, // Red
  { name: 'Classic Rock', icon: 'Music', color: '#f97316' }, // Orange
  { name: 'Country', icon: 'Music', color: '#a16207' }, // Brown
  { name: 'Station ID', icon: 'Radio', color: '#8b5cf6' }, // Purple
  { name: 'Jingles', icon: 'Zap', color: '#eab308' }, // Yellow
  { name: 'Commercials', icon: 'Mic', color: '#22c55e' }, // Green
  { name: 'Promos', icon: 'Radio', color: '#4f46e5' }, // Indigo
];

export const CustomizationProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const ensureCategoryIds = (categories = []) => {
    return categories.map(cat => ({
      ...cat,
      id: cat.id || crypto.randomUUID()
    }));
  };

  const loadSettings = async () => {
    try {
      const user = await User.me();
      if (!user?.organization_id) {
        setIsLoading(false);
        return;
      }

      const existingSettings = await StationSettings.filter({ organization_id: user.organization_id });

      if (existingSettings.length > 0) {
        const settingsData = existingSettings[0];
        // Ensure existing categories have IDs, but don't add defaults if they already exist
        const categoriesWithIds = ensureCategoryIds(settingsData.custom_categories);

        if (JSON.stringify(categoriesWithIds) !== JSON.stringify(settingsData.custom_categories)) {
            const updated = await StationSettings.update(settingsData.id, { custom_categories: categoriesWithIds });
            setSettings(updated);
        } else {
            setSettings(settingsData);
        }
      } else {
        // Create new settings with the professional defaults
        const defaultSettings = {
          organization_id: user.organization_id,
          station_name: 'My Radio Station',
          custom_categories: ensureCategoryIds(DEFAULT_CATEGORIES) // Add defaults here
        };
        const created = await StationSettings.create(defaultSettings);
        setSettings(created);
        toast({
            title: "Welcome!",
            description: "We've added some default categories to get you started.",
            className: "bg-blue-900 border-blue-600"
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({ variant: "destructive", title: "Settings Error", description: "Failed to load station settings." });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettingsData) => {
    try {
      if (!settings?.id) {
        throw new Error('Settings not properly initialized. Cannot update.');
      }
      const updatedDataWithIds = {
          ...newSettingsData,
          custom_categories: ensureCategoryIds(newSettingsData.custom_categories)
      };
      const updated = await StationSettings.update(settings.id, updatedDataWithIds);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({ variant: "destructive", title: "Save Error", description: "Failed to save station settings." });
      throw error;
    }
  };

  const removeCustomCategory = async (categoryIdToRemove) => {
    if (!settings || !settings.custom_categories) {
      toast({ variant: "destructive", title: "Error", description: "Settings not loaded." });
      return;
    }
    
    const currentCategories = settings.custom_categories;
    const newCategories = currentCategories.filter(cat => cat.id !== categoryIdToRemove);
    
    const settingsUpdatePayload = { custom_categories: newCategories };
    
    setSettings(prevSettings => ({
      ...prevSettings,
      custom_categories: newCategories
    }));

    try {
      await StationSettings.update(settings.id, settingsUpdatePayload);
    } catch (error) {
      console.error('Failed to save category deletion:', error);
      setSettings(prevSettings => ({
        ...prevSettings,
        custom_categories: currentCategories
      }));
      toast({ variant: "destructive", title: "Delete Failed", description: "Could not save the change. Please try again." });
      throw error;
    }
  };

  const getStationName = () => settings?.station_name || 'RadioPro Studio';
  const getStationCallsign = () => settings?.station_callsign || '';
  
  return (
    <CustomizationContext.Provider value={{ settings, isLoading, loadSettings, updateSettings, removeCustomCategory, getStationName, getStationCallsign }}>
      {children}
    </CustomizationContext.Provider>
  );
};
