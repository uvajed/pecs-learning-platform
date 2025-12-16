"use client";

import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";

const mockUser = {
  name: "Sarah Johnson",
  email: "sarah@example.com",
};

const mockChildren = [
  { id: "1", name: "Alex", currentPhase: 2, progress: 65, sessions: 24 },
  { id: "2", name: "Emma", currentPhase: 3, progress: 40, sessions: 18 },
];

export default function ChildrenPage() {
  return (
    <DashboardShell user={mockUser}>
      <PageHeader
        title="Children"
        description="Manage learner profiles and track their progress"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockChildren.map((child) => (
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
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
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
        <Card className="border-dashed hover:border-[var(--primary)] transition-colors cursor-pointer">
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
    </DashboardShell>
  );
}
