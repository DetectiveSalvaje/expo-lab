import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";
import { CommentButton } from "./CommentButton";

type Props = {
  photoId: string;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
  isAuthenticated: boolean;
  onCommentClick: () => void;
};

/**
 * Barra de acciones bajo la imagen.
 * Layout: like + comentario a la izquierda, save pushado a la derecha (estilo Instagram).
 */
export function PhotoActionBar({
  photoId,
  likesCount,
  commentsCount,
  hasLiked,
  hasSaved,
  isAuthenticated,
  onCommentClick,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      <LikeButton
        photoId={photoId}
        initialLiked={hasLiked}
        initialCount={likesCount}
        isAuthenticated={isAuthenticated}
      />
      <CommentButton count={commentsCount} onClick={onCommentClick} />
      <div className="ml-auto">
        <SaveButton
          photoId={photoId}
          initialSaved={hasSaved}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
