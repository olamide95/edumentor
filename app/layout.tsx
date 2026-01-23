import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Edumentor - Find the Perfect Tutor for Your Child',
  description: 'Connect with qualified NYSC corps members and experienced tutors in Nigeria',
   icons: {
    icon: [
      {
        url: "/edumentor-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/edumentor-logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/edumentor-logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/edumentor-logo.png",
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}