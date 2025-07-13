import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  name: string
  size: number
  status: 'uploading' | 'success' | 'error'
  progress: number
}

export function ExcelUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  // In a real app, this would check user permissions
  const isAdmin = true

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFiles = (fileList: File[]) => {
    const excelFiles = fileList.filter(file => 
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    )

    if (excelFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload Excel files only (.xlsx, .xls)",
        variant: "destructive"
      })
      return
    }

    const newFiles: UploadedFile[] = excelFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Simulate upload process
    newFiles.forEach((file, index) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.name === file.name) {
            const newProgress = Math.min(f.progress + 10, 100)
            return {
              ...f,
              progress: newProgress,
              status: newProgress === 100 ? (Math.random() > 0.8 ? 'error' : 'success') : 'uploading'
            }
          }
          return f
        }))
      }, 200)

      setTimeout(() => clearInterval(interval), 2000)
    })

    toast({
      title: "Upload started",
      description: `Uploading ${excelFiles.length} file(s)...`
    })
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isAdmin) {
    return null // Hide component for non-admin users
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Excel
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Inventory Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Drop Excel files here or click to browse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .xlsx and .xls files up to 10MB
                </p>
                
                <input
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFiles(Array.from(e.target.files))
                    }
                  }}
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Browse Files
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <File className="h-8 w-8 text-primary flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{file.name}</span>
                        <Badge variant={
                          file.status === 'success' ? 'default' :
                          file.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {file.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        {file.status === 'uploading' && (
                          <span>• {file.progress}%</span>
                        )}
                      </div>

                      {file.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {file.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFile(file.name)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upload Summary */}
          {files.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {files.filter(f => f.status === 'success').length} of {files.length} files uploaded successfully
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90"
                disabled={files.some(f => f.status === 'uploading')}
              >
                Process Data
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}