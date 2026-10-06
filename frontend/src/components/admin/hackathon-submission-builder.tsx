"use client";

import React from "react";
import { Plus, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface SubmissionField {
  id: string;
  title: string;
  type: "textarea" | "text";
  placeholder?: string;
  required?: boolean;
}

export const DEFAULT_SUBMISSION_FIELD: SubmissionField = {
  id: "field_default",
  title: "Project Submission Details",
  type: "textarea",
  placeholder: "Enter project description, repository link, demo video, or notes...",
  required: true,
};

interface SubmissionBuilderProps {
  fields: SubmissionField[];
  onChange: (fields: SubmissionField[]) => void;
}

export function HackathonSubmissionBuilder({ fields, onChange }: SubmissionBuilderProps) {
  // Ensure there's always at least one field by default
  const activeFields = fields && fields.length > 0 ? fields : [DEFAULT_SUBMISSION_FIELD];

  const handleAddField = () => {
    const newField: SubmissionField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `Submission Item ${activeFields.length + 1}`,
      type: "text",
      placeholder: "e.g. https://github.com/...",
      required: true,
    };
    onChange([...activeFields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<SubmissionField>) => {
    const updated = activeFields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onChange(updated);
  };

  const handleRemoveField = (index: number) => {
    if (activeFields.length <= 1) {
      alert("At least one submission field is required.");
      return;
    }
    const updated = activeFields.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Card className="border-blue-200/50 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/20 via-transparent to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 font-space-grotesk text-lg text-neutral-900 dark:text-neutral-100">
              <Layers className="h-5 w-5 text-blue-500" />
              Custom Project Submission Form
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Configure the inputs students will see when submitting their project after registering.
              The default is one multiline textarea whose title you can customize. You can add multiple inputs with custom titles.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddField}
            className="flex items-center gap-1.5 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Submission Field
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeFields.map((field, idx) => (
          <div
            key={field.id}
            className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 shadow-sm space-y-3 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs font-mono">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Input Field #{idx + 1}
                </span>
              </div>
              {activeFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveField(idx)}
                  className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Field Title */}
              <div className="md:col-span-5 space-y-1">
                <Label htmlFor={`field-title-${idx}`} className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Field Title / Label *
                </Label>
                <Input
                  id={`field-title-${idx}`}
                  value={field.title}
                  onChange={(e) => handleUpdateField(idx, { title: e.target.value })}
                  placeholder="e.g. Project Description, GitHub Repo URL"
                  className="h-9 text-xs"
                  required
                />
              </div>

              {/* Input Type */}
              <div className="md:col-span-3 space-y-1">
                <Label htmlFor={`field-type-${idx}`} className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Input Format
                </Label>
                <select
                  id={`field-type-${idx}`}
                  value={field.type}
                  onChange={(e) => handleUpdateField(idx, { type: e.target.value as "textarea" | "text" })}
                  className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="textarea">Textarea (Multiline)</option>
                  <option value="text">Single-line (Text / URL)</option>
                </select>
              </div>

              {/* Placeholder */}
              <div className="md:col-span-4 space-y-1">
                <Label htmlFor={`field-ph-${idx}`} className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Placeholder / Help Text
                </Label>
                <Input
                  id={`field-ph-${idx}`}
                  value={field.placeholder || ""}
                  onChange={(e) => handleUpdateField(idx, { placeholder: e.target.value })}
                  placeholder="e.g. Provide details here..."
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Required checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={field.required !== false}
                  onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  Required field for students
                </span>
              </label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
