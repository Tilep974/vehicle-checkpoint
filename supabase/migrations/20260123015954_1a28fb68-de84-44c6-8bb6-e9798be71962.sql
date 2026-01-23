-- Create storage bucket for EDL photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('edl-photos', 'edl-photos', true);

-- Policy: Anyone can view photos (public bucket)
CREATE POLICY "Public read access for edl photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'edl-photos');

-- Policy: Authenticated users can upload photos
CREATE POLICY "Authenticated users can upload edl photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'edl-photos' AND auth.role() = 'authenticated');

-- Policy: Authenticated users can delete their uploads
CREATE POLICY "Authenticated users can delete edl photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'edl-photos' AND auth.role() = 'authenticated');