import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Send,
  FileEdit,
  Trash2,
  RefreshCw,
  Search,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  Trash,
  MoveRight,
  MailOpen,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Plus,
  Filter,
} from 'lucide-react';
import { emailApi } from '../lib/api';
import type {
  EmailFolderDto,
  EmailMessageSummaryDto,
  EmailMessageDetailDto,
  DraftListDto,
  DraftDetailDto,
} from '../types';
import { ComposePanel } from '../components/ComposePanel';

const FOLDER_ICONS: Record<string, React.ElementType> = {
  INBOX: Inbox,
  Inbox: Inbox,
  Sent: Send,
  Drafts: FileEdit,
  Trash: Trash2,
};

const getFolderIcon = (name: string) => {
  return FOLDER_ICONS[name] ?? Mail;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
};

type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward' | null;

export const EmailPage = () => {
  const { folder = 'INBOX', messageId } = useParams<{ folder: string; messageId?: string }>();
  const navigate = useNavigate();

  const isDraftsView = folder === 'drafts';

  const [folders, setFolders] = useState<EmailFolderDto[]>([]);
  const [messages, setMessages] = useState<EmailMessageSummaryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessageDetailDto | null>(null);
  const [drafts, setDrafts] = useState<DraftListDto[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftDetailDto | null>(null);

  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [composeMode, setComposeMode] = useState<ComposeMode>(null);
  const [replyToMessage, setReplyToMessage] = useState<EmailMessageDetailDto | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageSize = 25;

  const loadFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const data = await emailApi.getFolders();
      setFolders(data);
    } catch {
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (isDraftsView) return;
    setLoadingMessages(true);
    try {
      const result = await emailApi.getMessages({
        folder,
        page: currentPage,
        pageSize,
        search: debouncedSearch || undefined,
        unreadOnly: filterUnread || undefined,
      });
      setMessages(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [folder, currentPage, debouncedSearch, filterUnread, isDraftsView]);

  const loadDrafts = useCallback(async () => {
    if (!isDraftsView) return;
    setLoadingMessages(true);
    try {
      const data = await emailApi.getDrafts();
      setDrafts(data);
    } catch {
      setDrafts([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [isDraftsView]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedMessage(null);
    setSelectedDraft(null);
  }, [folder]);

  useEffect(() => {
    if (isDraftsView) {
      loadDrafts();
    } else {
      loadMessages();
    }
  }, [loadMessages, loadDrafts, isDraftsView]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  useEffect(() => {
    if (messageId && !isDraftsView) {
      setLoadingDetail(true);
      emailApi
        .getMessage(folder, messageId)
        .then((msg) => {
          setSelectedMessage(msg);
          setMessages((prev) =>
            prev.map((m) => (m.uniqueId === messageId ? { ...m, isRead: true } : m))
          );
        })
        .catch(() => setSelectedMessage(null))
        .finally(() => setLoadingDetail(false));
    }
  }, [messageId, folder, isDraftsView]);

  const handleSelectMessage = (msg: EmailMessageSummaryDto) => {
    navigate(`/email/${encodeURIComponent(folder)}/${msg.uniqueId}`);
  };

  const handleSelectDraft = async (draft: DraftListDto) => {
    try {
      const detail = await emailApi.getDraft(draft.emailDraftId);
      setSelectedDraft(detail);
      setComposeMode('new');
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    try {
      await emailApi.deleteMessage(folder, selectedMessage.uniqueId);
      setSelectedMessage(null);
      navigate(`/email/${encodeURIComponent(folder)}`);
      loadMessages();
    } catch {
      // ignore
    }
  };

  const handleMarkUnread = async () => {
    if (!selectedMessage) return;
    try {
      await emailApi.markRead(folder, selectedMessage.uniqueId, false);
      setSelectedMessage((prev) => prev ? { ...prev, isRead: false } : null);
      setMessages((prev) =>
        prev.map((m) => (m.uniqueId === selectedMessage.uniqueId ? { ...m, isRead: false } : m))
      );
    } catch {
      // ignore
    }
  };

  const handleRefresh = () => {
    loadFolders();
    if (isDraftsView) {
      loadDrafts();
    } else {
      loadMessages();
    }
  };

  const handleComposeSend = () => {
    setComposeMode(null);
    setReplyToMessage(null);
    setSelectedDraft(null);
    loadMessages();
    loadFolders();
  };

  const handleComposeClose = () => {
    setComposeMode(null);
    setReplyToMessage(null);
    setSelectedDraft(null);
  };

  const currentFolderInfo = folders.find(
    (f) => f.fullName === folder || f.name === folder
  );

  return (
    <div className="h-full flex flex-col -m-6">
      <div className="flex flex-1 overflow-hidden h-full">
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => setComposeMode('new')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Compose
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-0.5">
            {loadingFolders ? (
              <div className="space-y-1 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : folders.length > 0 ? (
              folders.map((f) => {
                const Icon = getFolderIcon(f.name);
                const isActive = f.fullName === folder || f.name === folder;
                return (
                  <button
                    key={f.fullName}
                    onClick={() => navigate(`/email/${encodeURIComponent(f.fullName)}`)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    {f.unreadCount > 0 && (
                      <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 font-medium shrink-0">
                        {f.unreadCount > 99 ? '99+' : f.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <>
                {(['INBOX', 'Sent', 'drafts', 'Trash'] as const).map((name) => {
                  const Icon = getFolderIcon(name);
                  const isActive = folder === name;
                  return (
                    <button
                      key={name}
                      onClick={() => navigate(`/email/${name}`)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{name === 'drafts' ? 'Drafts' : name}</span>
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        </aside>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
            <div className="p-3 border-b border-gray-100 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`p-1.5 rounded-lg transition-colors ${filterUnread ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  {showFilterMenu && (
                    <div className="absolute right-0 top-8 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                      <button
                        onClick={() => { setFilterUnread(false); setShowFilterMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm ${!filterUnread ? 'text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        All messages
                      </button>
                      <button
                        onClick={() => { setFilterUnread(true); setShowFilterMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm ${filterUnread ? 'text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        Unread only
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  {isDraftsView ? 'Drafts' : currentFolderInfo?.name ?? folder}
                  {!isDraftsView && totalCount > 0 && (
                    <span className="ml-1 text-gray-400 font-normal">({totalCount})</span>
                  )}
                </h2>
                {!isDraftsView && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-500">{currentPage}/{totalPages}</span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingMessages ? (
                <div className="p-3 space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border border-gray-100 space-y-1.5 animate-pulse">
                      <div className="flex justify-between">
                        <div className="h-3.5 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-100 rounded w-12" />
                      </div>
                      <div className="h-3.5 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : isDraftsView ? (
                drafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <FileEdit className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm">No drafts</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {drafts.map((draft) => (
                      <button
                        key={draft.emailDraftId}
                        onClick={() => handleSelectDraft(draft)}
                        className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-sm font-medium text-gray-900 truncate pr-2">
                            {draft.toRecipients || '(No recipients)'}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatDate(draft.updatedOn ?? draft.createdOn)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {draft.subject || '(No subject)'}
                        </p>
                      </button>
                    ))}
                  </div>
                )
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <Inbox className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No messages</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {messages.map((msg) => {
                    const isSelected = msg.uniqueId === messageId;
                    return (
                      <button
                        key={msg.uniqueId}
                        onClick={() => handleSelectMessage(msg)}
                        className={`w-full text-left p-3 transition-colors ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <span
                            className={`text-sm truncate pr-2 ${
                              !msg.isRead ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'
                            }`}
                          >
                            {msg.fromName || msg.fromEmail}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {msg.hasAttachment && (
                              <Paperclip className="w-3 h-3 text-gray-400" />
                            )}
                            <span className="text-xs text-gray-400">{formatDate(msg.date)}</span>
                            {!msg.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-sm truncate mb-0.5 ${
                            !msg.isRead ? 'font-medium text-gray-800' : 'text-gray-600'
                          }`}
                        >
                          {msg.subject || '(No Subject)'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{msg.previewText}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white overflow-hidden flex flex-col">
            {loadingDetail ? (
              <div className="flex-1 p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-px bg-gray-200 my-4" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-3.5 bg-gray-100 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
                  ))}
                </div>
              </div>
            ) : selectedMessage ? (
              <MessageDetail
                message={selectedMessage}
                onReply={() => { setReplyToMessage(selectedMessage); setComposeMode('reply'); }}
                onReplyAll={() => { setReplyToMessage(selectedMessage); setComposeMode('replyAll'); }}
                onForward={() => { setReplyToMessage(selectedMessage); setComposeMode('forward'); }}
                onDelete={handleDelete}
                onMarkUnread={handleMarkUnread}
                folder={folder}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Mail className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-gray-300">Select a message to read</p>
                <p className="text-sm mt-1 text-gray-300">
                  {isDraftsView
                    ? 'Choose a draft to continue editing'
                    : 'Choose a message from the list'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {composeMode && (
        <ComposePanel
          mode={composeMode === 'replyAll' ? 'replyAll' : composeMode === 'reply' ? 'reply' : composeMode === 'forward' ? 'forward' : 'new'}
          replyToMessage={replyToMessage}
          draftData={selectedDraft}
          folder={folder}
          onSent={handleComposeSend}
          onClose={handleComposeClose}
        />
      )}
    </div>
  );
};

interface MessageDetailProps {
  message: EmailMessageDetailDto;
  folder: string;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
  onMarkUnread: () => void;
}

const MessageDetail = ({
  message,
  folder,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onMarkUnread,
}: MessageDetailProps) => {
  const formattedDate = new Date(message.date).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-xl font-semibold text-gray-900 leading-snug">
            {message.subject || '(No Subject)'}
          </h1>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onReply}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Reply"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button
              onClick={onReplyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Reply All"
            >
              <ReplyAll className="w-4 h-4" />
              All
            </button>
            <button
              onClick={onForward}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Forward"
            >
              <Forward className="w-4 h-4" />
              Fwd
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={onMarkUnread}
              className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
              title="Mark as unread"
            >
              <MailOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-500 w-8 shrink-0">From</span>
            <span className="text-gray-900 font-medium">
              {message.fromName ? `${message.fromName} <${message.fromEmail}>` : message.fromEmail}
            </span>
          </div>
          {message.toAddresses.length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500 w-8 shrink-0">To</span>
              <span className="text-gray-700">{message.toAddresses.join(', ')}</span>
            </div>
          )}
          {message.ccAddresses.length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500 w-8 shrink-0">Cc</span>
              <span className="text-gray-700">{message.ccAddresses.join(', ')}</span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-gray-500 w-8 shrink-0">Date</span>
            <span className="text-gray-600">{formattedDate}</span>
          </div>
        </div>
      </div>

      {message.attachments.length > 0 && (
        <div className="px-6 py-2.5 border-b border-gray-100 flex flex-wrap gap-2">
          {message.attachments.map((att, i) => (
            <a
              key={i}
              href={emailApi.getAttachmentUrl(folder, message.uniqueId, att.fileName)}
              download={att.fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              {att.fileName}
            </a>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {message.bodyHtml ? (
          <iframe
            srcDoc={message.bodyHtml}
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
            title="Email body"
          />
        ) : (
          <div className="p-6 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {message.bodyText || '(No content)'}
          </div>
        )}
      </div>
    </div>
  );
};
