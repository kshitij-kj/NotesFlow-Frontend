import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
}

export const SearchBar = ({ searchQuery, onSearchChange, resultsCount }: SearchBarProps) => {
  return (
    <div className="relative max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-card border-card-border backdrop-blur-sm focus:bg-card/90 text-foreground placeholder:text-muted-foreground transition-all duration-200"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-background/50"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border border-card-border rounded-lg px-3 py-2">
          {resultsCount === 0 ? (
            "No notes found"
          ) : resultsCount === 1 ? (
            "1 note found"
          ) : (
            `${resultsCount} notes found`
          )}
        </div>
      )}
    </div>
  );
};