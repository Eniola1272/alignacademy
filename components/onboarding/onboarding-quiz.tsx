"use client";

/**
 * Onboarding quiz — shown on first dashboard visit.
 * 3 questions → track recommendation.
 * Dismissed/completed state stored in localStorage so it never re-appears.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const STORAGE_KEY = "aa_onboarding_v1";

// ── Quiz data ─────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "goal",
    question: "What's your main goal?",
    options: [
      { value: "web",       label: "Build websites & apps" },
      { value: "python",    label: "Learn Python" },
      { value: "career",    label: "Change careers into tech" },
      { value: "exploring", label: "Just exploring" },
    ],
  },
  {
    id: "experience",
    question: "How much coding experience do you have?",
    options: [
      { value: "none",         label: "Complete beginner" },
      { value: "some",         label: "I've tried coding before" },
      { value: "experienced",  label: "I know another language" },
    ],
  },
  {
    id: "time",
    question: "How much time can you commit per week?",
    options: [
      { value: "low",    label: "1–3 hours" },
      { value: "medium", label: "4–7 hours" },
      { value: "high",   label: "8+ hours" },
    ],
  },
] as const;

type Answers = Record<string, string>;

/** Returns the recommended track slug based on answers. */
function getRecommendation(_answers: Answers): {
  slug: string;
  title: string;
  reason: string;
} {
  // Currently only one track. Expand this map as more tracks are added.
  return {
    slug: "web-development-fundamentals",
    title: "Web Development Fundamentals",
    reason:
      "This track takes you from zero to building real websites with HTML, CSS, and JavaScript — the foundation for everything on the web.",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OnboardingQuiz() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0); // 0 = not started, 1-3 = questions, 4 = result
  const [answers, setAnswers] = useState<Answers>({});

  // Check localStorage on mount — only run on client
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "done");
    setStep(QUESTIONS.length + 1); // result screen
  };

  const selectAnswer = (questionId: string, value: string) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);

    if (step < QUESTIONS.length) {
      // Auto-advance after a tiny delay so the selection is visible
      setTimeout(() => setStep((s) => s + 1), 200);
    }
  };

  // ── Intro screen ────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <QuizCard onDismiss={dismiss}>
        <div className="flex flex-col items-start gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick start
          </p>
          <h2 className="text-lg font-bold">
            Not sure where to begin?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Answer 3 quick questions and we&apos;ll recommend the best learning
            track for your goals.
          </p>
          <button
            onClick={() => setStep(1)}
            className={cn(buttonVariants({ size: "sm" }), "gap-2 mt-1")}
          >
            Find my track
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </QuizCard>
    );
  }

  // ── Result screen ───────────────────────────────────────────────────────────
  if (step > QUESTIONS.length) {
    const rec = getRecommendation(answers);
    return (
      <QuizCard onDismiss={dismiss}>
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            We recommend
          </p>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-1">{rec.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rec.reason}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/tracks/${rec.slug}`}
              className={cn(buttonVariants({ size: "sm" }), "gap-2")}
              onClick={dismiss}
            >
              Start this track
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={dismiss}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground"
              )}
            >
              Maybe later
            </button>
          </div>
        </div>
      </QuizCard>
    );
  }

  // ── Question screen ─────────────────────────────────────────────────────────
  const q = QUESTIONS[step - 1];

  return (
    <QuizCard onDismiss={dismiss}>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i < step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-2">
        {step} of {QUESTIONS.length}
      </p>
      <h2 className="text-base font-semibold mb-4">{q.question}</h2>

      <div className="flex flex-col gap-2 mb-5">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => selectAnswer(q.id, opt.value)}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm text-left transition-all",
              answers[q.id] === opt.value
                ? "border-primary bg-primary/5 text-primary font-medium"
                : "border-border hover:border-primary/40 hover:bg-muted/30"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-muted-foreground"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        {answers[q.id] && (
          <button
            onClick={() =>
              step === QUESTIONS.length ? finish() : setStep((s) => s + 1)
            }
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            {step === QUESTIONS.length ? "See recommendation" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </QuizCard>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function QuizCard({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div className="relative rounded-lg border border-primary/20 bg-primary/5 p-6 mb-8">
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "absolute top-3 right-3 h-7 w-7 p-0 text-muted-foreground"
        )}
      >
        <X className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}
