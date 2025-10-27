import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "fokus" | "kratka" | "duga";

const TIMER_DURATIONS = {
  fokus: 25 * 60,
  kratka: 5 * 60,
  duga: 15 * 60,
};

const TIMER_LABELS = {
  fokus: "Fokus",
  kratka: "Kratka Pauza",
  duga: "Duga Pauza",
};

const FocusTimer = () => {
  const [mode, setMode] = useState<TimerMode>("fokus");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.fokus);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    toast({
      title: "Tajmer završen!",
      description: `${TIMER_LABELS[mode]} je završen.`,
    });

    // Auto-switch to next mode
    const nextMode: TimerMode = mode === "fokus" ? "kratka" : "fokus";
    setMode(nextMode);
    setTimeLeft(TIMER_DURATIONS[nextMode]);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[800px]">
        <h1 className="text-4xl font-bold mb-8 text-center">Fokus Timer</h1>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-center gap-2">
              <Button
                variant={mode === "fokus" ? "default" : "outline"}
                onClick={() => switchMode("fokus")}
              >
                Fokus (25 min)
              </Button>
              <Button
                variant={mode === "kratka" ? "default" : "outline"}
                onClick={() => switchMode("kratka")}
              >
                Kratka (5 min)
              </Button>
              <Button
                variant={mode === "duga" ? "default" : "outline"}
                onClick={() => switchMode("duga")}
              >
                Duga (15 min)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                {TIMER_LABELS[mode]}
              </h2>
              <div className="text-8xl font-bold tracking-wider mb-6">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full bg-secondary rounded-full h-3 mb-6 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-32"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pauza
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="w-32"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kako funkcioniše Pomodoro tehnika?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Odaberite zadatak na kojem želite raditi</p>
            <p>2. Pokrenite 25-minutni fokus tajmer</p>
            <p>3. Radite dok tajmer ne istekne</p>
            <p>4. Uzmite kratku pauzu od 5 minuta</p>
            <p>5. Nakon 4 fokus sesije, uzmite dužu pauzu od 15 minuta</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FocusTimer;
