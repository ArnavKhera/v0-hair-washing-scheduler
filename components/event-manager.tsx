"use client";

import { useState } from "react";
import type { CalendarEvent, WashDay } from "@/lib/hair-scheduler-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  CalendarDays,
  Star,
  Trash2,
  Droplets,
  CalendarPlus,
  X,
} from "lucide-react";

interface EventManagerProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onRemoveEvent: (id: string) => void;
  washes: WashDay[];
  onAddWash: (wash: WashDay) => void;
  onRemoveWash: (date: string) => void;
  onMarkWashToday: () => void;
}

export function EventManager({
  events,
  onAddEvent,
  onRemoveEvent,
  washes,
  onAddWash,
  onRemoveWash,
  onMarkWashToday,
}: EventManagerProps) {
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showWashDialog, setShowWashDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventImportant, setEventImportant] = useState(true);
  const [washDate, setWashDate] = useState("");
  const [washType, setWashType] = useState<"completed" | "scheduled">(
    "scheduled"
  );

  const handleAddEvent = () => {
    if (!eventTitle.trim() || !eventDate) return;
    onAddEvent({
      id: crypto.randomUUID(),
      title: eventTitle.trim(),
      date: eventDate,
      important: eventImportant,
    });
    setEventTitle("");
    setEventDate("");
    setEventImportant(true);
    setShowEventDialog(false);
  };

  const handleAddWash = () => {
    if (!washDate) return;
    onAddWash({
      date: washDate,
      type: washType,
      reason: washType === "completed" ? "Completed wash" : "Planned wash",
    });
    setWashDate("");
    setShowWashDialog(false);
  };

  const sortedEvents = [...events].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const sortedWashes = [...washes]
    .filter((w) => w.type !== "suggested")
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-primary flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Events
          </h2>
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add Event
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-sm text-foreground">
                    Event Name
                  </Label>
                  <Input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g., Job interview, Wedding..."
                    className="mt-1 bg-secondary border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Date</Label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1 bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={eventImportant}
                    onCheckedChange={setEventImportant}
                  />
                  <Label className="text-sm text-foreground">
                    Hair must look good for this event
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddEvent}
                  disabled={!eventTitle.trim() || !eventDate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {sortedEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No events added yet. Add events you want your hair to look good
            for.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border group"
              >
                {event.important && (
                  <Star className="w-3.5 h-3.5 text-event-day shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveEvent(event.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  aria-label={`Remove ${event.title}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-primary flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Wash Days
          </h2>
          <Dialog open={showWashDialog} onOpenChange={setShowWashDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                <CalendarPlus className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Schedule Wash Day
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-sm text-foreground">Date</Label>
                  <Input
                    type="date"
                    value={washDate}
                    onChange={(e) => setWashDate(e.target.value)}
                    className="mt-1 bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        washType === "scheduled" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setWashType("scheduled")}
                      className={
                        washType === "scheduled"
                          ? "bg-primary text-primary-foreground"
                          : "border-border text-foreground"
                      }
                    >
                      Planned
                    </Button>
                    <Button
                      variant={
                        washType === "completed" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setWashType("completed")}
                      className={
                        washType === "completed"
                          ? "bg-primary text-primary-foreground"
                          : "border-border text-foreground"
                      }
                    >
                      Already Done
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddWash}
                  disabled={!washDate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Wash Day
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Button
          onClick={onMarkWashToday}
          variant="outline"
          size="sm"
          className="w-full mb-3 border-wash-day/40 text-wash-day hover:bg-wash-day/10 hover:text-wash-day"
        >
          <Droplets className="w-4 h-4 mr-1" />
          I washed my hair today
        </Button>

        {sortedWashes.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No washes logged. Mark today or schedule future wash days.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {sortedWashes.map((wash) => (
              <div
                key={wash.date}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border group"
              >
                <Droplets className="w-3.5 h-3.5 text-wash-day shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {new Date(wash.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { weekday: "short", month: "short", day: "numeric" }
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant={
                        wash.type === "completed" ? "default" : "secondary"
                      }
                      className={`text-[10px] px-1.5 py-0 ${
                        wash.type === "completed"
                          ? "bg-wash-day/20 text-wash-day border-wash-day/40"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {wash.type}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveWash(wash.date)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  aria-label={`Remove wash on ${wash.date}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
