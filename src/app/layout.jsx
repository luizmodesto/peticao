import './globals.css';
import SecurityWrapper from '@/components/SecurityWrapper';

export const metadata = {
  title: 'Petição Nacional - Urna Eletrônica Oficial',
  description: 'Sistema interativo de petição pública com validação de título de eleitor e simulação realista de Urna Eletrônica.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <SecurityWrapper>
          {children}
        </SecurityWrapper>
      </body>
    </html>
  );
}
