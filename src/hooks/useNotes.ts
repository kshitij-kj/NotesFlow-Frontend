import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Note {
  id: string;
  title: string;
  content: string;
  color: "purple" | "blue" | "green" | "orange" | "pink" | "yellow";
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
}

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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
  
  return response.json();
};

const transformNote = (note: any): Note => ({
  ...note,
  createdAt: new Date(note.createdAt),
  updatedAt: new Date(note.updatedAt),
});

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load notes from backend on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest("/notes");
      const transformedNotes = data.map(transformNote);
      setNotes(transformedNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast({
        title: "Connection Error",
        description: "Failed to fetch notes from server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await apiRequest("/notes", {
        method: "POST",
        body: JSON.stringify(noteData),
      });
      const serverNote = transformNote(response);
      
      setNotes((prev) => [serverNote, ...prev]);
      
      toast({
        title: "Note created",
        description: "Your note has been saved successfully.",
      });
      return serverNote;
    } catch (error) {
      console.error("Failed to create note:", error);
      toast({
        title: "Error",
        description: "Failed to save note to server.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => {
    try {
      await apiRequest(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      
      const optimisticUpdate = { ...updates, updatedAt: new Date() };
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, ...optimisticUpdate } : note
        )
      );
      
      toast({
        title: "Note updated",
        description: "Changes saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update note:", error);
      toast({
        title: "Error",
        description: "Failed to update note on server.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await apiRequest(`/notes/${id}`, {
        method: "DELETE",
      });
      
      setNotes((prev) => prev.filter((note) => note.id !== id));
      
      toast({
        title: "Note deleted",
        description: "Note has been removed successfully.",
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note from server.",
        variant: "destructive",
      });
      throw error;
    }
  };

const togglePin = async (id: string) => {
  const currentNote = notes.find(note => note.id === id);
  if (!currentNote) return;

  try {
    const newPinStatus = !currentNote.isPinned;

    await apiRequest(`/notes/${id}/toggle-pin`, {
      method: "PATCH",
      body: JSON.stringify({ isPinned: newPinStatus }),
    });   
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, isPinned: newPinStatus, updatedAt: new Date() } : note
        )
      );
      
      toast({
        title: newPinStatus ? "Note pinned" : "Note unpinned",
        description: "Changes saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update pin status:", error);
      toast({
        title: "Error",
        description: "Failed to update pin status on server.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort notes: pinned first, then by updatedAt
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
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
    refetch: fetchNotes,
  };
};
