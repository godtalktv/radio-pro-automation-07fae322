
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, Edit, Trash2 } from "lucide-react";

const DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 
  'friday', 'saturday', 'sunday'
];

const HOURS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

export default function ScheduleGrid({ shows, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map(day => (
              <div key={day} className="space-y-2">
                <Skeleton className="h-6 w-24 bg-slate-800" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 bg-slate-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getShowsForDay = (day) => {
    return shows.filter(show => show.day_of_week === day)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {DAYS.map(day => {
            const dayShows = getShowsForDay(day);
            
            return (
              <div key={day} className="space-y-3">
                <h3 className="text-lg font-semibold text-white capitalize">
                  {day}
                </h3>
                
                {dayShows.length > 0 ? (
                  <div className="grid gap-3">
                    {dayShows.map(show => (
                      <div 
                        key={show.id}
                        className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:bg-slate-800/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-white">{show.name}</h4>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                <Clock className="w-3 h-3 mr-1" />
                                {show.start_time} - {show.end_time}
                              </Badge>
                              {show.recurring && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              {show.host && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {show.host}
                                </div>
                              )}
                              {show.genre_preferences && show.genre_preferences.length > 0 && (
                                <div className="flex items-center gap-1">
                                  Genres: {show.genre_preferences.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(show)}
                              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                              title="Edit Show"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(show.id)}
                              className="text-red-500/80 hover:text-red-400 hover:bg-red-500/10"
                              title="Delete Show"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-700/50 rounded-xl">
                    <p className="text-slate-500">No shows scheduled for {day}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
