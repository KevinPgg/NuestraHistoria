"use client";
// Botón de "me encanta" con feedback optimista. La verdad vive en la BD; aquí
// sólo adelantamos el cambio visual mientras la server action confirma.
import { useEffect, useState, useTransition } from "react";
import { toggleLike } from "@/app/foto/[id]/actions";

export function LikeButton({
  mediaId,
  likedByMe,
  otherLikers,
}: {
  mediaId: string;
  likedByMe: boolean;
  otherLikers: string[]; // nombres de quienes dieron like y no soy yo
}) {
  const [liked, setLiked] = useState(likedByMe);
  const [pending, startTransition] = useTransition();

  // Re-sincroniza con el servidor tras revalidar.
  useEffect(() => setLiked(likedByMe), [likedByMe]);

  function onClick() {
    setLiked((v) => !v); // optimista
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
        className="transition active:scale-90 disabled:opacity-60"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-7 w-7 ${liked ? "fill-rose-500 stroke-rose-500" : "fill-none stroke-white/60"}`}
          strokeWidth={2}
        >
          <path d="M12 21s-7.5-4.9-9.7-9.2C.9 8.9 2.2 5.5 5.4 5.1c1.9-.2 3.6.9 4.6 2.3.9-1.4 2.6-2.5 4.6-2.3 3.2.4 4.5 3.8 3.1 6.7C19.5 16.1 12 21 12 21z" />
        </svg>
      </button>
      {label && <span className="text-sm text-white/70">{label}</span>}
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
