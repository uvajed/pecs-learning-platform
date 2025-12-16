"use client";

import { useState } from "react";
import { Plus, Search, Volume2 } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { speakCardLabel } from "@/lib/audio/tts";
import {
  FOOD_CARDS,
  TOY_CARDS,
  ACTION_CARDS,
  PEOPLE_CARDS,
  FEELING_CARDS,
  PLACE_CARDS,
  STARTER_CARDS,
  CARD_CATEGORIES
} from "@/lib/cards/cardData";
import Image from "next/image";


const categories = ["All", "Food", "Toys", "Actions", "People", "Feelings", "Places", "Starters"];

// Transform card data to include category for filtering
const allCards = [
  ...FOOD_CARDS.map(c => ({ ...c, category: "Food" })),
  ...TOY_CARDS.map(c => ({ ...c, category: "Toys" })),
  ...ACTION_CARDS.map(c => ({ ...c, category: "Actions" })),
  ...PEOPLE_CARDS.map(c => ({ ...c, category: "People" })),
  ...FEELING_CARDS.map(c => ({ ...c, category: "Feelings" })),
  ...PLACE_CARDS.map(c => ({ ...c, category: "Places" })),
  ...STARTER_CARDS.map(c => ({ ...c, category: "Starters" })),
];

export default function CardsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = allCards.filter((card) => {
    const matchesCategory = selectedCategory === "All" || card.category === selectedCategory;
    const matchesSearch = card.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardShell>
      <PageHeader
        title="Picture Cards"
        description="Browse, create, and manage communication cards"
        action={
          <Button>
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
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            className="hover:border-[var(--primary)] transition-all hover:shadow-lg cursor-pointer"
          >
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-20 h-20 relative mb-3">
                <Image
                  src={card.imageUrl}
                  alt={card.label}
                  fill
                  className="object-contain"
                />
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
        <Card className="border-dashed hover:border-[var(--primary)] transition-colors cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center min-h-[160px]">
            <div className="w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-[var(--muted-foreground)]" />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Add Card</span>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
