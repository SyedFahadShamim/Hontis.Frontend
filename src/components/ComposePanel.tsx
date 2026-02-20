import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Paperclip, Minimize2, Maximize2, Trash2, ChevronDown } from 'lucide-react';
import { emailApi } from '../lib/api';
import type { EmailMessageDetailDto, DraftDetailDto } from '../types';

type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward';

interface ComposePanelProps {
  mode: ComposeMode;
  replyToMessage?: EmailMessageDetailDto | null;
  draftData?: DraftDetailDto | null;
  folder?: string;
  onSent: () => void;
  onClose: () => void;
}

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ label, tags, onChange, placeholder }: TagInputProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === 'Tab') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex items-start border-b border-gray-100">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-10 shrink-0 mt-0.5">
        {label}
      </span>
      <div
        className="flex-1 flex flex-wrap gap-1 px-2 py-2 cursor-text min-h-[36px]"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              className="hover:text-blue-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input); }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent py-0.5"
        />
      </div>
    </div>
  );
};

export const ComposePanel = ({
  mode,
  replyToMessage,
  draftData,
  folder,
  onSent,
  onClose,
}: ComposePanelProps) => {
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasContent = to.length > 0 || subject !== '' || body !== '';

  const buildQuote = (msg: EmailMessageDetailDto): string => {
    const date = new Date(msg.date).toLocaleString([], {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const from = msg.fromName ? `${msg.fromName} &lt;${msg.fromEmail}&gt;` : msg.fromEmail;
    const content = msg.bodyHtml ?? msg.bodyText?.replace(/\n/g, '<br/>') ?? '';
    return `<br/><br/><div style="border-left:3px solid #d1d5db;padding:0 12px;color:#6b7280;margin-top:8px">
      <p style="margin:0 0 8px 0;font-size:13px;color:#374151">On ${date}, <strong>${from}</strong> wrote:</p>
      ${content}
    </div>`;
  };

  useEffect(() => {
    if (draftData) {
      const toList = draftData.toRecipients
        ? draftData.toRecipients.split(/[;,]/).map((s) => s.trim()).filter(Boolean)
        : [];
      const ccList = draftData.ccRecipients
        ? draftData.ccRecipients.split(/[;,]/).map((s) => s.trim()).filter(Boolean)
        : [];
      const bccList = draftData.bccRecipients
        ? draftData.bccRecipients.split(/[;,]/).map((s) => s.trim()).filter(Boolean)
        : [];
      setTo(toList);
      setCc(ccList);
      setBcc(bccList);
      setShowCc(ccList.length > 0);
      setShowBcc(bccList.length > 0);
      setSubject(draftData.subject);
      setBody(draftData.bodyHtml ?? '');
      setDraftId(draftData.emailDraftId);
      return;
    }

    if (!replyToMessage) return;

    if (mode === 'reply') {
      setTo([replyToMessage.fromEmail]);
      setSubject(
        replyToMessage.subject.toLowerCase().startsWith('re:')
          ? replyToMessage.subject
          : `Re: ${replyToMessage.subject}`
      );
      setBody(buildQuote(replyToMessage));
    } else if (mode === 'replyAll') {
      const allTo = [replyToMessage.fromEmail, ...replyToMessage.toAddresses]
        .filter((a) => a !== replyToMessage.fromEmail || replyToMessage.toAddresses.length === 0);
      setTo([...new Set(allTo)]);
      const allCc = replyToMessage.ccAddresses;
      if (allCc.length > 0) { setCc(allCc); setShowCc(true); }
      setSubject(
        replyToMessage.subject.toLowerCase().startsWith('re:')
          ? replyToMessage.subject
          : `Re: ${replyToMessage.subject}`
      );
      setBody(buildQuote(replyToMessage));
    } else if (mode === 'forward') {
      setSubject(
        replyToMessage.subject.toLowerCase().startsWith('fwd:')
          ? replyToMessage.subject
          : `Fwd: ${replyToMessage.subject}`
      );
      const fwdHeader = `<br/><br/><hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0"/>
        <p style="font-size:13px;color:#374151;margin:0 0 8px 0"><strong>---------- Forwarded message ----------</strong><br/>
        From: ${replyToMessage.fromName ? `${replyToMessage.fromName} &lt;${replyToMessage.fromEmail}&gt;` : replyToMessage.fromEmail}<br/>
        Date: ${new Date(replyToMessage.date).toLocaleString()}<br/>
        Subject: ${replyToMessage.subject}</p>
        ${replyToMessage.bodyHtml ?? replyToMessage.bodyText?.replace(/\n/g, '<br/>') ?? ''}`;
      setBody(fwdHeader);
    }
  }, [mode, replyToMessage, draftData]);

  const autoSave = useCallback(async () => {
    if (!hasContent) return;
    try {
      const data = {
        toRecipients: to.join('; '),
        ccRecipients: cc.join('; ') || undefined,
        bccRecipients: bcc.join('; ') || undefined,
        subject,
        bodyHtml: body || undefined,
        inReplyToMessageId: replyToMessage?.messageId ?? undefined,
      };

      if (draftId) {
        await emailApi.updateDraft(draftId, data);
      } else {
        const saved = await emailApi.saveDraft(data);
        setDraftId(saved.emailDraftId);
      }
      setLastSaved(new Date());
    } catch {
      // silent fail for autosave
    }
  }, [to, cc, bcc, subject, body, draftId, hasContent, replyToMessage]);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(autoSave, 30000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [autoSave]);

  const handleSend = async () => {
    if (to.length === 0) {
      setSendError('Please add at least one recipient.');
      return;
    }
    setIsSending(true);
    setSendError(null);
    try {
      if (mode === 'reply' && replyToMessage && folder) {
        await emailApi.reply(folder, replyToMessage.uniqueId, {
          additionalTo: [],
          cc,
          bodyHtml: body,
          replyAll: false,
        });
      } else if (mode === 'replyAll' && replyToMessage && folder) {
        await emailApi.reply(folder, replyToMessage.uniqueId, {
          additionalTo: to,
          cc,
          bodyHtml: body,
          replyAll: true,
        });
      } else if (mode === 'forward' && replyToMessage && folder) {
        await emailApi.forward(folder, replyToMessage.uniqueId, {
          to,
          cc,
          bodyHtml: body,
        });
      } else {
        await emailApi.send({ to, cc, bcc, subject, bodyHtml: body });
      }

      if (draftId) {
        await emailApi.deleteDraft(draftId).catch(() => {});
      }

      onSent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send email.';
      setSendError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = async () => {
    if (draftId) {
      await emailApi.deleteDraft(draftId).catch(() => {});
    }
    onClose();
  };

  const handleCloseRequest = () => {
    if (hasContent && !draftId) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  const titleLabel = {
    new: 'New Message',
    reply: 'Reply',
    replyAll: 'Reply All',
    forward: 'Forward',
  }[mode];

  return (
    <div
      className={`fixed bottom-0 right-8 z-50 bg-white rounded-t-xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-200 ${
        isMinimized ? 'h-12 w-96' : 'w-[600px] h-[560px]'
      }`}
    >
      <div
        className="flex items-center justify-between px-4 h-12 bg-gray-800 rounded-t-xl cursor-pointer select-none shrink-0"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{titleLabel}</span>
          {lastSaved && !isMinimized && (
            <span className="text-gray-400 text-xs">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1 text-gray-300 hover:text-white rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCloseRequest(); }}
            className="p-1 text-gray-300 hover:text-white rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="border-b border-gray-100">
            <TagInput label="To" tags={to} onChange={setTo} placeholder="recipient@example.com" />

            {showCc ? (
              <TagInput label="Cc" tags={cc} onChange={setCc} placeholder="cc@example.com" />
            ) : null}

            {showBcc ? (
              <TagInput label="Bcc" tags={bcc} onChange={setBcc} placeholder="bcc@example.com" />
            ) : null}

            {(!showCc || !showBcc) && (
              <div className="flex px-4 py-1 gap-3">
                {!showCc && (
                  <button
                    onClick={() => setShowCc(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ChevronDown className="w-3 h-3" /> Add Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    onClick={() => setShowBcc(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ChevronDown className="w-3 h-3" /> Add Bcc
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-16 shrink-0">
                Subject
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="flex-1 px-2 py-2.5 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your message..."
            className="flex-1 p-4 text-sm text-gray-800 outline-none resize-none leading-relaxed"
          />

          {sendError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-xs text-red-600">{sendError}</p>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={isSending || to.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={autoSave}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Save Draft
              </button>
            </div>
            <button
              onClick={() => setConfirmClose(true)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Discard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {confirmClose && (
            <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center rounded-t-xl z-10">
              <p className="text-sm font-medium text-gray-800 mb-1">Discard this message?</p>
              <p className="text-xs text-gray-500 mb-4">Your draft will not be saved.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => setConfirmClose(false)}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Keep editing
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
