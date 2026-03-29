import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Sparkles, Filter, Archive, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PromptCard } from "@/components/PromptCard";
import { PromptFormModal } from "@/components/PromptFormModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { useListPrompts, useListCategories } from "@/hooks/use-prompts";
import type { Prompt } from "@/lib/local-api";

export default function Home() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [promptToEdit, setPromptToEdit] = React.useState<Prompt | null>(null);
  const [promptToDelete, setPromptToDelete] = React.useState<Prompt | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data
  const { data: prompts = [], isLoading } = useListPrompts({
    search: debouncedSearch || undefined,
    category: selectedCategory || undefined,
  });

  const { data: categories = [] } = useListCategories();

  const handleOpenCreate = () => {
    setPromptToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prompt: Prompt) => {
    setPromptToEdit(prompt);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (prompt: Prompt) => {
    setPromptToDelete(prompt);
    setIsDeleteOpen(true);
  };

  const favorites = prompts.filter(p => p.isFavorite);
  const others = prompts.filter(p => !p.isFavorite);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Header */}
      <header className="relative w-full overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Dark abstract background"
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Your Personal Archive
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4 tracking-tight text-glow">
                Prompt Vault
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed font-light">
                Curate, organize, and access your most powerful prompts instantly. A sanctuary for your creative catalysts.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button size="lg" onClick={handleOpenCreate} className="w-full md:w-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Plus className="w-5 h-5 mr-2" />
                New Prompt
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Filters Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10 items-start lg:items-center justify-between sticky top-4 z-30 glass-panel p-4 rounded-2xl">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search prompts by keyword..." 
              className="pl-10 h-11 bg-background/50 border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground mr-1 flex-shrink-0" />
            <Badge 
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-1.5 text-sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge 
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-1.5 text-sm hover:border-primary/50 transition-all"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[280px] bg-card/50 animate-pulse rounded-xl border border-border/50" />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20 px-4 text-center"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/empty-state.png`}
              alt="Empty Vault"
              className="w-48 h-48 mb-8 opacity-80"
            />
            <h3 className="text-2xl font-display font-semibold mb-2">No prompts found</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              {search || selectedCategory 
                ? "Try adjusting your search or filters to find what you're looking for." 
                : "Your vault is empty. Start adding your favorite prompts to build your collection."}
            </p>
            {!(search || selectedCategory) && (
              <Button onClick={handleOpenCreate} variant="outline" size="lg">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Prompt
              </Button>
            )}
          </motion.div>
        ) : (
          /* Results Grid */
          <div className="space-y-12 pb-20">
            {favorites.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <h2 className="text-xl font-display font-semibold">Pinned Favorites</h2>
                  <div className="h-px bg-border flex-1 ml-4" />
                </div>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {favorites.map(prompt => (
                      <PromptCard 
                        key={prompt.id} 
                        prompt={prompt} 
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                {favorites.length > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <Archive className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-display font-semibold text-muted-foreground">All Prompts</h2>
                    <div className="h-px bg-border flex-1 ml-4" />
                  </div>
                )}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {others.map(prompt => (
                      <PromptCard 
                        key={prompt.id} 
                        prompt={prompt} 
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <PromptFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        promptToEdit={promptToEdit}
      />
      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        promptToDelete={promptToDelete}
      />
    </div>
  );
}
