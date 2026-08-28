"use client";


import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  Copy,
  LockKeyhole,
  Sparkles,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

const toolColors = {
  ChatGPT: "mint",
  Claude: "apricot",
  Gemini: "blue",
  Midjourney: "plum",
};

export function PromptCard({ prompt, index = 0 }) {
  const { user, loading } = useAuth();

  const promptId = prompt._id || prompt.slug;
  const detailPath = `/prompts/${promptId}`;

  const destination =
    !loading && !user
      ? `/login?next=${encodeURIComponent(detailPath)}`
      : detailPath;

  const creatorName =
    prompt.creator?.name || "PromptArc creator";

  const tags = Array.isArray(prompt.tags)
    ? prompt.tags
    : [];

  const rating = Number(prompt.averageRating || 0);

  return (
    <motion.article
      className="prompt-card"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: Math.min(index * 0.06, 0.25),
        duration: 0.5,
      }}
      whileHover={{ y: -5 }}
    >
      {/* AI tool and premium badge */}
      <div className="prompt-card-top">
        <span
          className={`tool-pill ${toolColors[prompt.aiTool] || "mint"
            }`}
        >
          <Sparkles size={13} />
          {prompt.aiTool}
        </span>

        {prompt.visibility === "private" && (
          <span className="premium-pill">
            <LockKeyhole size={12} />
            Premium
          </span>
        )}
      </div>

      {/* Prompt thumbnail image */}
      {prompt.thumbnail && (
        <Link
          href={destination}
          className="prompt-card-thumbnail"
          aria-label={`View details for ${prompt.title}`}
        >
          <img
            src={prompt.thumbnail}
            alt={`${prompt.title} thumbnail`}
            loading="lazy"
          />
        </Link>
      )}

      {/* Prompt information */}
      <div className="prompt-card-body">
        <p className="card-category">
          {prompt.category} · {prompt.difficulty}
        </p>

        <h3>
          <Link href={destination}>
            {prompt.title}
          </Link>
        </h3>

        <p className="card-copy">
          {prompt.description}
        </p>
      </div>

      {/* Tags */}
      <div className="prompt-tags">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>

      {/* Creator and statistics */}
      <div className="prompt-card-footer">
        <div className="creator-mini">
          <span>
            {prompt.creator?.photoURL ? (
              <img
                src={prompt.creator.photoURL}
                alt={creatorName}
                referrerPolicy="no-referrer"
              />
            ) : (
              initials(creatorName)
            )}
          </span>

          <div>
            <small>by</small>
            <strong>{creatorName}</strong>
          </div>
        </div>

        <div className="card-stats">
          <span>
            <Star size={14} fill="currentColor" />
            {rating.toFixed(1)}
          </span>

          <span>
            <Copy size={14} />
            {compact(prompt.copyCount)}
          </span>

          <span>
            <Bookmark size={14} />
            {compact(prompt.bookmarkCount)}
          </span>
        </div>
      </div>

      {/* Details button */}
      <Link
        className="card-details"
        href={destination}
        aria-label={`View details for ${prompt.title}`}
      >
        Details
        <ArrowUpRight size={16} />
      </Link>
    </motion.article>
  );
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function compact(value) {
  const number = Number(value || 0);

  return number >= 1000
    ? `${(number / 1000).toFixed(1)}k`
    : String(number);
}