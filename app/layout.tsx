import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'A comprehensive task management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

