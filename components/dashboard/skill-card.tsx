import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";

type SkillCardProps = {
  title: string;
  subtitle: string;
  levelLabel: string;
  progress: number;
  highlight?: boolean;
};

export function SkillCard({
  title,
  subtitle,
  levelLabel,
  progress,
  highlight,
}: SkillCardProps) {
  return (
    <Card
      className={cn(
        "transition-transform hover:-translate-y-0.5 hover:shadow-md",
        highlight ? "border-2 border-primary/30 bg-emerald-50/30" : ""
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-border">
        <div>
          <CardTitle className="flex items-center gap-1.5 text-[15px]">
            {highlight && (
              <Medal className="h-4 w-4 text-primary" aria-hidden="true" />
            )}
            <span>{title}</span>
          </CardTitle>
          <CardDescription className="mt-1 text-sm leading-relaxed">
            {subtitle}
          </CardDescription>
        </div>
        <Badge variant="outline" className="shrink-0">
          {levelLabel}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Progress</span>
          <span className="font-medium text-text">{progress}%</span>
        </div>
        <Progress value={progress} />
      </CardContent>
    </Card>
  );
}
