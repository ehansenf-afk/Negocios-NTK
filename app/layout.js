import './globals.css'

export const metadata = {
  title: 'Mis Negocios — Portal de Gestión',
  description: 'Portal interno Casa Turquesa y Monkey D. Market',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Nunito+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
