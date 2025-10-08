import { useState } from "react";
import { Plus } from "lucide-react";
import { Note } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateNoteDialogProps {
  onCreateNote: (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
}

const colorOptions: Array<{ name: string; value: Note["color"]; class: string }> = [
  { name: "Purple", value: "purple", class: "bg-note-purple" },
  { name: "Blue", value: "blue", class: "bg-note-blue" },
  { name: "Green", value: "green", class: "bg-note-green" },
  { name: "Orange", value: "orange", class: "bg-note-orange" },
  { name: "Pink", value: "pink", class: "bg-note-pink" },
  { name: "Yellow", value: "yellow", class: "bg-note-yellow" },
];

export const CreateNoteDialog = ({ onCreateNote }: CreateNoteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState<Note["color"]>("purple");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() && !content.trim()) {
      return;
    }

    onCreateNote({
      title: title.trim(),
      content: content.trim(),
      color: selectedColor,
    });

    // Reset form
    setTitle("");
    setContent("");
    setSelectedColor("purple");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit(e as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-card-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Create New Note</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-card-foreground">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="bg-card border-card-border text-foreground placeholder:text-muted-foreground"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-card-foreground">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="bg-card border-card-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">
              Color
            </Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full ${color.class} transition-all duration-200 ${
                    selectedColor === color.value
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-105"
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary"
              disabled={!title.trim() && !content.trim()}
            >
              Create Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};