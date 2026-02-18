"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrackSearch } from "@/components/game/TrackSearch";
import { SpotifyTrack } from "@/types/spotify";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { TrackCard } from "@/components/game/TrackCard";
import { submitTrack, SpotifyTrackSubmission } from "@/app/actions/submissions";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface SubmitTrackDialogProps {
  podId: string;
  initialTrack?: SpotifyTrack | null;
}

export function SubmitTrackDialog({ podId, initialTrack }: SubmitTrackDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(initialTrack || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
  };

  const handleSubmit = async () => {
    if (!selectedTrack) return;

    try {
      setIsSubmitting(true);
      const submission: SpotifyTrackSubmission = {
        spotify_track_id: selectedTrack.id,
        track_name: selectedTrack.name,
        artist_name: selectedTrack.artists[0].name,
        album_image_url: selectedTrack.album.images[0]?.url || null,
        preview_url: selectedTrack.preview_url || null,
        spotify_uri: selectedTrack.external_urls.spotify,
      };

      await submitTrack(podId, submission);
      
      toast.success(t("pod.submit.success"));
      setOpen(false);
      // Keep the selected track if it was an edit, or reset? 
      // Providing feedback that it's done. 
      // If we are editing, we probably want to keep showing the new track if opened again, 
      // but the parent will re-render with new initialTrack anyway.
      setSelectedTrack(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t("errors.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full md:w-auto shadow-xl shadow-primary-500/20">
          <Send className="mr-2 w-4 h-4" />
          {initialTrack ? t("pod.actions.change_track") : t("pod.actions.submit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-surface-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{initialTrack ? t("pod.actions.change_track") : t("pod.actions.submit")}</DialogTitle>
          <DialogDescription>
            {t("pod.submit.description")}
          </DialogDescription>
        </DialogHeader>

        {!selectedTrack ? (
           <TrackSearch onSelect={handleTrackSelect} />
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-800 p-4 rounded-xl border border-white/5">
                 <h3 className="text-sm font-medium text-slate-400 mb-3">{t("pod.submit.selected_track")}</h3>
                 <TrackCard track={selectedTrack} />
            </div>
            
            <div className="flex gap-3 justify-end">
                <Button 
                    variant="ghost" 
                    onClick={() => setSelectedTrack(null)}
                    disabled={isSubmitting}
                >
                    {t("common.back")}
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            {t("pod.submit.submitting")}
                        </>
                    ) : (
                         t("common.confirm")
                    )}
                </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
