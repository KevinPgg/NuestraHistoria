"use client";
// Botón de "me encanta" con feedback optimista (paleta Golden Hour).
import { useEffect, useState, useTransition } from "react";
import { toggleLike } from "@/app/foto/[id]/actions";

export function LikeButton({
  mediaId,
  likedByMe,
  otherLikers,
}: {
  mediaId: string;
  likedByMe: boolean;
  otherLikers: string[];
}) {
  const [liked, setLiked] = useState(likedByMe);
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => setLiked(likedByMe), [likedByMe]);

  function onClick() {
    const next = !liked;
    setLiked(next);
    if (next) {
      setBurst(true);
      setTimeout(() => setBurst(false), 350);
    }
    startTransition(() => toggleLike(mediaId));
  }

  const label = buildLabel(liked, otherLikers);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Quitar me encanta" : "Me encanta"}
        className={`transition disabled:opacity-60 ${burst ? "scale-125" : "active:scale-90"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-8 w-8 drop-shadow-sm ${liked ? "fill-rose-500 stroke-rose-500" : "fill-white/40 stroke-stone-500"}`}
          strokeWidth={1.8}
        >
          <path d="M12 21s-7.5-4.9-9.7-9.2C.9 8.9 2.2 5.5 5.4 5.1c1.9-.2 3.6.9 4.6 2.3.9-1.4 2.6-2.5 4.6-2.3 3.2.4 4.5 3.8 3.1 6.7C19.5 16.1 12 21 12 21z" />
        </svg>
      </button>
      {label && <span className="text-sm text-stone-600">{label}</span>}
    </div>
  );
}

function buildLabel(liked: boolean, otherLikers: string[]): string {
  const names = [...otherLikers];
  if (liked) names.unshift("ti");
  if (names.length === 0) return "";
  if (names.length === 1) {
    return names[0] === "ti" ? "Te encanta" : `A ${names[0]} le encanta`;
  }
  return `A ${names.join(" y a ")} les encanta`;
}
