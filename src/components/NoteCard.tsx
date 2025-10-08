import { useState } from "react";
import { Edit3, Trash2, Pin, PinOff } from "lucide-react";
import { Note } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const colorClasses = {
  purple: "border-note-purple/30 bg-note-purple/5",
  blue: "border-note-blue/30 bg-note-blue/5",
  green: "border-note-green/30 bg-note-green/5",
  orange: "border-note-orange/30 bg-note-orange/5",
  pink: "border-note-pink/30 bg-note-pink/5",
  yellow: "border-note-yellow/30 bg-note-yellow/5",
};

const colorDots = {
  purple: "bg-note-purple",
  blue: "bg-note-blue",
  green: "bg-note-green",
  orange: "bg-note-orange",
  pink: "bg-note-pink",
  yellow: "bg-note-yellow",
};

export const NoteCard = ({ note, onUpdate, onDelete, onTogglePin }: NoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editTitle.trim() || editContent.trim()) {
      onUpdate(note.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Card 
      className={`glass-card p-4 group hover:shadow-glow transition-all duration-300 animate-scale-in ${colorClasses[note.color]} relative overflow-hidden`}
    >
      {/* Color indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colorDots[note.color]}`} />
      
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin className="w-4 h-4 text-primary" />
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
            <Input
              id="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Note title..."
              className="bg-card border-card-border text-foreground placeholder:text-muted-foreground text-sm font-medium"
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Start writing..."
              className="bg-card border-card-border text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none"
              onKeyDown={handleKeyDown}
            />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="text-xs bg-gradient-primary"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-card-foreground text-sm line-clamp-2 flex-1">
              {note.title || "Untitled"}
            </h3>
          </div>
          
          {note.content && (
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-6 whitespace-pre-wrap">
              {note.content}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {note.updatedAt.toLocaleDateString()} {note.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Action buttons - appear on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(note.id)}
              className="h-7 w-7 p-0 hover:bg-background/50"
            >
              {note.isPinned ? (
                <PinOff className="w-3 h-3" />
              ) : (
                <Pin className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 p-0 hover:bg-background/50"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
              className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};