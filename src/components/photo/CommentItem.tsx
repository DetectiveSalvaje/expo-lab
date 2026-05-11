import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { FeedComment } from "@/app/actions/comments";
import { CommentDeleteButton } from "./CommentDeleteButton";

type Props = {
  comment: FeedComment;
  photoId: string;
  currentUserId: string | null;
  onDeleted?: (commentId: string) => void;
};

export function CommentItem({ comment, photoId, currentUserId, onDeleted }: Props) {
  const isOwn = currentUserId === comment.user_id;
  const postedAt = new Date(comment.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li className="flex gap-3">
      <Link
        href={`/u/${comment.author.username}`}
        className="shrink-0 transition-opacity hover:opacity-80"
      >
        <Avatar
          username={comment.author.username}
          fullName={comment.author.full_name}
          avatarUrl={comment.author.avatar_url}
          size="sm"
        />
      </Link>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link
            href={`/u/${comment.author.username}`}
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            {comment.author.full_name ?? comment.author.username}
          </Link>
          <span className="font-mono text-xs text-muted">
            @{comment.author.username}
          </span>
          <span className="ml-auto font-mono text-xs uppercase tracking-wider text-muted">
            {postedAt}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {comment.body}
        </p>
        {isOwn && (
          <div className="mt-1.5">
            <CommentDeleteButton
              commentId={comment.id}
              photoId={photoId}
              onDeleted={onDeleted}
            />
          </div>
        )}
      </div>
    </li>
  );
}
