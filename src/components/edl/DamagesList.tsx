// Liste des dommages
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Damage } from "@/types/edl";

interface DamagesListProps {
  damages: Damage[];
  edlId?: string;
  disabled?: boolean;
}

const severityLabels = {
  minor: { label: "Mineur", variant: "secondary" as const },
  moderate: { label: "Modéré", variant: "warning" as const },
  severe: { label: "Sévère", variant: "destructive" as const },
};

export function DamagesList({ damages }: DamagesListProps) {
  if (damages.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto opacity-50" />
        <p className="mt-2 text-sm">Aucun dommage enregistré</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {damages.map((damage) => (
        <div key={damage.id} className="flex items-start gap-3 p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{damage.location}</span>
              <Badge variant={severityLabels[damage.severity].variant}>
                {severityLabels[damage.severity].label}
              </Badge>
              {damage.is_new && <Badge variant="default">Nouveau</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{damage.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
