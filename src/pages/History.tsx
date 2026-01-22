// Page d'historique des EDL avec recherche

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Search,
  Filter,
  FileText,
  ChevronRight,
  Calendar,
  Loader2,
  FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppLayout } from "@/components/layout/AppLayout";
import { searchEdlHistory, getAgencies } from "@/lib/supabase-queries";
import type { RentalWithDetails } from "@/types/edl";

export default function History() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyFilter, setAgencyFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Récupérer les agences
  const { data: agencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: getAgencies,
  });

  // Recherche dans l'historique
  const { data: rentals, isLoading, refetch } = useQuery({
    queryKey: ["edl-history", searchTerm, agencyFilter, dateFrom, dateTo],
    queryFn: () =>
      searchEdlHistory({
        clientName: searchTerm || undefined,
        vehicleRegistration: searchTerm || undefined,
        agencyId: agencyFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setAgencyFilter("");
    setDateFrom("");
    setDateTo("");
    setFiltersOpen(false);
  };

  const hasActiveFilters = searchTerm || agencyFilter || dateFrom || dateTo;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <HistoryIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Historique des EDL</h1>
            <p className="text-muted-foreground">
              Recherchez et consultez les états des lieux passés
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom client ou immatriculation..."
              className="pl-10"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres de recherche</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Agence</Label>
                  <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les agences" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les agences</SelectItem>
                      {agencies?.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={clearFilters}
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                      refetch();
                      setFiltersOpen(false);
                    }}
                  >
                    Appliquer
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button type="submit">Rechercher</Button>
        </form>

        {/* Résultats */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rentals?.length === 0 ? (
          <div className="text-center py-12">
            <FileX className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              Aucun résultat trouvé
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals?.map((rental) => (
              <HistoryCard key={rental.id} rental={rental} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function HistoryCard({ rental }: { rental: RentalWithDetails }) {
  const navigate = useNavigate();
  const hasDepartureEdl = rental.departure_edl?.completed_at;
  const hasReturnEdl = rental.return_edl?.completed_at;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">
                {rental.client.first_name} {rental.client.last_name}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">{rental.vehicle.registration}</span>
              <span className="text-muted-foreground text-sm">
                {rental.vehicle.brand} {rental.vehicle.model}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(rental.departure_date), "d MMM yyyy", {
                  locale: fr,
                })}
              </span>
              <span>{rental.agency.name}</span>
            </div>

            <div className="flex gap-2">
              {hasDepartureEdl ? (
                <Badge variant="success" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  EDL Départ
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  EDL Départ manquant
                </Badge>
              )}
              {hasReturnEdl ? (
                <Badge variant="success" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  EDL Retour
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  EDL Retour manquant
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {hasDepartureEdl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/edl/${rental.id}/departure`)}
              >
                Voir départ
              </Button>
            )}
            {hasReturnEdl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/edl/${rental.id}/return`)}
              >
                Voir retour
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
