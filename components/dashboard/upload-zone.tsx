"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  transactionCount?: number
}

export function UploadZone() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }, [])

  const handleFiles = async (fileList: File[]) => {
    for (const file of fileList) {
      const fileId = Math.random().toString(36).substr(2, 9)

      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      }

      setFiles((prev) => [...prev, newFile])

      // Upload and process file
      await uploadFile(file, fileId)
    }
  }

  const uploadFile = async (file: File, fileId: string) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f)))

      // Upload to API
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "completed",
                transactionCount: result.transactions?.length || 0,
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)))
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Upload Your Documents</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Drag and drop your bank statements, IRP5s, or receipts here
          </p>
          <p className="mb-6 text-xs text-muted-foreground">Supports: PDF, CSV, OFX, JPG, PNG (Max 10MB)</p>
          <label htmlFor="file-upload">
            <Button asChild>
              <span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.csv,.ofx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileInput}
                />
                Choose Files
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Uploaded Files</h3>
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-muted p-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {file.status === "uploading" && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="h-2" />
                        <p className="mt-1 text-xs text-muted-foreground">Uploading... {file.progress}%</p>
                      </div>
                    )}

                    {file.status === "processing" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Processing and categorizing transactions...
                      </div>
                    )}

                    {file.status === "completed" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed - {file.transactionCount} transactions processed
                      </div>
                    )}

                    {file.status === "error" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Upload failed
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
