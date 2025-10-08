import { Note } from "@/hooks/useNotes";
import { NoteCard } from "./NoteCard";

interface NotesGridProps {
  notes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesGrid = ({ notes, onUpdate, onDelete, onTogglePin }: NotesGridProps) => {
  if (notes.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
        <div className="w-24 h-24 rounded-full bg-gradient-primary/10 flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-primary/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-primary/40" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          No notes yet
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Create your first note to get started with NotesFlow
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
      {notes.map((note, index) => (
        <div
          key={note.id}
          className="animate-fade-in-up"
          style={{ 
            animationDelay: `${index * 0.1}s`,
            animationFillMode: 'both'
          }}
        >
          <NoteCard
            note={note}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
          />
        </div>
      ))}
    </div>
  );
};