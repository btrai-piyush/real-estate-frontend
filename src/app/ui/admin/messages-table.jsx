"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  RefreshCw,
  Trash2,
} from "lucide-react";

const TOOLBAR_BUTTON_BASE =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-white transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40";

function formatMessageDate(dateValue, id) {
  if (!dateValue) return `#${id}`;

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return `#${id}`;
  }

  const now = new Date();
  const sameYear = now.getFullYear() === parsed.getFullYear();

  return parsed.toLocaleDateString("en-US", sameYear
    ? {
      month: "short",
      day: "numeric",
    }
    : {
    month: "short",
    day: "numeric",
      year: "numeric",
    });
}

function getPreviewText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function InboxList({
  messages = [],
  loading = false,
  error = "",
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 0,
  onPageChange = () => {},
  onMarkRead = () => {},
  onToggleRead = () => {},
  onDelete = () => {},
  onMarkAllRead = () => {},
}) {
  const [selectedIds, setSelectedIds] = useState({});
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = useMemo(
    () => (unreadOnly ? messages.filter((m) => !m.readStatus) : messages),
    [messages, unreadOnly]
  );

  useEffect(() => {
    const visibleIds = new Set(filtered.map((message) => String(message.id)));

    setSelectedIds((prev) => {
      const next = {};
      for (const [id, isSelected] of Object.entries(prev)) {
        if (visibleIds.has(id) && isSelected) {
          next[id] = true;
        }
      }
      return next;
    });
  }, [filtered]);

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds]
  );

  const effectivePageSize = pageSize > 0 ? pageSize : messages.length;
  const rangeStart = totalCount > 0 && effectivePageSize > 0
    ? (currentPage - 1) * effectivePageSize + 1
    : 0;
  const rangeEnd = totalCount > 0 && effectivePageSize > 0
    ? Math.min(rangeStart + effectivePageSize - 1, totalCount)
    : 0;
  const rangeLabel = totalCount > 0 ? `${rangeStart}-${rangeEnd} of ${totalCount}` : "0 of 0";

  const { selectedReadCount, selectedUnreadCount } = useMemo(() => {
    let readCount = 0;
    let unreadCount = 0;

    filtered.forEach((message) => {
      if (!selectedIds[String(message.id)]) return;

      if (message.readStatus) {
        readCount += 1;
      } else {
        unreadCount += 1;
      }
    });

    return { selectedReadCount: readCount, selectedUnreadCount: unreadCount };
  }, [filtered, selectedIds]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((message) => selectedIds[String(message.id)]);

  const toggleSelect = (id) => {
    const key = String(id);
    setSelectedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const filteredIdSet = new Set(filtered.map((message) => String(message.id)));

      setSelectedIds((prev) => {
        const next = { ...prev };
        for (const id of filteredIdSet) {
          delete next[id];
        }
        return next;
      });
      return;
    }

    const allIds = {};
    filtered.forEach((message) => {
      allIds[String(message.id)] = true;
    });
    setSelectedIds((prev) => ({ ...prev, ...allIds }));
  };

  const clearSelection = () => {
    setSelectedIds({});
  };

  const getSelectedMessageIds = () =>
    filtered
      .filter((message) => selectedIds[String(message.id)])
      .map((message) => message.id);

  const handleBulkDelete = () => {
    const ids = getSelectedMessageIds();
    if (ids.length === 0) return;

    onDelete(ids);
    clearSelection();
  };

  const handleBulkReadAction = () => {
    const ids = getSelectedMessageIds();
    if (ids.length === 0) return;

    if (selectedReadCount > 0 && selectedUnreadCount === 0) {
      onToggleRead(ids);
    } else {
      onMarkRead(ids);
    }
    clearSelection();
  };

  const handleMarkAllRead = () => {
    const ids = messages.map((message) => message.id).filter((id) => id !== undefined && id !== null);
    if (ids.length === 0) return;

    onMarkAllRead(ids);
    clearSelection();
  };

  return (
    <section className="w-full px-3 py-4 sm:px-6 sm:py-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#23314d] px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              className={`${TOOLBAR_BUTTON_BASE} ${allVisibleSelected ? "bg-sky-100 text-sky-700" : ""}`}
              title={allVisibleSelected ? "Unselect all" : "Select all"}
              aria-label={allVisibleSelected ? "Unselect all" : "Select all"}
            >
              <span className="text-[11px] font-semibold">{allVisibleSelected ? "−" : "✓"}</span>
            </button>
            <button
              type="button"
              className={TOOLBAR_BUTTON_BASE}
              title="Refresh"
              aria-label="Refresh"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={15} />
            </button>
            <button
              type="button"
              className={TOOLBAR_BUTTON_BASE}
              title={selectedReadCount > 0 && selectedUnreadCount === 0 ? "Mark as unread" : "Mark as read"}
              aria-label={selectedReadCount > 0 && selectedUnreadCount === 0 ? "Mark as unread" : "Mark as read"}
              onClick={handleBulkReadAction}
              disabled={selectedCount === 0}
            >
              {selectedReadCount > 0 && selectedUnreadCount === 0 ? <Mail size={15} /> : <MailOpen size={15} />}
            </button>
            <button
              type="button"
              className="ml-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              title="Mark all as read"
              aria-label="Mark all as read"
              onClick={handleMarkAllRead}
              disabled={filtered.length === 0}
            >
              Mark all read
            </button>
            <button
              type="button"
              className={TOOLBAR_BUTTON_BASE}
              title="Delete selected"
              aria-label="Delete selected"
              onClick={handleBulkDelete}
              disabled={selectedCount === 0}
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setUnreadOnly((value) => !value)}
              className={`rounded-md border px-2.5 py-1 font-medium transition-colors ${
                unreadOnly
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {unreadOnly ? "Unread" : "All mail"}
            </button>
            <span className="hidden text-white sm:inline">{rangeLabel}</span>
            <div className="flex items-center">
              <button
                type="button"
                className={TOOLBAR_BUTTON_BASE}
                aria-label="Previous page"
                title="Previous page"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={loading || currentPage <= 1}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                className={TOOLBAR_BUTTON_BASE}
                aria-label="Next page"
                title="Next page"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={loading || currentPage >= totalPages}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mx-3 mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 sm:mx-4">
            {error}
          </div>
        ) : null}

        {selectedCount > 0 ? (
          <div className="border-b border-sky-100 bg-sky-50 px-4 py-1.5 text-xs font-medium text-sky-700">
            {selectedCount} selected
          </div>
        ) : null}

        <div className="divide-y divide-slate-100">
        {loading && filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-400">Loading messages...</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-400">No messages</div>
        ) : (
          filtered.map((msg) => {
            const messageId = String(msg.id);
            const isSelected = Boolean(selectedIds[messageId]);
            const isUnread = !msg.readStatus;
            const dateText = formatMessageDate(msg.AddedOn ?? msg.addedOn ?? msg.createdOn, msg.id);
            const previewText = getPreviewText(msg.message);
            const toggleLabel = isUnread ? "Mark as read" : "Mark as unread";
            const ToggleIcon = isUnread ? Mail : MailOpen;

            return (
              <article
                key={messageId}
                className={`group flex min-h-[46px] border items-center px-2.5 py-2 text-sm transition-colors sm:px-4 hover:inset-shadow-2xs ${
                  isSelected
                    ? "bg-sky-50"
                    : isUnread
                      ? "bg-white"
                      : "bg-[#f8fafc]"
                }`}
                onClick={() => onMarkRead(msg.id)}
                onMouseEnter={() => setHoveredId(messageId)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelect(messageId);
                  }}
                  className={`flex h-5 w-5 items-center justify-center rounded border text-[10px] transition-colors ${
                    isSelected
                      ? "border-sky-400 bg-sky-500 text-white"
                      : "border-slate-300 bg-white text-transparent hover:text-slate-300"
                  }`}
                  aria-label={isSelected ? "Unselect message" : "Select message"}
                  title={isSelected ? "Unselect" : "Select"}
                >
                  ✓
                </button>

                <div className={`min-w-[120px] ml-4 shrink-0 truncate text-sm sm:min-w-[190px] ${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                  {msg.name || "Unknown Sender"}
                </div>

                <div className="min-w-0 flex-1 truncate text-sm text-slate-600">
                  <span className={`${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                    {msg.subject || "(No subject)"}
                  </span>
                  <span className="mx-1.5 text-slate-300">-</span>
                  <span className="text-slate-500">{previewText || "No message body"}</span>
                </div>

                {hoveredId === messageId ? (
                  <div
                    className="ml-2 flex shrink-0 items-center gap-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => onToggleRead(msg.id)}
                      title={toggleLabel}
                      aria-label={toggleLabel}
                    >
                      <ToggleIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => onDelete(msg.id)}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <span className={`ml-2 w-20 shrink-0 text-right text-xs ${isUnread ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                    {dateText}
                  </span>
                )}
              </article>
            );
          })
        )}
        </div>

      </div>
    </section>
  );
}