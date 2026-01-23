// Formulaire d'État des Lieux

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Save,
  Camera,
  AlertTriangle,
  User,
  Car,
  MapPin,
  Calendar,
  Fuel,
  Gauge,
  Sparkles,
  MessageSquare,
  Loader2,
  Plus,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { SignaturePad } from "@/components/edl/SignaturePad";
import { PhotoUploader } from "@/components/edl/PhotoUploader";
import { DamagesList } from "@/components/edl/DamagesList";
import { useToast } from "@/hooks/use-toast";
import {
  getRentalById,
  createEdl,
  updateEdl,
  completeEdl,
  addDamage,
  sendEdlPdf,
} from "@/lib/supabase-queries";
import type { EdlType, DamageSeverity, Edl } from "@/types/edl";

const DAMAGE_LOCATIONS = [
  "Avant gauche",
  "Avant droit",
  "Arrière gauche",
  "Arrière droit",
  "Capot",
  "Toit",
  "Pare-brise",
  "Lunette arrière",
  "Portière avant gauche",
  "Portière avant droite",
  "Portière arrière gauche",
  "Portière arrière droite",
  "Rétroviseur gauche",
  "Rétroviseur droit",
  "Jante avant gauche",
  "Jante avant droite",
  "Jante arrière gauche",
  "Jante arrière droite",
  "Intérieur - Tableau de bord",
  "Intérieur - Sièges avant",
  "Intérieur - Sièges arrière",
  "Intérieur - Coffre",
];

