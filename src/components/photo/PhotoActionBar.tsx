import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";

type Props = {
  photoId: string;
  likesCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
  isAuthenticated: boolean;
};

/**
 * Barra de acciones bajo una imagen: like (con contador) + save (favorito privado).
 */
export function PhotoActionBar({
  photoId,
  likesCount,
  hasLiked,
  hasSaved,
  isAuthenticated,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      <LikeButton
        photoId={photoId}
        initialLiked={hasLiked}
        initialCount={likesCount}
        isAuthenticated={isAuthenticated}
      />
      <SaveButton
        photoId={photoId}
        initialSaved={hasSaved}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
