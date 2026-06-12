import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata = {
  title: 'Mailvio',
  description: 'Reach recruiters, effortlessly.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}