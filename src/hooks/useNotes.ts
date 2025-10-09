import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Note {
  id: string;
  title: string;
  content: string;
  color: "purple" | "blue" | "green" | "orange" | "pink" | "yellow";
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean; // made non-optional to avoid undefined issues
}

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// API helper functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Only parse JSON if there is content
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");

  if (
    response.status === 204 ||
    !contentType ||
    (contentLength !== null && parseInt(contentLength) === 0)
  ) {
    return null; // No Content
  }

  return response.json();
};

// ✅ FIXED: Always ensure `isPinned` is a boolean
const transformNote = (note: any): Note => ({
  ...note,
  createdAt: new Date(note.createdAt),
  updatedAt: new Date(note.updatedAt),
  isPinned: note.isPinned === true, // normalize undefined → false
});

const STORAGE_KEY = "notesflow-notes";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load notes from backend or localStorage on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        const data = await apiRequest("/notes");
        if (Array.isArray(data)) {
          const transformed = data.map(transformNote);
          setNotes(transformed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(transformed));
        }
      } else {
        const storedNotes = localStorage.getItem(STORAGE_KEY);
        if (storedNotes) {
          const parsed = JSON.parse(storedNotes).map(transformNote);
          setNotes(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      const storedNotes = localStorage.getItem(STORAGE_KEY);
      if (storedNotes) {
        const parsed = JSON.parse(storedNotes).map(transformNote);
        setNotes(parsed);
      }
      toast({
        title: "Connection Error",
        description: "Failed to sync with server. Using local data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Always save current notes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const createNote = async (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    const tempNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: noteData.isPinned ?? false,
    };

    setNotes((prev) => [tempNote, ...prev]);

    try {
      if (isOnline) {
        const response = await apiRequest("/notes", {
          method: "POST",
          body: JSON.stringify(noteData),
        });

        const serverNote = response ? transformNote(response) : tempNote;

        setNotes((prev) =>
          prev.map((note) => (note.id === tempNote.id ? serverNote : note))
        );

        toast({
          title: "Note created",
          description: "Your note has been saved successfully.",
        });
        return serverNote;
      } else {
        toast({
          title: "Note saved locally",
          description: "Will sync when connection is restored.",
          variant: "destructive",
        });
        return tempNote;
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      toast({
        title: "Error",
        description: "Failed to save note. Saved locally instead.",
        variant: "destructive",
      });
      return tempNote;
    }
  };

  const updateNote = async (
    id: string,
    updates: Partial<Omit<Note, "id" | "createdAt">>
  ) => {
    const optimisticUpdate = { ...updates, updatedAt: new Date() };

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...optimisticUpdate } : note
      )
    );

    try {
      if (isOnline) {
        await apiRequest(`/notes/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });

        toast({
          title: "Note updated",
          description: "Changes saved successfully.",
        });
      } else {
        toast({
          title: "Note updated locally",
          description: "Will sync when connection is restored.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update note:", error);
      toast({
        title: "Error",
        description: "Failed to sync changes. Saved locally.",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (id: string) => {
    const noteToDelete = notes.find((note) => note.id === id);
    setNotes((prev) => prev.filter((note) => note.id !== id));

    try {
      if (isOnline) {
        await apiRequest(`/notes/${id}`, { method: "DELETE" });
        toast({
          title: "Note deleted",
          description: "Note has been removed successfully.",
        });
      } else {
        toast({
          title: "Note deleted locally",
          description: "Will sync when connection is restored.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to delete note:", error);
      if (noteToDelete) setNotes((prev) => [noteToDelete, ...prev]);
      toast({
        title: "Error",
        description: `Failed to delete note from server. ${error.message || error}`,
        variant: "destructive",
      });
    }
  };

  const togglePin = async (id: string) => {
    const currentNote = notes.find((note) => note.id === id);
    if (!currentNote) return;

    const optimisticUpdate = {
      isPinned: !currentNote.isPinned,
      updatedAt: new Date(),
    };

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...optimisticUpdate } : note
      )
    );

    try {
      if (isOnline) {
        await apiRequest(`/notes/${id}/toggle-pin`, {
          method: "PATCH",
          body: JSON.stringify({ isPinned: optimisticUpdate.isPinned }),
        });
      }
    } catch (error) {
      console.error("Failed to update pin status:", error);
      // rollback
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? {
                ...note,
                isPinned: currentNote.isPinned,
                updatedAt: currentNote.updatedAt,
              }
            : note
        )
      );
      toast({
        title: "Error",
        description: "Failed to update pin status.",
        variant: "destructive",
      });
    }
  };

  // Filter + sort
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Safe sort with explicit boolean coercion
  const sortedNotes = filteredNotes.sort((a, b) => {
    const aPinned = !!a.isPinned;
    const bPinned = !!b.isPinned;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return {
    notes: sortedNotes,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    isLoading,
    isOnline,
    refetch: fetchNotes,
  };
};
