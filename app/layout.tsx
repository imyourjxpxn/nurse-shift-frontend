import { Bai_Jamjuree  } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { WardProvider } from "@/lib/ward-context"
import "./globals.css"

const baiJamjuree = Bai_Jamjuree ({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
     <html lang="th" className={baiJamjuree.variable}>
      <body className="antialiased font-sans">
        <AuthProvider>
          <WardProvider>
            {children}
          </WardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}