export default function EdlForm() {
  const { rentalId, type } = useParams<{ rentalId: string; type: EdlType }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // État du formulaire
  const [currentEdl, setCurrentEdl] = useState<Edl | null>(null);
  const [mileage, setMileage] = useState<number | "">("");
  const [fuelLevel, setFuelLevel] = useState<number>(50);
  const [cleanlinessLevel, setCleanlinessLevel] = useState<number>(3);
  const [comments, setComments] = useState("");
  const [agentName, setAgentName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [agentSignature, setAgentSignature] = useState<string | null>(null);

  // Dialog pour ajouter un dommage
  const [damageDialogOpen, setDamageDialogOpen] = useState(false);
  const [newDamageLocation, setNewDamageLocation] = useState("");
  const [newDamageDescription, setNewDamageDescription] = useState("");
  const [newDamageSeverity, setNewDamageSeverity] =
    useState<DamageSeverity>("minor");

  // Récupération des données de la location
  const {
    data: rental,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rental", rentalId],
    queryFn: () => getRentalById(rentalId!),
    enabled: !!rentalId,
  });

  // Mutation pour créer/mettre à jour l'EDL
  const saveEdlMutation = useMutation({
    mutationFn: async () => {
      if (!rentalId || !type) throw new Error("Données manquantes");

      const edlData = {
        rental_id: rentalId,
        type: type as EdlType,
        mileage: mileage ? Number(mileage) : null,
        fuel_level: fuelLevel,
        cleanliness_level: cleanlinessLevel,
        comments: comments || null,
        agent_name: agentName || null,
      };

      if (currentEdl) {
        return updateEdl(currentEdl.id, edlData);
      } else {
        return createEdl(edlData);
      }
    },
    onSuccess: (data) => {
      setCurrentEdl(data);
      toast({
        title: "EDL enregistré",
        description: "Les modifications ont été sauvegardées.",
      });
      queryClient.invalidateQueries({ queryKey: ["rental", rentalId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour ajouter un dommage
  const addDamageMutation = useMutation({
    mutationFn: async () => {
      if (!currentEdl) throw new Error("Enregistrez d'abord l'EDL");
      return addDamage({
        edl_id: currentEdl.id,
        location: newDamageLocation,
        description: newDamageDescription,
        severity: newDamageSeverity,
        is_new: type === "return",
      });
    },
    onSuccess: () => {
      setDamageDialogOpen(false);
      setNewDamageLocation("");
      setNewDamageDescription("");
      setNewDamageSeverity("minor");
      queryClient.invalidateQueries({ queryKey: ["rental", rentalId] });
      toast({ title: "Dommage ajouté" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour compléter l'EDL
  const completeEdlMutation = useMutation({
    mutationFn: async () => {
      if (!currentEdl) throw new Error("Enregistrez d'abord l'EDL");
      if (!clientSignature || !agentSignature)
        throw new Error("Signatures requises");
      
      // Finaliser l'EDL
      const completedEdl = await completeEdl(currentEdl.id, clientSignature, agentSignature);
      
      // Envoyer le PDF par email
      try {
        await sendEdlPdf(currentEdl.id);
        toast({
          title: "Email envoyé",
          description: "L'état des lieux a été envoyé au client.",
        });
      } catch (emailError: any) {
        console.error("Email error:", emailError);
        toast({
          title: "EDL finalisé",
          description: "L'email n'a pas pu être envoyé mais l'EDL est sauvegardé.",
          variant: "default",
        });
      }
      
      return completedEdl;
    },
    onSuccess: () => {
      toast({
        title: "EDL finalisé",
        description: "L'état des lieux a été complété avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["rental", rentalId] });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialiser les données depuis l'EDL existant
  useEffect(() => {
    if (rental) {
      const existingEdl =
        type === "departure" ? rental.departure_edl : rental.return_edl;
      if (existingEdl) {
        setCurrentEdl(existingEdl);
        setMileage(existingEdl.mileage || "");
        setFuelLevel(existingEdl.fuel_level || 50);
        setCleanlinessLevel(existingEdl.cleanliness_level || 3);
        setComments(existingEdl.comments || "");
        setAgentName(existingEdl.agent_name || "");
        setClientSignature(existingEdl.client_signature_url);
        setAgentSignature(existingEdl.agent_signature_url);
        // Charger les photos existantes
        if (existingEdl.photos && existingEdl.photos.length > 0) {
          setPhotos(existingEdl.photos.map((p) => p.photo_url));
        }
      }
    }
  }, [rental, type]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !rental) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-destructive">
          <p>Location non trouvée</p>
          <Button variant="link" onClick={() => navigate("/")}>
            Retour au tableau de bord
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = currentEdl?.completed_at != null;
  const canComplete = currentEdl && clientSignature && agentSignature;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              EDL de {type === "departure" ? "départ" : "retour"}
            </h1>
            <p className="text-muted-foreground">
              {rental.client.first_name} {rental.client.last_name} -{" "}
              {rental.vehicle.registration}
            </p>
          </div>
          {isCompleted && (
            <Badge variant="success">
              <Check className="h-3 w-3 mr-1" />
              Complété
            </Badge>
          )}
        </div>

        {/* Infos location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">
                  {rental.client.first_name} {rental.client.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {rental.client.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Véhicule</p>
                <p className="font-medium">{rental.vehicle.registration}</p>
                <p className="text-sm text-muted-foreground">
                  {rental.vehicle.brand} {rental.vehicle.model}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Agence</p>
                <p className="font-medium">{rental.agency.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {type === "departure" ? "Départ" : "Retour"}
                </p>
                <p className="font-medium">
                  {format(
                    new Date(
                      type === "departure"
                        ? rental.departure_date
                        : rental.return_date
                    ),
                    "d MMM yyyy à HH:mm",
                    { locale: fr }
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire EDL */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">État du véhicule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Agent */}
            <div className="space-y-2">
              <Label htmlFor="agentName">Nom de l'agent</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Nom de l'agent"
                disabled={isCompleted}
              />
            </div>

            {/* Kilométrage */}
            <div className="space-y-2">
              <Label htmlFor="mileage" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Kilométrage
              </Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) =>
                  setMileage(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="Ex: 45000"
                disabled={isCompleted}
              />
            </div>

            {/* Carburant */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Niveau de carburant: {fuelLevel}%
              </Label>
              <Slider
                value={[fuelLevel]}
                onValueChange={([v]) => setFuelLevel(v)}
                max={100}
                step={5}
                disabled={isCompleted}
              />
            </div>

            {/* Propreté */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Niveau de propreté: {cleanlinessLevel}/5
              </Label>
              <Slider
                value={[cleanlinessLevel]}
                onValueChange={([v]) => setCleanlinessLevel(v)}
                min={1}
                max={5}
                step={1}
                disabled={isCompleted}
              />
            </div>

            {/* Commentaires */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Commentaires
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Observations générales..."
                rows={3}
                disabled={isCompleted}
              />
            </div>

            {/* Bouton sauvegarder */}
            {!isCompleted && (
              <Button
                onClick={() => saveEdlMutation.mutate()}
                disabled={saveEdlMutation.isPending}
                className="w-full"
              >
                {saveEdlMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Enregistrer l'EDL
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              edlId={currentEdl?.id}
              photos={photos}
              onPhotosChange={setPhotos}
              disabled={isCompleted || !currentEdl}
            />
            {!currentEdl && (
              <p className="text-sm text-muted-foreground mt-2">
                Enregistrez d'abord l'EDL pour ajouter des photos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dommages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Dommages
            </CardTitle>
            {!isCompleted && currentEdl && (
              <Dialog
                open={damageDialogOpen}
                onOpenChange={setDamageDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un dommage</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Emplacement</Label>
                      <Select
                        value={newDamageLocation}
                        onValueChange={setNewDamageLocation}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un emplacement" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAMAGE_LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newDamageDescription}
                        onChange={(e) =>
                          setNewDamageDescription(e.target.value)
                        }
                        placeholder="Décrivez le dommage..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gravité</Label>
                      <Select
                        value={newDamageSeverity}
                        onValueChange={(v) =>
                          setNewDamageSeverity(v as DamageSeverity)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minor">Mineur</SelectItem>
                          <SelectItem value="moderate">Modéré</SelectItem>
                          <SelectItem value="severe">Sévère</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => addDamageMutation.mutate()}
                      disabled={
                        addDamageMutation.isPending ||
                        !newDamageLocation ||
                        !newDamageDescription
                      }
                    >
                      {addDamageMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Ajouter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <DamagesList
              damages={currentEdl?.damages || []}
              edlId={currentEdl?.id}
              disabled={isCompleted}
            />
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signatures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Signature client</Label>
              <SignaturePad
                value={clientSignature}
                onChange={setClientSignature}
                disabled={isCompleted}
              />
            </div>
            <div className="space-y-2">
              <Label>Signature agent</Label>
              <SignaturePad
                value={agentSignature}
                onChange={setAgentSignature}
                disabled={isCompleted}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bouton finaliser */}
        {!isCompleted && (
          <Button
            size="lg"
            className="w-full"
            onClick={() => completeEdlMutation.mutate()}
            disabled={!canComplete || completeEdlMutation.isPending}
          >
            {completeEdlMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Check className="mr-2 h-5 w-5" />
            Finaliser l'état des lieux
          </Button>
        )}

        {!canComplete && !isCompleted && (
          <p className="text-center text-sm text-muted-foreground">
            Enregistrez l'EDL et ajoutez les signatures pour finaliser
          </p>
        )}
      </div>
    </AppLayout>
  );
}
