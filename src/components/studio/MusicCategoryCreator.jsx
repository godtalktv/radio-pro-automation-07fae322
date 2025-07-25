import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategoryDefinition } from "@/api/entities";
import { User } from '@/api/entities';
import { Music, Plus, Trash2, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

const DEFAULT_MUSIC_CATEGORIES = [
  { name: 'General Gospel Music', type: 'music', color: '#3b82f6' },
  { name: 'Gospel Hour', type: 'music', color: '#8b5cf6' },
  { name: 'Gospel Music', type: 'music', color: '#06b6d4' },
  { name: 'New Music Hour', type: 'music', color: '#10b981' },
  { name: 'Spinn Hour', type: 'music', color: '#f59e0b' },
  { name: 'Top 40 Hits', type: 'music', color: '#ef4444' },
  { name: 'Classic Rock', type: 'music', color: '#f97316' },
  { name: 'Country Music', type: 'music', color: '#a16207' },
  { name: 'R&B Soul', type: 'music', color: '#dc2626' },
  { name: 'Hip Hop', type: 'music', color: '#7c3aed' },
  { name: 'Jazz Standards', type: 'music', color: '#0891b2' },
  { name: 'Blues', type: 'music', color: '#4338ca' },
  { name: 'Folk Acoustic', type: 'music', color: '#059669' },
  { name: 'Electronic Dance', type: 'music', color: '#e11d48' },
  { name: 'Alternative Rock', type: 'music', color: '#ea580c' },
  { name: 'Sweeper', type: 'imaging', color: '#eab308' },
  { name: 'Top Of The hour ID', type: 'imaging', color: '#8b5cf6' },
  { name: 'Station Promos', type: 'imaging', color: '#22c55e' },
  { name: 'Commercial Spots', type: 'commercial', color: '#f59e0b' },
];

export default function MusicCategoryCreator({ onComplete }) {
  const [categories, setCategories] = useState(DEFAULT_MUSIC_CATEGORIES);
  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState({ message: '', type: 'idle' });
  const [createdCount, setCreatedCount] = useState(0);
  const [customCategory, setCustomCategory] = useState({ name: '', type: 'music', color: '#3b82f6' });
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      if (!currentUser?.organization_id) {
        setCreateStatus({ 
          message: 'Error: User organization not found. Please contact support.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setCreateStatus({ 
        message: 'Failed to load user information. Please try refreshing the page.', 
        type: 'error' 
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleAddCustomCategory = () => {
    if (!customCategory.name.trim()) return;
    
    setCategories(prev => [...prev, {
      ...customCategory,
      name: customCategory.name.trim()
    }]);
    
    setCustomCategory({ name: '', type: 'music', color: '#3b82f6' });
  };

  const handleRemoveCategory = (index) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateCategories = async () => {
    if (!user?.organization_id) {
      setCreateStatus({ 
        message: 'Error: Organization ID is required but not found.', 
        type: 'error' 
      });
      return;
    }

    setIsCreating(true);
    setCreateStatus({ message: 'Creating music categories...', type: 'loading' });
    let created = 0;

    try {
      for (const category of categories) {
        setCreateStatus({ 
          message: `Creating category: ${category.name}...`, 
          type: 'loading' 
        });

        const categoryData = {
          organization_id: user.organization_id, // Add the required organization_id
          name: category.name,
          category_type: category.type,
          picker_mode: 'random',
          reshuffle_daily: true,
          background_color: category.color,
          text_color: '#FFFFFF',
          day_segment_separation: false,
          play_as_voicetrack: false,
          include_in_shd: true,
          dont_send_metadata: false,
          artist_separation_override_hrs: category.type === 'music' ? 2 : 0,
          title_separation_override_hrs: category.type === 'music' ? 4 : 0,
          ipass_priority: category.type === 'music' ? 5 : 1
        };

        try {
          await CategoryDefinition.create(categoryData);
          created++;
          setCreatedCount(created);
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay to avoid rate limits
        } catch (error) {
          console.error(`Failed to create category ${category.name}:`, error);
          // Continue with next category even if one fails
        }
      }

      setCreateStatus({ 
        message: `Successfully created ${created} music categories!`, 
        type: 'success' 
      });

    } catch (error) {
      console.error('Category creation failed:', error);
      setCreateStatus({ 
        message: `Category creation failed: ${error.message}`, 
        type: 'error' 
      });
    }

    setIsCreating(false);
  };

  if (isLoadingUser) {
    return (
      <Card className="w-full max-w-4xl bg-slate-900 border-slate-700">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mr-3" />
          <span className="text-slate-300">Loading user information...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-blue-400" />
          Create Professional Music Categories
        </CardTitle>
        <p className="text-sm text-slate-400">
          Set up your station's music categories for professional programming and rotation scheduling.
        </p>
        {user?.organization_id && (
          <p className="text-xs text-green-400">
            ✓ Organization: {user.organization_id}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Custom Category */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Add Custom Category</h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Category name"
                value={customCategory.name}
                onChange={(e) => setCustomCategory({...customCategory, name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <select
              value={customCategory.type}
              onChange={(e) => setCustomCategory({...customCategory, type: e.target.value})}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            >
              <option value="music">Music</option>
              <option value="imaging">Imaging</option>
              <option value="commercial">Commercial</option>
            </select>
            <input
              type="color"
              value={customCategory.color}
              onChange={(e) => setCustomCategory({...customCategory, color: e.target.value})}
              className="w-12 h-10 rounded border border-slate-600"
            />
            <Button onClick={handleAddCustomCategory} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category List */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Categories to Create ({categories.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded"
                style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}50` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-white text-sm">{category.name}</span>
                  <span className="text-xs text-slate-400 capitalize">({category.type})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCategory(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {createStatus.type !== 'idle' && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            createStatus.type === 'success' ? 'bg-green-500/10 text-green-400' :
            createStatus.type === 'error' ? 'bg-red-500/10 text-red-400' :
            'bg-slate-800/50 text-slate-300'
          }`}>
            {createStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {createStatus.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {createStatus.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            <div>
              <p>{createStatus.message}</p>
              {isCreating && (
                <div className="text-sm text-slate-400 mt-1">
                  Progress: {createdCount}/{categories.length}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleCreateCategories}
            disabled={isCreating || categories.length === 0 || !user?.organization_id}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Music className="w-4 h-4 mr-2" />
            )}
            {isCreating ? 'Creating Categories...' : `Create ${categories.length} Categories`}
          </Button>
          
          {createStatus.type === 'success' && (
            <Button
              onClick={onComplete}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}