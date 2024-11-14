import React from 'react'
import { FileText, Download, Trash2, Edit } from 'lucide-react'

interface File {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
}

const mockFiles: File[] = [
  {
    id: '1',
    name: 'site-photos.jpg',
    type: 'image/jpeg',
    size: '2.4 MB',
    uploadedAt: '2024-02-28',
  },
  {
    id: '2',
    name: 'change-order.pdf',
    type: 'application/pdf',
    size: '156 KB',
    uploadedAt: '2024-02-28',
  },
]

export function FileList() {
  return (
    <div className='bg-white shadow-sm rounded-lg border border-gray-200'>
      <div className='px-4 py-5 sm:px-6'>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>Files</h3>
      </div>
      <div className='border-t border-gray-200'>
        <ul className='divide-y divide-gray-200'>
          {mockFiles.map((file) => (
            <li key={file.id} className='px-4 py-4 sm:px-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <FileText className='h-5 w-5 text-gray-400' />
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-gray-900'>
                      {file.name}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {file.size} • Uploaded on {file.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className='flex space-x-3'>
                  <button
                    type='button'
                    className='inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-gray-100 focus:outline-none'>
                    <Edit className='h-5 w-5' />
                  </button>
                  <button
                    type='button'
                    className='inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-gray-100 focus:outline-none'>
                    <Download className='h-5 w-5' />
                  </button>
                  <button
                    type='button'
                    className='inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-red-500 hover:bg-red-100 focus:outline-none'>
                    <Trash2 className='h-5 w-5' />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
