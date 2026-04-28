"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { contactApi } from "@/api/api";
import InboxList from "@/app/ui/admin/messages-table";
import {
    deleteMessageById,
    markMessageAsRead,
    selectMessagesError,
    selectMessagesList,
    selectMessagesLoading,
    setMessages,
    setMessagesError,
    setMessagesLoading,
    toggleMessageReadStatus,
} from "@/app/redux/messages/messagesSlice";

const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "true" || normalized === "1" || normalized === "yes";
    }
    return false;
};

const normalizeMessage = (message, index) => ({
    id:
        message?.id ??
        message?.ID ??
        message?.messageId ??
        message?.MessageId ??
        index + 1,
    name: String(message?.name ?? message?.Name ?? "Unknown Sender"),
    email: String(message?.email ?? message?.Email ?? ""),
    phone: String(message?.phone ?? message?.Phone ?? ""),
    company: String(message?.company ?? message?.Company ?? "General"),
    subject: String(message?.subject ?? message?.Subject ?? "(No subject)"),
    message: String(message?.message ?? message?.Message ?? ""),
    readStatus: normalizeBoolean(message?.readStatus),
    AddedOn: message?.AddedOn || message?.addedOn || message?.createdOn || message?.createdAt || message?.date || null,
    createdOn: message?.createdOn || message?.createdAt || message?.date || message?.AddedOn || message?.addedOn || null,
});

const extractMessages = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.messages)) return response.messages;
    if (response && typeof response === "object") return [response];
    return [];
};

const normalizeMessageIds = (ids) => {
    const values = Array.isArray(ids) ? ids : [ids];
    const seen = new Set();
    const normalized = [];

    values.forEach((id) => {
        if (id === undefined || id === null) return;
        const token = String(id).trim();
        if (!token || seen.has(token)) return;

        seen.add(token);
        normalized.push(id);
    });

    return normalized;
};

export default function MessagesPage() {
    const dispatch = useDispatch();
    const messages = useSelector(selectMessagesList);
    const loading = useSelector(selectMessagesLoading);
    const error = useSelector(selectMessagesError);
    const PAGE_SIZE = 50;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

    useEffect(() => {
        let mounted = true;

        const fetchMessages = async () => {
            dispatch(setMessagesLoading(true));
            dispatch(setMessagesError(""));

            try {
                const response = await contactApi.getMessages(currentPage);
                if (!mounted) return;

                const normalizedMessages = extractMessages(response?.items ?? response).map(normalizeMessage);
                const resolvedTotalCount = Number(
                    response?.totalCount ?? response?.TotalCount ?? normalizedMessages?.[0]?.totalCount ?? normalizedMessages.length
                ) || 0;

                setTotalCount(resolvedTotalCount);
                dispatch(setMessages(normalizedMessages));
            } catch (err) {
                if (!mounted) return;
                dispatch(setMessagesError(err?.message || "Failed to load messages."));
                dispatch(setMessages([]));
                setTotalCount(0);
            } finally {
                dispatch(setMessagesLoading(false));
            }
        };

        fetchMessages();

        return () => {
            mounted = false;
        };
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleMarkRead = async (ids) => {
        const normalizedIds = normalizeMessageIds(ids);
        if (normalizedIds.length === 0) return;

        dispatch(setMessagesError(""));

        try {
            await contactApi.markAllRead(normalizedIds);
            normalizedIds.forEach((id) => dispatch(markMessageAsRead(id)));
        } catch (err) {
            dispatch(setMessagesError(err?.message || "Failed to update read status."));
        }
    };

    const handleToggleRead = async (ids) => {
        const normalizedIds = normalizeMessageIds(ids);
        if (normalizedIds.length === 0) return;

        dispatch(setMessagesError(""));

        try {
            await contactApi.toggleReadStatus(normalizedIds);
            normalizedIds.forEach((id) => dispatch(toggleMessageReadStatus(id)));
        } catch (err) {
            dispatch(setMessagesError(err?.message || "Failed to toggle read status."));
        }
    };

    const handleDelete = async (ids) => {
        const normalizedIds = normalizeMessageIds(ids);
        if (normalizedIds.length === 0) return;

        dispatch(setMessagesError(""));

        try {
            await contactApi.deleteMessages(normalizedIds);
            normalizedIds.forEach((id) => dispatch(deleteMessageById(id)));
            setTotalCount((prev) => Math.max(prev - normalizedIds.length, 0));
        } catch (err) {
            dispatch(setMessagesError(err?.message || "Failed to delete message."));
        }
    };

    const handleMarkAllRead = async (ids) => {
        const fallbackIds = messages.map((message) => message.id);
        const normalizedIds = normalizeMessageIds(ids?.length ? ids : fallbackIds);
        if (normalizedIds.length === 0) return;

        dispatch(setMessagesError(""));

        try {
            await contactApi.markAllRead(normalizedIds);
            normalizedIds.forEach((id) => dispatch(markMessageAsRead(id)));
        } catch (err) {
            dispatch(setMessagesError(err?.message || "Failed to mark messages as read."));
        }
    };

    const handlePageChange = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
        setCurrentPage(nextPage);
    };

    return (
        <InboxList
            messages={messages}
            loading={loading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onMarkRead={handleMarkRead}
            onToggleRead={handleToggleRead}
            onDelete={handleDelete}
            onMarkAllRead={handleMarkAllRead}
            pageSize={PAGE_SIZE}
        />
    );
}