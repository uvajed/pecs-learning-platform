"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Users,
  Images,
  BarChart3,
  BookOpen,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { PECS_PHASES } from "@/types";


interface Child {
  id: string;
  name: string;
  current_phase: number;
  progress: number;
}

export default function HomePage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/children");
        if (res.ok) {
          const data = await res.json();
          setChildren(data);
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false);
      }
    }
    fetchChildren();
  }, []);
  return (
    <DashboardShell>
      <PageHeader
        title="PECS Learning Platform"
        description="Ready to continue learning? Choose an activity below."
      />

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/practice">
          <Card className="hover:border-[var(--primary)] transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg">Start Practice</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Begin a new learning session
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/children">
          <Card className="hover:border-[var(--primary)] transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg">Children</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Manage learner profiles
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cards">
          <Card className="hover:border-[var(--primary)] transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center mb-4">
                <Images className="w-8 h-8 text-[var(--foreground)]" />
              </div>
              <h3 className="font-semibold text-lg">Picture Cards</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Browse and create cards
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="hover:border-[var(--primary)] transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--success)] flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg">Progress</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                View learning analytics
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Children Progress */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Children's Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
              </div>
            ) : children.length > 0 ? (
              <>
                {children.map((child) => (
                  <div key={child.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{child.name}</span>
                        <span className="text-sm text-[var(--muted-foreground)] ml-2">
                          Phase {child.current_phase}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{child.progress}%</span>
                    </div>
                    <Progress value={child.progress} />
                  </div>
                ))}
                <Link href="/children">
                  <Button variant="outline" className="w-full mt-4">
                    View All Children
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-[var(--muted-foreground)] mb-3">No children profiles yet</p>
                <Link href="/children">
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Child
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PECS Phases Overview */}
        <Card>
          <CardHeader>
            <CardTitle>PECS Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PECS_PHASES.map((phase) => (
                <div
                  key={phase.id}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-[var(--muted)]/50"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{phase.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{phase.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)] truncate">
                      {phase.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/learn">
              <Button variant="outline" className="w-full mt-4">
                <BookOpen className="w-4 h-4 mr-2" />
                Learn About PECS
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            <p>No recent sessions yet.</p>
            <Link href="/practice">
              <Button className="mt-4">Start Your First Session</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
