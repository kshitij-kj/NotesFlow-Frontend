import { useNotes } from "@/hooks/useNotes";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { SearchBar } from "@/components/SearchBar";
import { NotesGrid } from "@/components/NotesGrid";
import { Sparkles, BookOpen } from "lucide-react";

const Index = () => {
  const {
    notes,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotes();

  const pinnedNotes = notes.filter(note => note.isPinned);
  const unpinnedNotes = notes.filter(note => !note.isPinned);

  return (
    <div className="min-h-screen bg-gradient-aurora">
      {/* Header */}
      <header className="border-b border-card-border/50 backdrop-blur-xl bg-background/30 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">NotesFlow</h1>
                <p className="text-sm text-muted-foreground">Premium note taking experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <SearchBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                resultsCount={notes.length}
              />
              <CreateNoteDialog onCreateNote={createNote} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        {notes.length > 0 && (
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
            </div>
            {pinnedNotes.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {pinnedNotes.length} pinned
              </div>
            )}
          </div>
        )}

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Pinned Notes
            </h2>
            <NotesGrid
              notes={pinnedNotes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onTogglePin={togglePin}
            />
          </section>
        )}

        {/* All Notes or Unpinned Notes */}
        {unpinnedNotes.length > 0 && pinnedNotes.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              Other Notes
            </h2>
            <NotesGrid
              notes={unpinnedNotes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onTogglePin={togglePin}
            />
          </section>
        )}

        {/* All Notes (when no pinned notes) */}
        {pinnedNotes.length === 0 && (
          <NotesGrid
            notes={notes}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onTogglePin={togglePin}
          />
        )}
      </main>
    </div>
  );
};

export default Index;