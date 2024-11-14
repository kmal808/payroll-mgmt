import React, { useState } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { fabric } from 'fabric'
import {
  FileText,
  Image as ImageIcon,
  Download,
  Edit2,
  Check,
  X,
} from 'lucide-react'

interface FileConverterProps {
  file: File
  onConversionComplete: (convertedFile: File) => void
  onClose: () => void
}

export function FileConverter({
  file,
  onConversionComplete,
  onClose,
}: FileConverterProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)

  const initializeCanvas = async () => {
    const fabricCanvas = new fabric.Canvas('editor', {
      width: 800,
      height: 600,
    })

    const reader = new FileReader()
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target?.result as string, (img) => {
        img.scaleToWidth(800)
        fabricCanvas.add(img)
        fabricCanvas.renderAll()
      })
    }
    reader.readAsDataURL(file)

    setCanvas(fabricCanvas)
  }

  const convertToPdf = async () => {
    setIsConverting(true)
    try {
      if (file.type.startsWith('image/')) {
        const img = new Image()
        const reader = new FileReader()

        reader.onload = async () => {
          img.src = reader.result as string
          img.onload = async () => {
            const pdf = new jsPDF({
              orientation: img.width > img.height ? 'l' : 'p',
              unit: 'px',
              format: [img.width, img.height],
            })

            pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height)
            const pdfBlob = pdf.output('blob')
            const convertedFile = new File(
              [pdfBlob],
              `${file.name.split('.')[0]}.pdf`,
              {
                type: 'application/pdf',
              }
            )

            onConversionComplete(convertedFile)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const saveEditedImage = async () => {
    if (!canvas) return

    const dataUrl = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.8,
    })

    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const editedFile = new File([blob], `edited-${file.name}`, {
      type: 'image/jpeg',
    })

    onConversionComplete(editedFile)
    setIsEditing(false)
  }

  const addText = () => {
    if (!canvas) return
    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontSize: 20,
    })
    canvas.add(text)
    canvas.renderAll()
  }

  const addShape = (type: 'rect' | 'circle') => {
    if (!canvas) return

    const options = {
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: 2,
    }

    const shape =
      type === 'rect'
        ? new fabric.Rect({ ...options, width: 100, height: 100 })
        : new fabric.Circle({ ...options, radius: 50 })

    canvas.add(shape)
    canvas.renderAll()
  }

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full'>
      <div className='relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium'>File Converter</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500'>
            <X className='h-6 w-6' />
          </button>
        </div>

        {isEditing ? (
          <div className='space-y-4'>
            <div className='border rounded-lg p-4'>
              <canvas id='editor' />
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={addText}
                className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
                Add Text
              </button>
              <button
                onClick={() => addShape('rect')}
                className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
                Add Rectangle
              </button>
              <button
                onClick={() => addShape('circle')}
                className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
                Add Circle
              </button>
            </div>
            <div className='flex justify-end space-x-2'>
              <button
                onClick={() => setIsEditing(false)}
                className='px-4 py-2 border rounded text-gray-600 hover:bg-gray-50'>
                Cancel
              </button>
              <button
                onClick={saveEditedImage}
                className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'>
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center justify-center border-2 border-dashed rounded-lg p-6'>
              <div className='text-center'>
                {file.type.startsWith('image/') ? (
                  <ImageIcon className='mx-auto h-12 w-12 text-gray-400' />
                ) : (
                  <FileText className='mx-auto h-12 w-12 text-gray-400' />
                )}
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  {file.name}
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className='flex justify-center space-x-4'>
              {file.type.startsWith('image/') && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      initializeCanvas()
                    }}
                    className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                    disabled={isConverting}>
                    <Edit2 className='mr-2 h-4 w-4' />
                    Edit Image
                  </button>
                  <button
                    onClick={convertToPdf}
                    className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700'
                    disabled={isConverting}>
                    {isConverting ? (
                      'Converting...'
                    ) : (
                      <>
                        <Download className='mr-2 h-4 w-4' />
                        Convert to PDF
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
