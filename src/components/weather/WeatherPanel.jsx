
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
// Removed Tabs imports as they are no longer used in the main display
import { WeatherSettings } from '@/api/entities';
import { 
  Cloud, Sun, CloudRain, Zap, Snowflake, Wind, Droplets, Thermometer,
  RefreshCw, AlertTriangle, MapPin, Settings, X, Loader2, Save
} from 'lucide-react';

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const WEATHER_ICON_MAP = {
  '01': Sun,      // clear sky
  '02': Cloud,    // few clouds
  '03': Cloud,    // scattered clouds
  '04': Cloud,    // broken clouds
  '09': CloudRain,// shower rain
  '10': CloudRain,// rain
  '11': Zap,      // thunderstorm
  '13': Snowflake,// snow
  '50': Wind,     // mist
};

const getWeatherIcon = (iconCode) => {
  if (!iconCode) return Cloud;
  const mainCode = iconCode.substring(0, 2);
  return WEATHER_ICON_MAP[mainCode] || Cloud;
};

const WeatherSettingsForm = ({ onSave, initialSettings }) => {
  const [formData, setFormData] = useState({
    api_key: '',
    primary_location: { city: '', state: '', country: 'US' }, // Default to US
    units: 'imperial',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [testingLocation, setTestingLocation] = useState(false);
  const [locationTestResult, setLocationTestResult] = useState(null);

  useEffect(() => {
    if (initialSettings) {
      setFormData({
        api_key: initialSettings.api_key || '',
        primary_location: initialSettings.primary_location || { city: '', state: '', country: 'US' },
        units: initialSettings.units || 'imperial',
      });
    }
  }, [initialSettings]);

  const testLocation = async () => {
    if (!formData.api_key || !formData.primary_location.city) {
      setLocationTestResult({ success: false, message: "Please enter API key and city first." });
      return;
    }

    setTestingLocation(true);
    setLocationTestResult(null);

    try {
      // Try different location query formats
      const locationQueries = [
        // Format 1: City,State,Country
        `${formData.primary_location.city},${formData.primary_location.state},${formData.primary_location.country}`,
        // Format 2: City,Country (without state)
        `${formData.primary_location.city},${formData.primary_location.country}`,
        // Format 3: Just city name
        formData.primary_location.city
      ].filter(query => query && !query.includes(',,')); // Remove entries like "City,,Country"

      let success = false;
      let lastError = '';

      for (const locationQuery of locationQueries) {
        if (!locationQuery || locationQuery.endsWith(',')) continue; // Skip malformed queries

        try {
          const response = await fetch(`${API_BASE_URL}weather?q=${encodeURIComponent(locationQuery)}&appid=${formData.api_key}&units=${formData.units}`);
          
          if (response.ok) {
            const data = await response.json();
            setLocationTestResult({ 
              success: true, 
              message: `Found: ${data.name}, ${data.sys.country}`,
              data: data
            });
            success = true;
            break;
          } else {
            lastError = `${response.status}: ${response.statusText}`;
          }
        } catch (e) {
          lastError = e.message;
        }
      }

      if (!success) {
        setLocationTestResult({ 
          success: false, 
          message: `Location not found. Last error: ${lastError}. Try a different city name or check your API key.`
        });
      }

    } catch (error) {
      setLocationTestResult({ success: false, message: error.message });
    } finally {
      setTestingLocation(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let settingsRecord;
      if (initialSettings?.id) {
        settingsRecord = await WeatherSettings.update(initialSettings.id, { ...initialSettings, ...formData });
      } else {
        settingsRecord = await WeatherSettings.create({
          ...formData,
          organization_id: 'default' // This would be dynamic in a multi-tenant app
        });
      }
      onSave(settingsRecord);
    } catch (error) {
      console.error('Failed to save weather settings:', error);
      alert('Could not save settings. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-center">
      <Card className="max-w-lg w-full bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-2">Weather API Setup</h3>
        <p className="text-slate-400 mb-6 text-sm">
          Enter your OpenWeatherMap API key and location. Use the test button to verify your settings.
        </p>
        <div className="space-y-4 text-left">
          <div>
            <Label className="text-slate-300 text-sm">OpenWeatherMap API Key</Label>
            <Input
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData({...formData, api_key: e.target.value})}
              className="w-full mt-1 bg-slate-900 border border-slate-600 rounded text-white"
              placeholder="Your API key from openweathermap.org"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">City Name</Label>
            <Input
              type="text"
              value={formData.primary_location.city}
              onChange={(e) => setFormData({
                ...formData, 
                primary_location: {...formData.primary_location, city: e.target.value}
              })}
              className="w-full mt-1 bg-slate-900 border border-slate-600 rounded text-white"
              placeholder="e.g., Lubbock (just the city name)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">State Code (optional)</Label>
              <Input
                type="text"
                value={formData.primary_location.state}
                onChange={(e) => setFormData({
                  ...formData, 
                  primary_location: {...formData.primary_location, state: e.target.value.toUpperCase()}
                })}
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded text-white"
                placeholder="TX"
                maxLength={2}
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Country Code</Label>
              <Input
                type="text"
                value={formData.primary_location.country}
                onChange={(e) => setFormData({
                  ...formData, 
                  primary_location: {...formData.primary_location, country: e.target.value.toUpperCase()}
                })}
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded text-white"
                placeholder="US"
                maxLength={2}
              />
            </div>
          </div>

          {/* Test Location Button */}
          <Button 
            onClick={testLocation} 
            disabled={testingLocation || !formData.api_key || !formData.primary_location.city}
            variant="outline"
            className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
          >
            {testingLocation ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
            Test Location
          </Button>

          {/* Test Result */}
          {locationTestResult && (
            <div className={`p-3 rounded text-sm ${
              locationTestResult.success 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {locationTestResult.message}
            </div>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !locationTestResult?.success} 
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
      </Card>
    </div>
  );
};

export default function WeatherPanel() {
  const [settings, setSettings] = useState(null);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const existingSettings = await WeatherSettings.list();
      if (existingSettings.length > 0) {
        setSettings(existingSettings[0]);
        setShowSettingsForm(false);
      } else {
        setShowSettingsForm(true);
      }
    } catch (e) {
      setError("Could not load station settings.");
      console.error(e);
    } finally {
        // We set loading to false in fetchWeatherData, which is triggered by settings change
    }
  }, []);

  const fetchWeatherData = useCallback(async () => {
    if (!settings || !settings.api_key || !settings.primary_location?.city) {
        setLoading(false);
        setError("API Key and Location must be configured in settings.");
        return;
    }
    
    setLoading(true);
    setError(null);
    const { api_key, primary_location, units } = settings;

    try {
      // Try multiple location query formats, same as in the test function
      const locationQueries = [
        `${primary_location.city},${primary_location.state},${primary_location.country}`,
        `${primary_location.city},${primary_location.country}`,
        primary_location.city
      ].filter(query => query && !query.includes(',,'));

      let weatherData = null;
      let forecastData = null;
      let success = false;

      for (const locationQuery of locationQueries) {
        if (!locationQuery || locationQuery.endsWith(',')) continue; // Skip malformed queries

        try {
          const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${API_BASE_URL}weather?q=${encodeURIComponent(locationQuery)}&appid=${api_key}&units=${units}`),
            fetch(`${API_BASE_URL}forecast?q=${encodeURIComponent(locationQuery)}&appid=${api_key}&units=${units}`)
          ]);

          if (weatherRes.ok) {
            weatherData = await weatherRes.json();
            if (forecastRes.ok) {
              forecastData = await forecastRes.json();
            }
            success = true;
            break; // Found a working query, stop trying others
          }
        } catch (e) {
          // Continue to next format if this one failed
        }
      }

      if (!success) {
        throw new Error(`Could not find weather data for "${primary_location.city}". Please check your location settings.`);
      }

      setWeather(weatherData);

      if (forecastData) {
        const dailyForecasts = forecastData.list.filter(item => 
          item.dt_txt.includes("12:00:00")
        );
        setForecast(dailyForecasts.slice(0, 5)); // Ensure only 5 days are shown
      }

    } catch (e) {
      setError(e.message);
      console.error("Weather fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      fetchWeatherData();
      // Added a default update interval to prevent errors if not defined
      const interval = setInterval(fetchWeatherData, (settings.update_interval || 300) * 1000); 
      return () => clearInterval(interval);
    }
  }, [settings, fetchWeatherData]);

  // Handle settings saved by updating state directly and closing the form
  // The prop 'onSave' now directly sets the settings state
  if (showSettingsForm) {
    return <WeatherSettingsForm onSave={setSettings} initialSettings={settings} />;
  }

  // Centralized loading, error, and no-data states for cleaner render logic
  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-400">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => setShowSettingsForm(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Check Settings
          </Button>
        </div>
      </div>
    );
  }

  if (!weather) {
    // This case should ideally not be reached if error handling is robust, 
    // but kept as a fallback for no data after loading.
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <p className="text-slate-400">No weather data available. Configure settings or refresh.</p>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.weather[0]?.icon);
  const tempUnit = settings.units === 'imperial' ? '°F' : '°C';

  return (
    <div className="p-6 space-y-6">
      {/* Current Weather */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              {weather.name}, {weather.sys.country}
            </CardTitle>
            <p className="text-slate-400 text-sm capitalize">{weather.weather[0]?.description}</p>
          </div>
          <Button onClick={() => setShowSettingsForm(true)} variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <WeatherIcon className="w-16 h-16 text-yellow-400" />
              <div>
                <div className="text-4xl font-bold text-white">
                  {Math.round(weather.main.temp)}{tempUnit}
                </div>
                <div className="text-slate-400">
                  Feels like {Math.round(weather.main.feels_like)}{tempUnit}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">{weather.main.humidity}% Humidity</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{Math.round(weather.wind?.speed || 0)} mph Wind</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">High: {Math.round(weather.main.temp_max)}{tempUnit}</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-400 opacity-70" />
                <span className="text-slate-300">Low: {Math.round(weather.main.temp_min)}{tempUnit}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {forecast.map((day, index) => {
                const DayIcon = getWeatherIcon(day.weather[0]?.icon);
                const date = new Date(day.dt * 1000);
                return (
                  <div key={index} className="text-center bg-slate-900/30 p-2 rounded-lg">
                    <div className="text-slate-400 text-sm mb-2">
                      {date.toLocaleDateString([], { weekday: 'short' })}
                    </div>
                    <DayIcon className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-white font-semibold">
                      {Math.round(day.main.temp)}{tempUnit}
                    </div>
                    <div className="text-slate-400 text-xs capitalize">
                      {day.weather[0]?.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button onClick={fetchWeatherData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Weather
        </Button>
      </div>
    </div>
  );
}
