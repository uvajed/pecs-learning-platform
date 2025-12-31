import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Child {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  currentPhase: number;
  preferences: ChildPreferences;
  createdAt: string;
  lastActiveAt: string;
}

export interface ChildPreferences {
  favoriteCards: string[];
  rewardStyle: "stars" | "balloons" | "confetti" | "fireworks";
  soundEnabled: boolean;
  animationsEnabled: boolean;
  sessionDurationMinutes: number;
  themeId?: string;
}

interface ChildState {
  children: Child[];
  activeChildId: string | null;

  // Actions
  addChild: (child: Omit<Child, "id" | "createdAt" | "lastActiveAt">) => Child;
  updateChild: (id: string, updates: Partial<Child>) => void;
  removeChild: (id: string) => void;
  setActiveChild: (id: string) => void;
  getActiveChild: () => Child | null;
  updateLastActive: (id: string) => void;
}

const DEFAULT_PREFERENCES: ChildPreferences = {
  favoriteCards: [],
  rewardStyle: "stars",
  soundEnabled: true,
  animationsEnabled: true,
  sessionDurationMinutes: 10,
};

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      children: [],
      activeChildId: null,

      addChild: (childData) => {
        const newChild: Child = {
          ...childData,
          id: `child-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          preferences: { ...DEFAULT_PREFERENCES, ...childData.preferences },
        };

        set((state) => ({
          children: [...state.children, newChild],
          activeChildId: state.activeChildId || newChild.id,
        }));

        return newChild;
      },

      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id ? { ...child, ...updates } : child
          ),
        }));
      },

      removeChild: (id) => {
        set((state) => {
          const newChildren = state.children.filter((c) => c.id !== id);
          const newActiveId =
            state.activeChildId === id
              ? newChildren[0]?.id || null
              : state.activeChildId;

          return {
            children: newChildren,
            activeChildId: newActiveId,
          };
        });
      },

      setActiveChild: (id) => {
        const child = get().children.find((c) => c.id === id);
        if (child) {
          set({ activeChildId: id });
          get().updateLastActive(id);
        }
      },

      getActiveChild: () => {
        const { children, activeChildId } = get();
        return children.find((c) => c.id === activeChildId) || null;
      },

      updateLastActive: (id) => {
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id
              ? { ...child, lastActiveAt: new Date().toISOString() }
              : child
          ),
        }));
      },
    }),
    {
      name: "pecs-children-storage",
    }
  )
);

// Helper hooks
export function useActiveChild() {
  const { children, activeChildId, setActiveChild, getActiveChild } = useChildStore();
  return {
    children,
    activeChildId,
    activeChild: getActiveChild(),
    setActiveChild,
    hasChildren: children.length > 0,
    hasMultipleChildren: children.length > 1,
  };
}
