'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaBold, FaItalic, FaHeading, FaQuoteRight, FaList, FaLink, FaImage, FaCode, FaEye, FaEyeSlash, FaUndo, FaRedo } from 'react-icons/fa';

interface MarkdownEditorProps {
    defaultValue?: string;
    name: string;
}

export default function MarkdownEditor({ defaultValue = '', name }: MarkdownEditorProps) {
    const [content, setContent] = useState(defaultValue);
    const [history, setHistory] = useState<string[]>([defaultValue]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    const [isPreview, setIsPreview] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- History Management ---

    const addToHistory = (newContent: string, immediate = true) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const updateState = () => {
            const currentHistory = history.slice(0, historyIndex + 1);
            // Avoid duplicate entries
            if (currentHistory[currentHistory.length - 1] !== newContent) {
                const nextHistory = [...currentHistory, newContent];
                setHistory(nextHistory);
                setHistoryIndex(nextHistory.length - 1);
            }
        };

        if (immediate) {
            updateState();
            setContent(newContent);
        } else {
            // Debounced update for typing
            setContent(newContent);
            debounceRef.current = setTimeout(updateState, 1000);
        }
    };

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setContent(history[newIndex]);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setContent(history[newIndex]);
        }
    }, [history, historyIndex]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement !== textareaRef.current) return;

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);


    // --- Editor Actions ---

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
        
        addToHistory(newText, true);
        
        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                const imgTag = `\n![${file.name}](${data.url})\n`;
                // Append to cursor or end? Let's use insertText logic but we need access to ref
                const textarea = textareaRef.current;
                if (textarea) {
                    insertText(`\n![${file.name}](${data.url})\n`);
                } else {
                    addToHistory(content + imgTag, true);
                }
            } else {
                alert('Upload failed');
            }
        } catch (e) {
            console.error(e);
            alert('Upload error');
        } finally {
            setIsUploading(false);
        }
    };

    const onPaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) handleUpload(file);
            }
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleUpload(files[0]);
        }
    };

    const onImageBtnClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        if (e.target) e.target.value = '';
    };

    return (
        <div className={`border rounded-lg overflow-hidden bg-white dark:bg-[#111] dark:border-white/10 ${isDragging ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20' : 'border-stone-200'}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 overflow-x-auto">
                <ToolbarBtn icon={<FaUndo />} onClick={undo} title="Undo (Ctrl+Z)" disabled={historyIndex <= 0} />
                <ToolbarBtn icon={<FaRedo />} onClick={redo} title="Redo (Ctrl+Y)" disabled={historyIndex >= history.length - 1} />
                <div className="w-px h-4 bg-stone-300 dark:bg-white/10 mx-1" />
                
                <ToolbarBtn icon={<FaBold />} onClick={() => insertText('**', '**')} title="Bold" />
                <ToolbarBtn icon={<FaItalic />} onClick={() => insertText('*', '*')} title="Italic" />
                <ToolbarBtn icon={<FaHeading />} onClick={() => insertText('## ')} title="Heading" />
                <div className="w-px h-4 bg-stone-300 dark:bg-white/10 mx-1" />
                <ToolbarBtn icon={<FaList />} onClick={() => insertText('- ')} title="List" />
                <ToolbarBtn icon={<FaQuoteRight />} onClick={() => insertText('> ')} title="Quote" />
                <ToolbarBtn icon={<FaCode />} onClick={() => insertText('```\n', '\n```')} title="Code Block" />
                <div className="w-px h-4 bg-stone-300 dark:bg-white/10 mx-1" />
                <ToolbarBtn icon={<FaLink />} onClick={() => insertText('[', '](url)')} title="Link" />
                <ToolbarBtn icon={<FaImage />} onClick={onImageBtnClick} title="Upload Image" />
                <div className="flex-1" />
                <button 
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        isPreview 
                        ? 'bg-[var(--accent)] text-white' 
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-white/10'
                    }`}
                >
                    {isPreview ? <><FaEyeSlash /> Edit</> : <><FaEye /> Preview</>}
                </button>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={onFileChange}
            />

            {/* Editor Area */}
            <div 
                className="relative min-h-[500px]"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
            >
                {isUploading && (
                     <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-20 flex items-center justify-center backdrop-blur-sm">
                        <div className="text-[var(--accent)] font-bold animate-pulse">Uploading Image...</div>
                     </div>
                )}

                {isPreview ? (
                    <div className="prose prose-stone dark:prose-invert max-w-none p-4 min-h-[500px] overflow-y-auto">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        name={name}
                        value={content}
                        onChange={(e) => addToHistory(e.target.value, false)}
                        onPaste={onPaste}
                        className="w-full h-[500px] p-4 bg-transparent resize-y focus:outline-none font-mono text-sm leading-relaxed"
                        placeholder="Write something amazing... (Drag & Drop images here)"
                    />
                )}
                
                {isDragging && (
                    <div className="absolute inset-0 bg-[var(--accent)]/10 z-10 flex items-center justify-center border-2 border-dashed border-[var(--accent)] m-2 rounded">
                        <span className="text-[var(--accent)] font-bold">Drop image to upload</span>
                    </div>
                )}
            </div>
            
            <div className="px-4 py-2 bg-stone-50 dark:bg-white/5 border-t border-stone-200 dark:border-white/10 text-xs text-stone-400 flex justify-between">
                <span>Markdown Supported</span>
                <span>{content.length} chars</span>
            </div>
        </div>
    );
}

function ToolbarBtn({ icon, onClick, title, disabled = false }: { icon: React.ReactNode, onClick: () => void, title: string, disabled?: boolean }) {
    return (
        <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={`p-2 rounded transition-colors ${
                disabled 
                ? 'text-stone-300 dark:text-stone-700 cursor-not-allowed' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-white/10'
            }`}
        >
            {icon}
        </button>
    )
}