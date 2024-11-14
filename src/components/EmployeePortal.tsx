import React, { useState } from 'react'
import { FileUploader } from './employee/FileUploader'
import { TaskManager } from './employee/TaskManager'
import { Tabs, TabList, Tab, TabPanel } from './employee/Tabs'
import { FileList } from './employee/FileList'
import { FileText, Image, CheckSquare, Folder } from 'lucide-react'

export function EmployeePortal() {
  const [activeTab, setActiveTab] = useState('files')

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='bg-white shadow-sm rounded-lg'>
        <Tabs selectedTab={activeTab} onChange={setActiveTab}>
          <div className='border-b border-gray-200'>
            <TabList className='flex space-x-8'>
              <Tab
                id='files'
                className='group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm'>
                <Folder className='mr-2 h-5 w-5' />
                Files & Documents
              </Tab>
              <Tab
                id='tasks'
                className='group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm'>
                <CheckSquare className='mr-2 h-5 w-5' />
                Tasks & Lists
              </Tab>
            </TabList>
          </div>

          <div className='p-6'>
            <TabPanel id='files'>
              <div className='space-y-6'>
                <FileUploader />
                <FileList />
              </div>
            </TabPanel>

            <TabPanel id='tasks'>
              <TaskManager />
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
