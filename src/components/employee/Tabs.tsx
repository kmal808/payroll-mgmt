import React from 'react'

interface TabsProps {
  children: React.ReactNode
  selectedTab: string
  onChange: (tabId: string) => void
}

interface TabProps {
  id: string
  children: React.ReactNode
  className?: string
}

interface TabPanelProps {
  id: string
  children: React.ReactNode
}

export function Tabs({ children, selectedTab, onChange }: TabsProps) {
  const handleTabClick = (tabId: string) => {
    onChange(tabId)
  }

  return (
    <div className='tabs'>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            selectedTab,
            onTabClick: handleTabClick,
          })
        }
        return child
      })}
    </div>
  )
}

export function TabList({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div role='tablist' className={className}>
      {children}
    </div>
  )
}

export function Tab({ id, children, className = '' }: TabProps) {
  return (
    <button
      role='tab'
      aria-selected={true}
      className={`${className} text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300`}>
      {children}
    </button>
  )
}

export function TabPanel({ id, children }: TabPanelProps) {
  return (
    <div role='tabpanel' id={`panel-${id}`}>
      {children}
    </div>
  )
}
