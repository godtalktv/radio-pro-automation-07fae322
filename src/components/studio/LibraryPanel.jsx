
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudio } from '../audio/AudioPlayer';
import { useCustomization } from '../settings/CustomizationProvider';
import { Track } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import { bulkUpdateTracks } from '@/api/functions';
import { 
  Music, 
  Search, 
  Filter, 
  Play, 
  Plus, 
  Edit,
  Tag,
  FolderOpen
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to split an array into smaller chunks
const chunkArray = (array, size) => {
    const chunked_arr = [];
    for (let i = 0; i < array.length; i += size) {
        chunked_arr.push(array.slice(i, i + size));
    }
    return chunked_arr;
};

// Helper function to add a delay
const delay = ms => new Promise(res => setTimeout(res, ms));

export default function LibraryPanel({ onTrackSelect }) {
  const { allTracks, reloadTracks, addTrackToQueue, handlePlayNow } = useAudio();
  const { settings } = useCustomization();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [trackTypeFilter, setTrackTypeFilter] = useState('all');
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [showBulkCategoryAssign, setShowBulkCategoryAssign] = useState(false);

  // Get available categories from settings
  const availableCategories = settings?.custom_categories || [];

  // Filter tracks based on search and filters
  const filteredTracks = allTracks.filter(track => {
    const matchesSearch = !searchTerm || 
      track.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.album?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || 
      track.category === categoryFilter ||
      (categoryFilter === 'uncategorized' && !track.category);

    const matchesType = trackTypeFilter === 'all' || track.track_type === trackTypeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Handle individual track category assignment
  const handleCategoryChange = async (trackId, newCategory) => {
    try {
      await Track.update(trackId, { category: newCategory });
      await reloadTracks();
    } catch (error) {
      console.error('Failed to update track category:', error);
    }
  };

  // Handle bulk category assignment using client-side orchestration
  const handleBulkCategoryAssign = async (category) => {
    if (selectedTracks.length === 0) {
      toast({
        variant: "destructive",
        title: "No Tracks Selected",
        description: "Please select tracks before assigning a category.",
      });
      return;
    }

    toast({
      title: "Bulk Update Started",
      description: `Updating ${selectedTracks.length} tracks to category "${category || 'None'}".`,
    });

    const BATCH_SIZE = 10; // Process 10 tracks per batch
    const trackBatches = chunkArray(selectedTracks, BATCH_SIZE);
    
    let totalSuccess = 0;
    let totalFailed = 0;

    for (let i = 0; i < trackBatches.length; i++) {
      const batch = trackBatches[i];
      
      toast({
        title: "Processing...",
        description: `Updating batch ${i + 1} of ${trackBatches.length} (${batch.length} tracks).`,
      });

      try {
        const { data: results } = await bulkUpdateTracks({
          trackIds: batch,
          updateData: { category },
        });

        if (results.success) {
          totalSuccess += results.success.length;
        }
        if (results.failed && results.failed.length > 0) {
          totalFailed += results.failed.length;
          console.error(`Failed tracks in batch ${i + 1}:`, results.failed);
        }
      } catch (error) {
        console.error(`Batch ${i + 1} failed entirely:`, error);
        totalFailed += batch.length; // Assume all tracks in batch failed if the batch call itself failed
        toast({
          variant: "destructive",
          title: `Error Processing Batch ${i + 1}`,
          description: "This batch could not be updated. Moving to the next.",
        });
      }
      
      // Delay between sending batches to avoid overwhelming the server
      if (i < trackBatches.length - 1) {
        await delay(1500); // 1.5 second delay
      }
    }

    // Final result toast
    if (totalFailed > 0) {
      toast({
        variant: "destructive",
        title: "Bulk Update Complete with Errors",
        description: `${totalSuccess} tracks updated successfully. ${totalFailed} tracks failed.`,
      });
    } else {
      toast({
        title: "Bulk Update Successful",
        description: `All ${totalSuccess} tracks have been updated.`,
      });
    }

    await reloadTracks();
    setSelectedTracks([]);
    setShowBulkCategoryAssign(false);
  };

  // Toggle track selection
  const toggleTrackSelection = (trackId) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Select all filtered tracks
  const selectAllTracks = () => {
    const allFilteredIds = filteredTracks.map(track => track.id);
    setSelectedTracks(allFilteredIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTracks([]);
  };

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Music Library</span>
            <Badge variant="secondary" className="text-xs">
              {filteredTracks.length} tracks
            </Badge>
          </div>
          {selectedTracks.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-xs">
                {selectedTracks.length} selected
              </Badge>
              <Button
                size="sm"
                onClick={() => setShowBulkCategoryAssign(true)}
                className="h-7 text-xs bg-green-600 hover:bg-green-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                Assign
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
                className="h-7 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Compact Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-sm bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32 h-8 text-sm bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {availableCategories.map(cat => (
                <SelectItem key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={trackTypeFilter} onValueChange={setTrackTypeFilter}>
            <SelectTrigger className="w-24 h-8 text-sm bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="station_id">ID</SelectItem>
              <SelectItem value="commercial">Ad</SelectItem>
              <SelectItem value="voice_track">Voice</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="outline"
            onClick={selectAllTracks}
            className="h-8 text-xs px-2"
          >
            All
          </Button>
        </div>
      </div>

      {/* Full-Height Track List */}
      <div className="flex-1 overflow-hidden">
        {filteredTracks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">No tracks found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {/* Table Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-3 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-slate-300">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTracks.length === filteredTracks.length && filteredTracks.length > 0}
                  onChange={selectedTracks.length === filteredTracks.length ? clearSelection : selectAllTracks}
                  className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div className="col-span-4">TRACK / ARTIST</div>
              <div className="col-span-2">ALBUM</div>
              <div className="col-span-2">CATEGORY</div>
              <div className="col-span-1">TYPE</div>
              <div className="col-span-1">TIME</div>
              <div className="col-span-1">ACTIONS</div>
            </div>

            {/* Track Rows */}
            <div className="px-1">
              {filteredTracks.map(track => (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 gap-2 px-2 py-2 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors text-sm ${
                    selectedTracks.includes(track.id) ? 'bg-blue-600/10' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(track.id)}
                      onChange={() => toggleTrackSelection(track.id)}
                      className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Track/Artist */}
                  <div className="col-span-4 min-w-0">
                    <div 
                      className="text-white font-medium truncate cursor-pointer hover:text-blue-400"
                      onClick={() => onTrackSelect && onTrackSelect(track)}
                      title={track.title}
                    >
                      {track.title}
                    </div>
                    <div className="text-slate-400 text-xs truncate" title={track.artist}>
                      {track.artist}
                    </div>
                  </div>

                  {/* Album */}
                  <div className="col-span-2 min-w-0">
                    <div className="text-slate-400 text-xs truncate" title={track.album}>
                      {track.album || '-'}
                    </div>
                  </div>

                  {/* Category Assignment */}
                  <div className="col-span-2">
                    <Select 
                      value={track.category || 'uncategorized'}
                      onValueChange={(value) => handleCategoryChange(track.id, value === 'uncategorized' ? null : value)}
                    >
                      <SelectTrigger className="h-6 text-xs bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uncategorized">
                          <span className="text-slate-400">None</span>
                        </SelectItem>
                        {availableCategories.map(cat => (
                          <SelectItem key={cat.id || cat.name} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div className="col-span-1">
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] py-0 px-1 h-5"
                    >
                      {track.track_type === 'station_id' ? 'ID' : 
                       track.track_type === 'commercial' ? 'Ad' :
                       track.track_type === 'voice_track' ? 'Voice' :
                       track.track_type === 'gap_filler' ? 'Fill' :
                       'Music'}
                    </Badge>
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 text-slate-400 font-mono text-xs">
                    {formatTime(track.duration)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => addTrackToQueue(track)}
                      className="h-6 w-6 p-0 bg-blue-600 hover:bg-blue-700"
                      title="Add to Queue"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePlayNow(track)}
                      className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                      title="Play Now"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Category Assignment Modal */}
      {showBulkCategoryAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-slate-800 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg">
                Assign Category to {selectedTracks.length} Tracks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map(cat => (
                  <Button
                    key={cat.id || cat.name}
                    onClick={() => handleBulkCategoryAssign(cat.name)}
                    className="h-12 text-left justify-start text-white"
                    style={{ backgroundColor: cat.color || '#374151' }}
                  >
                    {cat.name}
                  </Button>
                ))}
                <Button
                  onClick={() => handleBulkCategoryAssign(null)}
                  variant="outline"
                  className="h-12 text-left justify-start col-span-2"
                >
                  Remove Category
                </Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkCategoryAssign(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
