import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";

interface PodMember {
  user_id: string;
  joined_at: string;
  user: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface PodMembersProps {
  members: PodMember[];
  submissions?: any[]; // We will type this properly with Database Row type
}

export async function PodMembers({ members, submissions = [] }: PodMembersProps) {
  const t = await getTranslations("pod");
  const totalSlots = 7;
  const filledSlots = members.length;
  const emptySlots = Math.max(0, totalSlots - filledSlots);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Filled Slots */}
      {members.map((member) => {
        const submission = submissions.find(s => s.user_id === member.user_id);
        
        return (
            <Card 
            key={member.user_id} 
            className="group relative flex flex-col items-center justify-center p-4 bg-surface-800 border-white/5 overflow-hidden transition-all hover:border-primary-500/30"
            >
            {/* If submitted, show track info as background or overlay? For MVP we keep avatar but add track info below */}
            
            <Avatar 
                size="lg"
                src={member.user.avatar_url}
                fallback={member.user.display_name}
                alt={member.user.display_name}
                className="mb-3 border-2 border-primary-500/50 relative z-10"
            />
            <span className="font-medium text-white text-center truncate w-full relative z-10">
                {member.user.display_name}
            </span>
            
            <div className="mt-2 min-h-[40px] flex flex-col items-center justify-center w-full relative z-10">
                {submission ? (
                    <>
                        <span className="text-xs font-bold text-primary-400 truncate w-full text-center">
                            {submission.track_name}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate w-full text-center">
                            {submission.artist_name}
                        </span>
                    </>
                ) : (
                    <span className="text-xs text-slate-500 mt-1 italic">
                        {t("member_status.ready")}
                    </span>
                )}
            </div>

            {/* Optional: Add album art as faint background if submitted */}
            {submission?.album_image_url && (
                 <div 
                    className="absolute inset-0 opacity-10 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                    style={{ backgroundImage: `url(${submission.album_image_url})` }}
                 />
            )}

            {/* Deep Link */}
            {submission?.spotify_uri && (
                <a 
                    href={submission.spotify_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#1DB954] rounded-full text-black hover:scale-110"
                    title={t("actions.listenOnSpotify")}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                </a>
            )}
            </Card>
        );
      })}

      {/* Empty Slots */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <Card 
          key={`empty-${i}`} 
          variant="glass"
          className="flex flex-col items-center justify-center p-4 border-dashed border-white/10 opacity-60"
        >
          <div className="w-14 h-14 mb-3 rounded-full bg-surface-800 flex items-center justify-center">
            <User className="w-6 h-6 text-slate-600" />
          </div>
          <span className="font-medium text-slate-600 text-center">
            {t("member_status.empty")}
          </span>
          <span className="text-xs text-slate-700 mt-1">
            {t("member_status.waiting")}
          </span>
        </Card>
      ))}
    </div>
  );
}
