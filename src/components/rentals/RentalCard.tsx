// Carte d'affichage d'une location

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Car, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RentalWithDetails, EdlType } from "@/types/edl";

interface RentalCardProps {
  rental: RentalWithDetails;
  type: EdlType;
  onClick: () => void;
}

export function RentalCard({ rental, type, onClick }: RentalCardProps) {
  const edl = type === 'departure' ? rental.departure_edl : rental.return_edl;
  const isCompleted = edl?.completed_at != null;
  const date = type === 'departure' ? rental.departure_date : rental.return_date;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        isCompleted && "border-success/30 bg-success/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Informations principales */}
          <div className="flex-1 space-y-3">
            {/* Client */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {rental.client.first_name} {rental.client.last_name}
              </span>
              {isCompleted && (
                <Badge variant="success" className="ml-2">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Terminé
                </Badge>
              )}
              {!isCompleted && edl && (
                <Badge variant="warning" className="ml-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  En cours
                </Badge>
              )}
            </div>

            {/* Véhicule */}
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{rental.vehicle.registration}</span>
              <span className="text-muted-foreground">
                {rental.vehicle.brand} {rental.vehicle.model}
              </span>
            </div>

            {/* Agence et heure */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {rental.agency.name}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(date), "HH:mm", { locale: fr })}
              </div>
            </div>
          </div>

          {/* Flèche */}
          <div className="flex items-center self-center">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
