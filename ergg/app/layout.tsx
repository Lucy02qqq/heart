import './globals.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ER Analysis',
  description: 'Daydreaming in ROKA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-row xl:w-[1400px] md:w-full h-20 bg-stone-100 gap-2">
          <Link href="/rsc" className="flex justify-center items-center w-32 h-20">
            <Image className="transition duration-150 ease-in-out hover:opacity-50" src="/home.svg" alt="home" width={30} height={30} />
          </Link>
          <div className="flex justify-center items-center w-32 h-20">
            <Link href="/" className="text-xl px-4 py-2 transition duration-150 ease-in-out hover:text-rose-400">Nowhere</Link>
          </div>
          <div className="flex justify-center items-center w-32 h-20">
            <Link href="/page2" className="text-xl px-4 py-2 transition duration-150 ease-in-out hover:text-rose-400">PAGE 2</Link>
          </div>
          <div className="flex justify-center items-center w-32 h-20">
            <Link href="/test" className="text-xl px-4 py-2 transition duration-150 ease-in-out hover:text-rose-400">TEST</Link>
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
