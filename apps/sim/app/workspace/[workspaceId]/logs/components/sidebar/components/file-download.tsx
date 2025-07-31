'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createLogger } from '@/lib/logs/console/logger'

const logger = createLogger('FileDownload')

interface FileDownloadProps {
  file: {
    id?: string
    name: string
    size: number
    type: string
    key: string
    directUrl?: string
  }
  className?: string
}

export function FileDownload({ file, className }: FileDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      logger.info(`Initiating download for file: ${file.name}`)

      // Generate a fresh download URL
      const response = await fetch('/api/files/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: file.key,
          name: file.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(errorData.error || `Failed to generate download URL: ${response.status}`)
      }

      const { downloadUrl, fileName } = await response.json()

      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      logger.info(`Download initiated for file: ${fileName}`)
    } catch (error) {
      logger.error(`Failed to download file ${file.name}:`, error)
      // You could show a toast notification here
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      className={`h-7 px-2 text-xs ${className}`}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className='h-3 w-3 animate-spin' />
      ) : (
        <Download className='h-3 w-3' />
      )}
      {isDownloading ? 'Downloading...' : 'Download'}
    </Button>
  )
}
