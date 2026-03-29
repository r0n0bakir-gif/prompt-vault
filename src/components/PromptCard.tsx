import * as React from "react";
import { motion } from "framer-motion";
import { Copy, Edit2, Star, Trash2, Check } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useToggleFavoriteWithCache } from "@/hooks/use-prompts";
import { useToast } from "@/hooks/use-toast";
import type { Prompt } from "@/lib/local-api";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const [copied, setCopied] = React.useState(false);
  const toggleFavMutation = useToggleFavoriteWithCache();
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      toast({ title: "Copied to clipboard", description: "Ready to paste!" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleToggleFavorite = () => {
    toggleFavMutation.mutate({ id: prompt.id });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col bg-card border border-border rounded-xl p-5 shadow-lg transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-lg font-display font-semibold text-foreground truncate">
              {prompt.title}
            </h3>
            {prompt.isFavorite && (
              <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
            )}
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-background/50">
            {prompt.category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 rounded-full transition-colors ${prompt.isFavorite ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          onClick={handleToggleFavorite}
          title={prompt.isFavorite ? "Unpin prompt" : "Pin prompt"}
        >
          <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-primary' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 bg-background/50 rounded-md p-3 mb-4 border border-border/50 overflow-hidden relative">
        <p className="text-sm font-mono text-muted-foreground line-clamp-4 whitespace-pre-wrap">
          {prompt.text}
        </p>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      </div>

      {prompt.note && (
        <p className="text-xs text-muted-foreground italic mb-4 line-clamp-1">
          Note: {prompt.note}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onEdit(prompt)}>
            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(prompt)}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
          </Button>
        </div>
        
        <Button
          onClick={handleCopy}
          size="sm"
          className={`h-8 transition-all ${copied ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30' : ''}`}
          variant={copied ? "outline" : "default"}
        >
          {copied ? (
            <><Check className="w-4 h-4 mr-1.5" /> Copied</>
          ) : (
            <><Copy className="w-4 h-4 mr-1.5" /> Copy</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
