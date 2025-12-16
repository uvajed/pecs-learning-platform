"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Settings, Trash2 } from "lucide-react";
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
  currentPhase: number;
  progress: number;
  sessions: number;
}

const initialChildren: Child[] = [
  { id: "1", name: "Alex", currentPhase: 2, progress: 65, sessions: 24 },
  { id: "2", name: "Emma", currentPhase: 3, progress: 40, sessions: 18 },
];

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [newChildPhase, setNewChildPhase] = useState(1);

  const handleAddChild = () => {
    if (!newChildName.trim()) return;

    const newChild: Child = {
      id: Date.now().toString(),
      name: newChildName.trim(),
      currentPhase: newChildPhase,
      progress: 0,
      sessions: 0,
    };

    setChildren([...children, newChild]);
    setNewChildName("");
    setNewChildPhase(1);
    setIsAddDialogOpen(false);
  };

  const handleDeleteChild = () => {
    if (!childToDelete) return;
    setChildren(children.filter((c) => c.id !== childToDelete.id));
    setChildToDelete(null);
    setIsDeleteDialogOpen(false);
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
                      Phase {child.currentPhase}
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
            <Button onClick={handleAddChild} disabled={!newChildName.trim()}>
              Add Child
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
              className="bg-[var(--error)] hover:bg-[var(--error)]/90"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
