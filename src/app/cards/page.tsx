"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Volume2, Trash2, Upload } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { speakCardLabel } from "@/lib/audio/tts";
import {
  FOOD_CARDS,
  TOY_CARDS,
  ACTION_CARDS,
  PEOPLE_CARDS,
  FEELING_CARDS,
  PLACE_CARDS,
  STARTER_CARDS,
} from "@/lib/cards/cardData";
import Image from "next/image";

const categories = ["All", "Food", "Toys", "Actions", "People", "Feelings", "Places", "Starters", "Custom"];

// Transform card data to include category for filtering
const builtInCards = [
  ...FOOD_CARDS.map(c => ({ ...c, category: "Food" })),
  ...TOY_CARDS.map(c => ({ ...c, category: "Toys" })),
  ...ACTION_CARDS.map(c => ({ ...c, category: "Actions" })),
  ...PEOPLE_CARDS.map(c => ({ ...c, category: "People" })),
  ...FEELING_CARDS.map(c => ({ ...c, category: "Feelings" })),
  ...PLACE_CARDS.map(c => ({ ...c, category: "Places" })),
  ...STARTER_CARDS.map(c => ({ ...c, category: "Starters" })),
];

// Emoji options for quick card creation
const emojiOptions = [
  "🍎", "🍌", "🥤", "🍪", "🧁", "🍕", "🌮", "🍦",
  "🚗", "⚽", "🎨", "📚", "🎵", "🎮", "🧸", "🎈",
  "👋", "👍", "❤️", "⭐", "🌈", "🌸", "🐶", "🐱",
  "🏠", "🏫", "🛝", "🛁", "🌳", "☀️", "🌙", "💤",
];

interface CustomCard {
  id: string;
  label: string;
  imageUrl: string;
  category: string;
  emoji?: string;
  isCustom: boolean;
}

export default function CardsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CustomCard | null>(null);
  const [customCards, setCustomCards] = useState<CustomCard[]>([]);

  // Form state
  const [newCardLabel, setNewCardLabel] = useState("");
  const [newCardCategory, setNewCardCategory] = useState("Custom");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load custom cards from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pecs-custom-cards");
    if (saved) {
      try {
        setCustomCards(JSON.parse(saved));
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  // Save custom cards to localStorage
  const saveCustomCards = (cards: CustomCard[]) => {
    setCustomCards(cards);
    localStorage.setItem("pecs-custom-cards", JSON.stringify(cards));
  };

  const allCards = [
    ...builtInCards,
    ...customCards,
  ];

  const filteredCards = allCards.filter((card) => {
    const matchesCategory = selectedCategory === "All" || card.category === selectedCategory;
    const matchesSearch = card.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateCard = () => {
    if (!newCardLabel.trim() || !selectedEmoji) return;

    setIsSaving(true);

    const newCard: CustomCard = {
      id: `custom-${Date.now()}`,
      label: newCardLabel.trim(),
      imageUrl: "",
      category: newCardCategory,
      emoji: selectedEmoji,
      isCustom: true,
    };

    saveCustomCards([...customCards, newCard]);

    // Reset form
    setNewCardLabel("");
    setSelectedEmoji("");
    setNewCardCategory("Custom");
    setIsCreateDialogOpen(false);
    setIsSaving(false);
  };

  const handleDeleteCard = () => {
    if (!cardToDelete) return;

    const updated = customCards.filter(c => c.id !== cardToDelete.id);
    saveCustomCards(updated);
    setCardToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (card: CustomCard) => {
    setCardToDelete(card);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Picture Cards"
        description="Browse, create, and manage communication cards"
        action={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Card
          </Button>
        }
      />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] hover:bg-[var(--muted)]/80"
              }`}
            >
              {category}
              {category === "Custom" && customCards.length > 0 && (
                <span className="ml-1 text-xs">({customCards.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            className="hover:border-[var(--primary)] transition-all hover:shadow-lg cursor-pointer relative group"
          >
            <CardContent className="p-4 flex flex-col items-center">
              {/* Delete button for custom cards */}
              {"isCustom" in card && card.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(card as CustomCard);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--error)]/10 text-[var(--error)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--error)]/20"
                  aria-label="Delete card"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              <div className="w-20 h-20 relative mb-3 flex items-center justify-center">
                {"emoji" in card && card.emoji ? (
                  <span className="text-5xl">{card.emoji}</span>
                ) : (
                  <Image
                    src={card.imageUrl}
                    alt={card.label}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <span className="font-medium text-center">{card.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakCardLabel(card.label);
                }}
                className="mt-2 p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                aria-label={`Speak ${card.label}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        ))}

        {/* Add Card */}
        <Card
          className="border-dashed hover:border-[var(--primary)] transition-colors cursor-pointer"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center min-h-[160px]">
            <div className="w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-[var(--muted-foreground)]" />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Add Card</span>
          </CardContent>
        </Card>
      </div>

      {/* Create Card Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Card</DialogTitle>
            <DialogDescription>
              Create a new picture card with an emoji and label.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardLabel">Card Label</Label>
              <Input
                id="cardLabel"
                placeholder="e.g., Ball, Drink, Happy"
                value={newCardLabel}
                onChange={(e) => setNewCardLabel(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Choose an Emoji</Label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-[var(--muted)]/50 rounded-[var(--radius)] max-h-40 overflow-y-auto">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-[var(--radius)] transition-all ${
                      selectedEmoji === emoji
                        ? "bg-[var(--primary)] scale-110"
                        : "hover:bg-[var(--muted)]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {selectedEmoji && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Selected: <span className="text-xl">{selectedEmoji}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardCategory">Category</Label>
              <select
                id="cardCategory"
                value={newCardCategory}
                onChange={(e) => setNewCardCategory(e.target.value)}
                className="w-full h-12 px-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)]"
              >
                <option value="Custom">Custom</option>
                <option value="Food">Food</option>
                <option value="Toys">Toys</option>
                <option value="Actions">Actions</option>
                <option value="People">People</option>
                <option value="Feelings">Feelings</option>
                <option value="Places">Places</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCard}
              disabled={!newCardLabel.trim() || !selectedEmoji || isSaving}
            >
              {isSaving ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{cardToDelete?.label}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCard}
              className="bg-[var(--error)] hover:bg-[var(--error)]/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
