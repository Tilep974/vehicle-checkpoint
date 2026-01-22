// Dashboard principal - Locations du jour

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { 
  CalendarDays, 
  ArrowDownLeft, 
  ArrowUpRight,
  Loader2,
  FileX
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { RentalCard } from "@/components/rentals/RentalCard";
import { getTodayRentals } from "@/lib/supabase-queries";
import type { EdlType } from "@/types/edl";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<EdlType>("departure");
  const navigate = useNavigate();
  const today = new Date();

  const { data: rentals, isLoading, error } = useQuery({
    queryKey: ["today-rentals", activeTab],
    queryFn: () => getTodayRentals(activeTab),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Locations du jour</h1>
            <p className="text-muted-foreground">
              {format(today, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>

        {/* Onglets Départs / Retours */}
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as EdlType)}
          className="space-y-4"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="departure" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Départs
            </TabsTrigger>
            <TabsTrigger value="return" className="gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Retours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departure" className="space-y-3">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState />
            ) : rentals?.length === 0 ? (
              <EmptyState type="departure" />
            ) : (
              rentals?.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  type="departure"
                  onClick={() => navigate(`/edl/${rental.id}/departure`)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="return" className="space-y-3">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState />
            ) : rentals?.length === 0 ? (
              <EmptyState type="return" />
            ) : (
              rentals?.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  type="return"
                  onClick={() => navigate(`/edl/${rental.id}/return`)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-12 text-destructive">
      <p>Erreur lors du chargement des données</p>
    </div>
  );
}

function EmptyState({ type }: { type: EdlType }) {
  return (
    <div className="text-center py-12">
      <FileX className="h-12 w-12 mx-auto text-muted-foreground/50" />
      <p className="mt-4 text-muted-foreground">
        Aucun {type === "departure" ? "départ" : "retour"} prévu aujourd'hui
      </p>
    </div>
  );
}
