"use client";

import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { PECS_PHASES } from "@/types";
import { BookOpen, CheckCircle } from "lucide-react";


export default function LearnPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Learn About PECS"
        description="Understanding the Picture Exchange Communication System"
      />

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">What is PECS?</h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                The Picture Exchange Communication System (PECS) is an augmentative and alternative
                communication system developed for individuals with autism and other communication
                difficulties. PECS teaches functional communication through the exchange of pictures,
                starting with simple exchanges and building to complex sentence structures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <h2 className="text-xl font-semibold mb-4">The 6 Phases of PECS</h2>
      <div className="space-y-4">
        {PECS_PHASES.map((phase) => (
          <Card key={phase.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{phase.id}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{phase.name}</h3>
                  <p className="text-[var(--muted-foreground)] mb-4">{phase.description}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Learning Objectives</h4>
                      <ul className="space-y-1">
                        {phase.objectives.map((objective, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Success Criteria</h4>
                      <ul className="space-y-1">
                        {phase.successCriteria.map((criteria, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[var(--success)] mt-0.5 flex-shrink-0" />
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tips for Success</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </span>
              <span>Practice in a calm, distraction-free environment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </span>
              <span>Use highly motivating items that the learner wants</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </span>
              <span>Provide immediate reinforcement after successful exchanges</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
                4
              </span>
              <span>Keep sessions short and positive (5-15 minutes)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
                5
              </span>
              <span>Be consistent with prompting and fading strategies</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
