"use client";

import React, { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownContent } from "./markdown-content";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Eye,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder = "Write details with Markdown...",
  rows = 6,
  label,
  description,
  required = false,
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = "", placeholderText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = selectedText || placeholderText;

    const updated =
      value.substring(0, start) +
      prefix +
      replacement +
      suffix +
      value.substring(end);

    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + replacement.length;
      textarea.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 0);
  };

  const handleLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the current line
    const beforeCursor = value.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf("\n") + 1;
    const lineContent = value.substring(lineStart, end);

    const updated =
      value.substring(0, lineStart) +
      prefix +
      lineContent +
      value.substring(end);

    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <div>
            <Label htmlFor={id} className="text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b pb-2 mb-2 gap-2 flex-wrap">
          <TabsList className="h-8">
            <TabsTrigger value="write" className="text-xs px-2.5 py-1 flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs px-2.5 py-1 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </TabsTrigger>
          </TabsList>

          {activeTab === "write" && (
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Heading 1 (# Heading)"
                onClick={() => handleLinePrefix("# ")}
              >
                <Heading1 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Heading 2 (## Heading)"
                onClick={() => handleLinePrefix("## ")}
              >
                <Heading2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Heading 3 (### Heading)"
                onClick={() => handleLinePrefix("### ")}
              >
                <Heading3 className="h-3.5 w-3.5" />
              </Button>
              <span className="h-4 w-px bg-border mx-0.5" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Bold (**text**)"
                onClick={() => insertFormatting("**", "**", "bold text")}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Italic (*text*)"
                onClick={() => insertFormatting("*", "*", "italic text")}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <span className="h-4 w-px bg-border mx-0.5" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Bullet List (- item)"
                onClick={() => handleLinePrefix("- ")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Numbered List (1. item)"
                onClick={() => handleLinePrefix("1. ")}
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Quote (> quote)"
                onClick={() => handleLinePrefix("> ")}
              >
                <Quote className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Code (`code`)"
                onClick={() => insertFormatting("`", "`", "code")}
              >
                <Code className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Link ([title](url))"
                onClick={() => insertFormatting("[", "](https://example.com)", "link title")}
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="write" className="mt-0">
          <Textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className="font-mono text-sm leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1.5 px-0.5">
            <span>Supports Markdown: # Heading, - Bullet point, **Bold**, *Italic*, [Link](url)</span>
            <span>{value ? `${value.length} chars` : "0 chars"}</span>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div
            className="rounded-md border bg-muted/20 p-4 min-h-[140px] overflow-y-auto"
            style={{ minHeight: `${Math.max(rows * 24, 120)}px` }}
          >
            {value && value.trim() ? (
              <MarkdownContent content={value} />
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-6">
                Nothing to preview yet. Switch to "Write" to add details with Markdown.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
