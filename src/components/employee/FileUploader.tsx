import React, { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { FileConverter } from './FileConverter'

interface UploadedFile extends File {
  id: string
  preview?: string
}

export function FileUploader() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const processedFiles: UploadedFile[] = newFiles.map((file) => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined,
    }))

    setFiles((prev) => [...prev, ...processedFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== id)
      const removedFile = prev.find((file) => file.id === id)
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview)
      }
      return updatedFiles
    })
  }

  const handleConversionComplete = (convertedFile: File) => {
    const processedFile: UploadedFile = {
      ...convertedFile,
      id: Math.random().toString(36).substr(2, 9),
      preview: convertedFile.type.startsWith('image/')
        ? URL.createObjectURL(convertedFile)
        : undefined,
    }

    setFiles((prev) => [...prev, processedFile])
    setSelectedFile(null)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type='file'
        multiple
        accept='image/*,.pdf'
        onChange={handleChange}
        className='hidden'
      />

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}>
        <div className='text-center'>
          <Upload className='mx-auto h-12 w-12 text-gray-400' />
          <div className='mt-2'>
            <button
              type='button'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              onClick={() => inputRef.current?.click()}>
              Select files
            </button>
          </div>
          <p className='mt-2 text-sm text-gray-500'>
            or drag and drop files here
          </p>
          <p className='text-xs text-gray-500'>
            Supported formats: Images (JPG, PNG, GIF) and PDF
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {files.map((file) => (
            <div
              key={file.id}
              className='relative group bg-white p-4 border rounded-lg hover:shadow-md transition-shadow'>
              <div className='aspect-w-16 aspect-h-9 mb-2'>
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className='object-cover rounded'
                  />
                ) : (
                  <div className='flex items-center justify-center bg-gray-100 rounded'>
                    <Upload className='h-8 w-8 text-gray-400' />
                  </div>
                )}
              </div>
              <div className='flex justify-between items-center'>
                <div className='truncate'>
                  <p className='text-sm font-medium text-gray-900'>
                    {file.name}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => setSelectedFile(file)}
                    className='text-blue-600 hover:text-blue-800'>
                    Convert
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className='text-red-600 hover:text-red-800'>
                    <X className='h-5 w-5' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <FileConverter
          file={selectedFile}
          onConversionComplete={handleConversionComplete}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}
