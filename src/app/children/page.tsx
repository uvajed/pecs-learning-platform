"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Settings, Trash2, Database, AlertCircle } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";

const mockUser = {
  name: "Sarah Johnson",
  email: "sarah@example.com",
};

interface Child {
  id: string;
  name: string;
  current_phase: number;
  progress: number;
  sessions: number;
}

// Empty array - users create their own profiles
const demoChildren: Child[] = [];

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConfigured, setIsDbConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [newChildPhase, setNewChildPhase] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch children on mount
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/children");

      if (res.status === 503) {
        // Database not configured, use demo mode
        setIsDbConfigured(false);
        setChildren(demoChildren);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch children");
      }

      const data = await res.json();
      setChildren(data);
      setIsDbConfigured(true);
    } catch (err) {
      setError("Failed to load children. Using demo mode.");
      setIsDbConfigured(false);
      setChildren(demoChildren);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) return;

    setIsSaving(true);

    if (isDbConfigured) {
      try {
        const res = await fetch("/api/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newChildName.trim(),
            current_phase: newChildPhase,
          }),
        });

        if (!res.ok) throw new Error("Failed to create child");

        const newChild = await res.json();
        setChildren([newChild, ...children]);
      } catch (err) {
        setError("Failed to save. Try again.");
        setIsSaving(false);
        return;
      }
    } else {
      // Demo mode - add locally
      const newChild: Child = {
        id: `local-${Date.now()}`,
        name: newChildName.trim(),
        current_phase: newChildPhase,
        progress: 0,
        sessions: 0,
      };
      setChildren([newChild, ...children]);
    }

    setNewChildName("");
    setNewChildPhase(1);
    setIsAddDialogOpen(false);
    setIsSaving(false);
  };

  const handleDeleteChild = async () => {
    if (!childToDelete) return;

    setIsSaving(true);

    if (isDbConfigured && !childToDelete.id.startsWith("demo-") && !childToDelete.id.startsWith("local-")) {
      try {
        const res = await fetch(`/api/children/${childToDelete.id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete child");
      } catch (err) {
        setError("Failed to delete. Try again.");
        setIsSaving(false);
        return;
      }
    }

    setChildren(children.filter((c) => c.id !== childToDelete.id));
    setChildToDelete(null);
    setIsDeleteDialogOpen(false);
    setIsSaving(false);
  };

  const openDeleteDialog = (child: Child) => {
    setChildToDelete(child);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardShell user={mockUser}>
      <PageHeader
        title="Children"
        description="Manage learner profiles and track their progress"
        action={
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
        }
      />

      {/* Database status banner */}
      {!isDbConfigured && (
        <div className="mb-6 p-4 rounded-[var(--radius)] bg-[var(--warning)]/10 border border-[var(--warning)] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--warning)]">Demo Mode</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Database not configured. Data won't persist after refresh.{" "}
              <Link href="https://github.com/uvajed/pecs-learning-platform#database-setup" className="underline">
                Set up Supabase
              </Link>{" "}
              for persistent storage.
            </p>
          </div>
        </div>
      )}

      {isDbConfigured && (
        <div className="mb-6 p-4 rounded-[var(--radius)] bg-[var(--success)]/10 border border-[var(--success)] flex items-center gap-3">
          <Database className="w-5 h-5 text-[var(--success)]" />
          <p className="text-sm">
            <span className="font-medium text-[var(--success)]">Connected to database</span>
            <span className="text-[var(--muted-foreground)]"> - Data is saved automatically</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-[var(--radius)] bg-[var(--error)]/10 border border-[var(--error)]">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id} className="hover:border-[var(--primary)] transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="text-lg">
                        {child.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{child.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Phase {child.current_phase}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(child)}
                      className="text-[var(--error)] hover:text-[var(--error)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{child.progress}%</span>
                    </div>
                    <Progress value={child.progress} />
                  </div>

                  <p className="text-sm text-[var(--muted-foreground)]">
                    {child.sessions} sessions completed
                  </p>

                  <Link href="/practice">
                    <Button className="w-full mt-2">Start Practice</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Child Card */}
          <Card
            className="border-dashed hover:border-[var(--primary)] transition-colors cursor-pointer"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="font-medium">Add a Child</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Create a new learner profile
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Child Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Child</DialogTitle>
            <DialogDescription>
              Create a new learner profile to start tracking their PECS progress.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Child's Name
              </label>
              <Input
                id="name"
                placeholder="Enter name"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChild()}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phase" className="text-sm font-medium">
                Starting Phase
              </label>
              <select
                id="phase"
                value={newChildPhase}
                onChange={(e) => setNewChildPhase(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value={1}>Phase 1 - How to Communicate</option>
                <option value={2}>Phase 2 - Distance and Persistence</option>
                <option value={3}>Phase 3 - Picture Discrimination</option>
                <option value={4}>Phase 4 - Sentence Structure</option>
                <option value={5}>Phase 5 - Responsive Requesting</option>
                <option value={6}>Phase 6 - Commenting</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChild} disabled={!newChildName.trim() || isSaving}>
              {isSaving ? "Saving..." : "Add Child"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Child</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {childToDelete?.name}? This will delete all their progress data.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteChild}
              disabled={isSaving}
              className="bg-[var(--error)] hover:bg-[var(--error)]/90"
            >
              {isSaving ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
