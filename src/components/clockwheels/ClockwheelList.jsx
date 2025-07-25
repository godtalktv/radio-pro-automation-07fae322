import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, Clock, Music, Zap, Annoyed, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  music: Music,
  station_id: Zap,
  commercial: Annoyed,
  promo: Mic,
};

export default function ClockwheelList({ clockwheels, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 bg-slate-800" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clockwheels.map(cw => (
        <Card key={cw.id} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              {cw.name}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(cw)} className="h-8 w-8 text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(cw.id)} className="h-8 w-8 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              {cw.items.sort((a,b) => a.position - b.position).map((item, index) => {
                const Icon = iconMap[item.type];
                return (
                  <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="flex-1 text-sm text-slate-300 capitalize">{item.type.replace('_', ' ')}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.duration_minutes ? `${item.duration_minutes} min` : `${item.exact_item_count}x`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}