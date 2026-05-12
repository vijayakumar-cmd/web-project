"use client";

import { useState } from "react";
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  FilePlus,
  FolderPlus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFileId: string | null;
  onCreateFile: (parentId: string | null, name: string, type: "file" | "folder") => void;
  onDeleteFile: (id: string) => void;
}

function FileTreeItem({
  node,
  level,
  onSelect,
  selectedId,
  onDelete,
}: {
  node: FileNode;
  level: number;
  onSelect: (node: FileNode) => void;
  selectedId: string | null;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const [showActions, setShowActions] = useState(false);

  const isSelected = node.id === selectedId;
  const isFolder = node.type === "folder";

  const getFileIcon = (name: string) => {
    if (name.endsWith(".py")) return "text-chart-4";
    if (name.endsWith(".m")) return "text-chart-2";
    if (name.endsWith(".json")) return "text-chart-3";
    if (name.endsWith(".txt")) return "text-muted-foreground";
    return "text-primary";
  };

  return (
    <div>
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm hover:bg-secondary",
          isSelected && "bg-secondary text-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            setIsOpen(!isOpen);
          } else {
            onSelect(node);
          }
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 text-chart-2" />
            ) : (
              <Folder className="h-4 w-4 text-chart-2" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className={cn("h-4 w-4", getFileIcon(node.name))} />
          </>
        )}
        <span className="flex-1 truncate text-foreground">{node.name}</span>
        {showActions && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({
  files,
  onFileSelect,
  selectedFileId,
  onCreateFile,
  onDeleteFile,
}: FileExplorerProps) {
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<"file" | "folder">("file");

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(null, newFileName.trim(), newFileType);
      setNewFileName("");
      setShowNewFileInput(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium text-foreground">Explorer</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setNewFileType("file");
              setShowNewFileInput(true);
            }}
          >
            <FilePlus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setNewFileType("folder");
              setShowNewFileInput(true);
            }}
          >
            <FolderPlus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {showNewFileInput && (
          <div className="mb-2 flex items-center gap-2 px-3">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile();
                if (e.key === "Escape") setShowNewFileInput(false);
              }}
              placeholder={newFileType === "file" ? "filename.py" : "folder name"}
              className="flex-1 rounded border border-border bg-input px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
            <Button size="icon" className="h-6 w-6" onClick={handleCreateFile}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        {files.map((file) => (
          <FileTreeItem
            key={file.id}
            node={file}
            level={0}
            onSelect={onFileSelect}
            selectedId={selectedFileId}
            onDelete={onDeleteFile}
          />
        ))}
      </div>
    </div>
  );
}
