import React, { useState, useEffect, useCallback } from 'react';
import { WeatherSettings } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Loader2, Cloud, Sun, CloudRain, Zap, Snowflake, Wind, HelpCircle } from 'lucide-react';

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const WEATHER_ICON_MAP = {
  '01': Sun,
  '02': Cloud,
  '03': Cloud,
  '04': Cloud,
  '09': CloudRain,
  '10': CloudRain,
  '11': Zap,
  '13': Snowflake,
  '50': Wind,
};

const getWeatherIcon = (iconCode) => {
  if (!iconCode) return Cloud;
  const mainCode = iconCode.substring(0, 2);
  return WEATHER_ICON_MAP[mainCode] || Cloud;
};

export default function LiveWeather({ onClick }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [settings, setSettings] = useState(null);

    const fetchWeatherData = useCallback(async (currentSettings) => {
        if (!currentSettings || !currentSettings.api_key || !currentSettings.primary_location?.city) {
            setLoading(false);
            setError(true);
            return;
        }

        setLoading(true);
        setError(false);
        const { api_key, primary_location, units } = currentSettings;

        const locationQuery = `${primary_location.city},${primary_location.state},${primary_location.country}`;

        try {
            const response = await fetch(`${API_BASE_URL}weather?q=${encodeURIComponent(locationQuery)}&appid=${api_key}&units=${units}`);
            if (!response.ok) {
                throw new Error('Weather fetch failed');
            }
            const data = await response.json();
            setWeather(data);
        } catch (e) {
            console.error("Live weather fetch failed:", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadAndFetch = async () => {
            try {
                const existingSettings = await WeatherSettings.list();
                if (existingSettings.length > 0) {
                    const currentSettings = existingSettings[0];
                    setSettings(currentSettings);
                    await fetchWeatherData(currentSettings);
                } else {
                    setError(true);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Failed to load weather settings for live display:", e);
                setError(true);
                setLoading(false);
            }
        };

        loadAndFetch();
        
        const interval = setInterval(loadAndFetch, 300000); 
        return () => clearInterval(interval);
    }, [fetchWeatherData]);

    if (loading) {
        return (
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 cursor-wait" disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Weather
            </Button>
        );
    }

    if (error || !weather) {
        return (
            <Button onClick={onClick} variant="ghost" size="sm" className="text-yellow-400 hover:bg-slate-700 hover:text-white px-3" title="Weather data unavailable. Click to configure.">
                <HelpCircle className="w-4 h-4 mr-2" /> Weather
            </Button>
        );
    }

    const WeatherIcon = getWeatherIcon(weather.weather[0]?.icon);
    const tempUnit = settings.units === 'imperial' ? '°F' : '°C';
    const temp = Math.round(weather.main.temp);
    
    return (
        <Button onClick={onClick} variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3" title={`Current weather in ${weather.name}: ${temp}${tempUnit}, ${weather.weather[0].description}`}>
            <WeatherIcon className="w-4 h-4 mr-2" />
            <span>{temp}{tempUnit}</span>
        </Button>
    );
}