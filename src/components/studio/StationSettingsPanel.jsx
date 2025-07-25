import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCustomization } from '../settings/CustomizationProvider';
import { X, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function StationSettingsPanel({ onClose }) {
    const { settings, removeCustomCategory } = useCustomization();
    const { toast } = useToast();

    const handleDelete = async (categoryId, categoryName) => {
        if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? This cannot be undone.`)) {
            try {
                await removeCustomCategory(categoryId);
                toast({
                    title: "Category Deleted",
                    description: `"${categoryName}" has been removed.`,
                    className: "bg-green-900 border-green-600 text-white"
                });
            } catch (error) {
                // The provider already shows a toast on error, so no need to double-toast.
                console.error("Deletion failed from panel:", error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-slate-900 border-slate-700 shadow-2xl shadow-black/50">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
                    <CardTitle className="text-white">Manage Categories</CardTitle>
                    <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Remove custom categories from your station. Note: This will not delete the audio files, only un-assign them from this category.
                        </p>
                        <div className="space-y-2 border-t border-slate-700 pt-4">
                            {settings?.custom_categories && settings.custom_categories.length > 0 ? (
                                settings.custom_categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border-2 border-white/10" style={{ backgroundColor: cat.color || '#6b7280' }} />
                                            <span className="text-white font-medium">{cat.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-400 hover:bg-red-900/50"
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                            title={`Delete category: ${cat.name}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center py-8">No custom categories found.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}