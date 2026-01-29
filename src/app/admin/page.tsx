'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Keyboard,
  ArrowLeft,
  Loader2,
  Trash2,
  Music,
  AlertTriangle,
  X,
  Database,
  AlertCircle,
  ChevronDown,
  Eye,
} from '@/components/icons';
import { useAllSongs, useDeleteSong, useSongLyrics } from '@/hooks/use-songs';
import type { SongDetail } from '@/lib/db';

// ============================================================================
// Types
// ============================================================================

interface ConfirmDialogProps {
  isOpen: boolean;
  songTitle: string;
  songArtist: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

interface SongRowProps {
  song: SongDetail;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  formatDate: (dateString: string) => string;
}

// ============================================================================
// Confirm Dialog Component
// ============================================================================

function ConfirmDialog({
  isOpen,
  songTitle,
  songArtist,
  onConfirm,
  onCancel,
  isDeleting,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className="card animate-scale-in relative w-full max-w-sm p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
      >
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          disabled={isDeleting}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="mb-2 text-center text-lg font-semibold text-[var(--foreground)]">
          곡 삭제
        </h2>
        <p className="mb-1 text-center text-sm font-medium text-[var(--foreground)]">
          {songTitle}
        </p>
        <p className="mb-6 text-center text-sm text-[var(--muted-foreground)]">
          {songArtist}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex min-h-[46px] flex-1 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-[var(--muted)] active:scale-[0.98] disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Lyrics Panel Component
// ============================================================================

function LyricsPanel({ songId }: { songId: number }) {
  const { data: lyrics, isLoading, error } = useSongLyrics(songId);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [lyrics, isLoading, error]);

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{ height: height > 0 ? height : 'auto' }}
    >
      <div ref={contentRef} className="border-t border-[var(--card-border)] bg-[var(--muted)]/30 px-4 py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error.message}
          </div>
        )}

        {lyrics && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 font-medium">
                {lyrics.language === 'ko' ? '한국어' : lyrics.language === 'en' ? '영어' : '혼합'}
              </span>
              <span>{lyrics.lines.length}줄</span>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl bg-[var(--card)] p-4">
              <div className="space-y-1.5">
                {lyrics.lines.map((line, index) => (
                  <p
                    key={index}
                    className="animate-slide-up text-sm leading-relaxed text-[var(--foreground)]"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <span className="mr-2 inline-block w-6 text-right text-xs tabular-nums text-[var(--muted-foreground)]">
                      {index + 1}
                    </span>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Song Row Component
// ============================================================================

function SongRow({ song, isExpanded, onToggleExpand, onDelete, formatDate }: SongRowProps) {
  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-[var(--muted)]/30"
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${isExpanded
                  ? 'rotate-180 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-[var(--foreground)]">
                {song.title}
              </p>
              <p className="mt-0.5 truncate text-sm text-[var(--muted-foreground)]">
                {song.artist}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
            {song.language === 'ko'
              ? '한국어'
              : song.language === 'en'
                ? '영어'
                : '혼합'}
          </span>
        </td>
        <td className="px-4 py-3 text-center text-sm tabular-nums text-[var(--muted-foreground)]">
          {song.linesCount}
        </td>
        <td className="px-4 py-3 text-center text-sm text-[var(--muted-foreground)]">
          {formatDate(song.createdAt)}
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isExpanded
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-[var(--muted-foreground)] hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
                }`}
              title="가사 보기"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="p-0">
            <LyricsPanel songId={song.id} />
          </td>
        </tr>
      )}
    </>
  );
}

// ============================================================================
// Admin Page
// ============================================================================

export default function AdminPage() {
  const { data, isLoading, error, refetch } = useAllSongs();
  const deleteMutation = useDeleteSong();

  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
    artist: string;
  } | null>(null);

  const [expandedSongId, setExpandedSongId] = useState<number | null>(null);

  const handleToggleExpand = useCallback((songId: number) => {
    setExpandedSongId((prev) => (prev === songId ? null : songId));
  }, []);

  const handleDeleteClick = useCallback(
    (id: number, title: string, artist: string) => {
      setDeleteTarget({ id, title, artist });
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (expandedSongId === deleteTarget.id) {
          setExpandedSongId(null);
        }
      },
      onError: (error) => {
        alert(`삭제 실패: ${error.message}`);
      },
    });
  }, [deleteTarget, deleteMutation, expandedSongId]);

  const handleCancelDelete = useCallback(() => {
    if (!deleteMutation.isPending) {
      setDeleteTarget(null);
    }
  }, [deleteMutation.isPending]);

  const songs = data?.songs ?? [];
  const isConnected = data?.isConnected ?? false;

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-500/20">
                <Keyboard className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-semibold text-[var(--foreground)]">
                곡 관리
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          {/* Connection status */}
          <div className="mb-6 flex items-center gap-2">
            <Database className="h-4 w-4 text-[var(--muted-foreground)]" />
            <span className="text-sm text-[var(--muted-foreground)]">
              데이터베이스 상태:
            </span>
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                확인 중...
              </span>
            ) : isConnected ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                연결됨
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                연결 안됨
              </span>
            )}
            {!isLoading && (
              <span className="ml-auto text-sm text-[var(--muted-foreground)]">
                총 {songs.length}곡
              </span>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="card mb-6 flex items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  오류 발생
                </p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
                  {error.message}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="card flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          )}

          {/* Not connected state */}
          {!isLoading && !isConnected && (
            <div className="card p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]">
                  <Database className="h-7 w-7 text-[var(--muted-foreground)]" />
                </div>
                <p className="font-medium text-[var(--foreground)]">
                  데이터베이스에 연결되지 않았습니다
                </p>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                  환경 변수를 확인하고 MySQL 서버가 실행 중인지 확인하세요
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && isConnected && songs.length === 0 && (
            <div className="card p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]">
                  <Music className="h-7 w-7 text-[var(--muted-foreground)]" />
                </div>
                <p className="font-medium text-[var(--foreground)]">
                  저장된 곡이 없습니다
                </p>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                  홈에서 노래를 검색하면 자동으로 저장됩니다
                </p>
              </div>
            </div>
          )}

          {/* Songs list */}
          {!isLoading && isConnected && songs.length > 0 && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] bg-[var(--muted)]/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        곡 정보
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        언어
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        줄 수
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        추가일
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {songs.map((song) => (
                      <SongRow
                        key={song.id}
                        song={song}
                        isExpanded={expandedSongId === song.id}
                        onToggleExpand={() => handleToggleExpand(song.id)}
                        onDelete={() => handleDeleteClick(song.id, song.title, song.artist)}
                        formatDate={formatDate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-[var(--muted-foreground)]">
          <p>Powered by Vertex AI Gemini</p>
        </footer>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        songTitle={deleteTarget?.title ?? ''}
        songArtist={deleteTarget?.artist ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
