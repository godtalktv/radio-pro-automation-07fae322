import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomization } from '../settings/CustomizationProvider';
import { X, Save, Palette } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f59e0b', // Amber
];

export default function CategoryCreator({ onClose, onCategoryCreated }) {
    const { settings, updateSettings } = useCustomization();
    const { toast } = useToast();
    const [categoryName, setCategoryName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!categoryName.trim()) {
            toast({
                variant: "destructive",
                title: "Invalid Name",
                description: "Please enter a category name."
            });
            return;
        }

        // Check for duplicate names
        const existingNames = settings?.custom_categories?.map(cat => cat.name.toLowerCase()) || [];
        if (existingNames.includes(categoryName.trim().toLowerCase())) {
            toast({
                variant: "destructive",
                title: "Duplicate Name",
                description: "A category with this name already exists."
            });
            return;
        }

        setIsCreating(true);
        try {
            const newCategory = {
                id: crypto.randomUUID(),
                name: categoryName.trim(),
                icon: 'Music',
                color: selectedColor
            };

            const currentCategories = settings?.custom_categories || [];
            const updatedCategories = [...currentCategories, newCategory];

            await updateSettings({
                ...settings,
                custom_categories: updatedCategories
            });

            toast({
                title: "Category Created",
                description: `"${categoryName}" has been added successfully.`,
                className: "bg-green-900 border-green-600 text-white"
            });

            // Call the callback to refresh the parent component
            if (onCategoryCreated) {
                onCategoryCreated();
            }

        } catch (error) {
            console.error('Failed to create category:', error);
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: "Could not create the category. Please try again."
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-blue-400" />
                        Create New Category
                    </CardTitle>
                    <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="category-name" className="text-slate-300">Category Name</Label>
                        <Input
                            id="category-name"
                            placeholder="e.g., Rock Hits, Morning Show, Station IDs"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 mt-1"
                            maxLength={25}
                        />
                    </div>

                    <div>
                        <Label className="text-slate-300">Category Color</Label>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        selectedColor === color 
                                            ? 'border-white scale-110' 
                                            : 'border-slate-600 hover:border-slate-400'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={`Select ${color}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreate}
                            disabled={isCreating || !categoryName.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isCreating ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create Category
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}