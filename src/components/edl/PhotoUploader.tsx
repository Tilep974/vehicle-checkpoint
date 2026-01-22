// Composant d'upload de photos
import { Camera, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  edlId?: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  disabled?: boolean;
}

export function PhotoUploader({ photos, disabled }: PhotoUploaderProps) {
  return (
    <div className="space-y-4">
      {photos.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Camera className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            {disabled ? "Aucune photo" : "Cliquez pour ajouter des photos"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <img key={i} src={photo} alt="" className="rounded-lg object-cover aspect-square" />
          ))}
        </div>
      )}
      {!disabled && (
        <Button variant="outline" className="w-full" disabled>
          <ImagePlus className="h-4 w-4 mr-2" />
          Ajouter des photos (bientôt disponible)
        </Button>
      )}
    </div>
  );
}
