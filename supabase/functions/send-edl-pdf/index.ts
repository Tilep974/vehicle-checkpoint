import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EdlPdfRequest {
  edlId: string;
}

// ============================================
// PERSONNALISATION DU PDF - MODIFIEZ ICI
// ============================================
function generateEdlHtml(data: {
  edl: any;
  rental: any;
  client: any;
  vehicle: any;
  agency: any;
  damages: any[];
  photos: any[];
}): string {
  const { edl, rental, client, vehicle, agency, damages, photos } = data;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const severityLabels: Record<string, string> = {
    minor: "Mineur",
    moderate: "Modéré",
    severe: "Sévère",
  };

  const cleanlinessLabels = ["", "Très sale", "Sale", "Correct", "Propre", "Impeccable"];

  // ============================================
  // TEMPLATE HTML DU PDF - PERSONNALISEZ ICI
  // ============================================
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>État des Lieux - ${vehicle.registration}</title>
  <style>
    /* STYLES DU PDF - MODIFIEZ ICI */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      font-size: 14px; 
      line-height: 1.5; 
      color: #333;
      padding: 40px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      border-bottom: 2px solid #1e40af;
      padding-bottom: 20px;
    }
    .header h1 { 
      color: #1e40af; 
      font-size: 24px; 
      margin-bottom: 5px; 
    }
    .header p { color: #666; }
    .section { 
      margin-bottom: 25px; 
      page-break-inside: avoid;
    }
    .section-title { 
      background: #1e40af; 
      color: white; 
      padding: 8px 15px; 
      font-size: 14px; 
      font-weight: bold;
      margin-bottom: 15px;
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 15px; 
    }
    .info-item { 
      background: #f8fafc; 
      padding: 10px; 
      border-radius: 5px; 
    }
    .info-label { 
      font-size: 12px; 
      color: #666; 
      margin-bottom: 3px; 
    }
    .info-value { 
      font-weight: bold; 
      color: #1e40af; 
    }
    .damages-table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    .damages-table th, 
    .damages-table td { 
      border: 1px solid #ddd; 
      padding: 10px; 
      text-align: left; 
    }
    .damages-table th { 
      background: #f1f5f9; 
      font-weight: bold; 
    }
    .severity-minor { color: #f59e0b; }
    .severity-moderate { color: #f97316; }
    .severity-severe { color: #dc2626; }
    .photos-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 10px; 
    }
    .photo-item img { 
      width: 100%; 
      height: 150px; 
      object-fit: cover; 
      border-radius: 5px; 
    }
    .signatures { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 30px; 
      margin-top: 30px; 
    }
    .signature-box { 
      border: 1px solid #ddd; 
      padding: 15px; 
      text-align: center; 
    }
    .signature-box img { 
      max-width: 200px; 
      height: auto; 
    }
    .signature-label { 
      margin-top: 10px; 
      font-weight: bold; 
      color: #666; 
    }
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #ddd; 
      text-align: center; 
      font-size: 12px; 
      color: #666; 
    }
    .meter-bar { 
      background: #e5e7eb; 
      height: 20px; 
      border-radius: 10px; 
      overflow: hidden; 
    }
    .meter-fill { 
      height: 100%; 
      background: linear-gradient(90deg, #dc2626, #f59e0b, #22c55e); 
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ÉTAT DES LIEUX DE ${edl.type === "departure" ? "DÉPART" : "RETOUR"}</h1>
    <p>${agency.name} - ${formatDate(edl.created_at)}</p>
  </div>

  <div class="section">
    <div class="section-title">INFORMATIONS GÉNÉRALES</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Client</div>
        <div class="info-value">${client.first_name} ${client.last_name}</div>
        <div>${client.email}</div>
        ${client.phone ? `<div>${client.phone}</div>` : ""}
      </div>
      <div class="info-item">
        <div class="info-label">Véhicule</div>
        <div class="info-value">${vehicle.registration}</div>
        <div>${vehicle.brand} ${vehicle.model}${vehicle.color ? ` - ${vehicle.color}` : ""}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date de départ</div>
        <div class="info-value">${formatDate(rental.departure_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date de retour</div>
        <div class="info-value">${formatDate(rental.return_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Agent</div>
        <div class="info-value">${edl.agent_name || "Non spécifié"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Référence</div>
        <div class="info-value">${rental.external_reference || rental.id.substring(0, 8)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">ÉTAT DU VÉHICULE</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Kilométrage</div>
        <div class="info-value">${edl.mileage ? `${edl.mileage.toLocaleString("fr-FR")} km` : "Non renseigné"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Niveau de carburant</div>
        <div class="info-value">${edl.fuel_level || 0}%</div>
        <div class="meter-bar" style="margin-top: 5px;">
          <div class="meter-fill" style="width: ${edl.fuel_level || 0}%;"></div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Propreté</div>
        <div class="info-value">${cleanlinessLabels[edl.cleanliness_level || 0] || "Non évalué"} (${edl.cleanliness_level || 0}/5)</div>
      </div>
      <div class="info-item">
        <div class="info-label">Commentaires</div>
        <div>${edl.comments || "Aucun commentaire"}</div>
      </div>
    </div>
  </div>

  ${damages.length > 0 ? `
  <div class="section">
    <div class="section-title">DOMMAGES CONSTATÉS (${damages.length})</div>
    <table class="damages-table">
      <thead>
        <tr>
          <th>Emplacement</th>
          <th>Description</th>
          <th>Gravité</th>
          <th>Nouveau</th>
        </tr>
      </thead>
      <tbody>
        ${damages.map(d => `
          <tr>
            <td>${d.location}</td>
            <td>${d.description}</td>
            <td class="severity-${d.severity}">${severityLabels[d.severity]}</td>
            <td>${d.is_new ? "Oui" : "Non"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
  ` : ""}

  ${photos.length > 0 ? `
  <div class="section">
    <div class="section-title">PHOTOS (${photos.length})</div>
    <div class="photos-grid">
      ${photos.map(p => `
        <div class="photo-item">
          <img src="${p.photo_url}" alt="${p.description || 'Photo EDL'}" />
        </div>
      `).join("")}
    </div>
  </div>
  ` : ""}

  <div class="section signatures">
    <div class="signature-box">
      ${edl.client_signature_url ? `<img src="${edl.client_signature_url}" alt="Signature client" />` : "<p>Pas de signature</p>"}
      <div class="signature-label">Signature Client</div>
    </div>
    <div class="signature-box">
      ${edl.agent_signature_url ? `<img src="${edl.agent_signature_url}" alt="Signature agent" />` : "<p>Pas de signature</p>"}
      <div class="signature-label">Signature Agent</div>
    </div>
  </div>

  <div class="footer">
    <p>Document généré automatiquement le ${formatDate(new Date().toISOString())}</p>
    <p>${agency.name}${agency.address ? ` - ${agency.address}` : ""}${agency.phone ? ` - ${agency.phone}` : ""}</p>
  </div>
</body>
</html>
  `;
}

// ============================================
// PERSONNALISATION DE L'EMAIL - MODIFIEZ ICI
// ============================================
function generateEmailHtml(data: {
  client: any;
  vehicle: any;
  agency: any;
  edlType: string;
}): string {
  const { client, vehicle, agency, edlType } = data;
  const typeLabel = edlType === "departure" ? "départ" : "retour";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f8fafc; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>État des Lieux de ${typeLabel}</h1>
    </div>
    <div class="content">
      <p>Bonjour ${client.first_name} ${client.last_name},</p>
      <p>Veuillez trouver ci-joint l'état des lieux de ${typeLabel} pour votre location du véhicule <strong>${vehicle.brand} ${vehicle.model}</strong> (${vehicle.registration}).</p>
      <p>Ce document récapitule l'ensemble des informations relevées lors de l'inspection du véhicule.</p>
      <p>Nous vous remercions de votre confiance.</p>
      <p>Cordialement,<br>${agency.name}</p>
    </div>
    <div class="footer">
      <p>${agency.name}${agency.address ? ` | ${agency.address}` : ""}${agency.phone ? ` | ${agency.phone}` : ""}</p>
    </div>
  </div>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { edlId }: EdlPdfRequest = await req.json();

    // Récupérer les données de l'EDL
    const { data: edl, error: edlError } = await supabase
      .from("edl")
      .select("*")
      .eq("id", edlId)
      .single();

    if (edlError || !edl) {
      throw new Error("EDL non trouvé");
    }

    // Récupérer la location
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .select("*, client:clients(*), vehicle:vehicles(*), agency:agencies(*)")
      .eq("id", edl.rental_id)
      .single();

    if (rentalError || !rental) {
      throw new Error("Location non trouvée");
    }

    // Récupérer les dommages
    const { data: damages } = await supabase
      .from("damages")
      .select("*")
      .eq("edl_id", edlId);

    // Récupérer les photos
    const { data: photos } = await supabase
      .from("edl_photos")
      .select("*")
      .eq("edl_id", edlId);

    // Générer le HTML du PDF
    const pdfHtml = generateEdlHtml({
      edl,
      rental,
      client: rental.client,
      vehicle: rental.vehicle,
      agency: rental.agency,
      damages: damages || [],
      photos: photos || [],
    });

    // Générer le HTML de l'email
    const emailHtml = generateEmailHtml({
      client: rental.client,
      vehicle: rental.vehicle,
      agency: rental.agency,
      edlType: edl.type,
    });

    const typeLabel = edl.type === "departure" ? "départ" : "retour";

    // Vérifier si RESEND_API_KEY est configuré
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Dynamically import Resend when API key is available
      const { Resend } = await import("https://esm.sh/resend@2.0.0");
      const resend = new Resend(resendApiKey);

      // Envoyer l'email avec le HTML du PDF en pièce jointe
      const emailResponse = await resend.emails.send({
        from: `${rental.agency.name} <onboarding@resend.dev>`, // Changez pour votre domaine vérifié
        to: [rental.client.email],
        subject: `État des lieux de ${typeLabel} - ${rental.vehicle.registration}`,
        html: emailHtml,
        attachments: [
          {
            filename: `EDL_${typeLabel}_${rental.vehicle.registration}_${new Date().toISOString().split("T")[0]}.html`,
            content: btoa(pdfHtml),
          },
        ],
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email envoyé avec succès",
          emailId: emailResponse.data?.id,
          pdfHtml,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // Retourner juste le HTML si pas de clé Resend
      console.log("RESEND_API_KEY not configured, returning HTML only");
      return new Response(
        JSON.stringify({
          success: true,
          message: "PDF généré (email non envoyé - RESEND_API_KEY manquant)",
          pdfHtml,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-edl-pdf function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
