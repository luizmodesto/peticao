# =========================================================================
# Script para configurar variáveis de ambiente na Vercel via CLI
# =========================================================================
Write-Host "Configurando variáveis de ambiente essenciais na Vercel..." -ForegroundColor Cyan

$supabaseUrl = "https://hbwianqvbhzgxfihykhh.supabase.co"
$supabaseAnonKey = "sb_publishable_3W-JL4X6nyJS4kqn2IBgYg_ngSRit_f"

# 1. Adiciona NEXT_PUBLIC_SUPABASE_URL
Write-Host "Adicionando NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor Yellow
$supabaseUrl | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development --force

# 2. Adiciona NEXT_PUBLIC_SUPABASE_ANON_KEY
Write-Host "Adicionando NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
$supabaseAnonKey | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --force

Write-Host "`nAVISO IMPORTANTE:" -ForegroundColor Magenta
Write-Host "Para completar a configuracao na Vercel (aba Settings -> Environment Variables), configure manualmente:" -ForegroundColor White
Write-Host "  1. SUPABASE_SERVICE_ROLE_KEY (Chave secret obtida em Supabase -> Settings -> API)" -ForegroundColor Cyan
Write-Host "  2. RESEND_API_KEY (Chave obtida em Resend.com)" -ForegroundColor Cyan
Write-Host "  3. EMAIL_FROM (ex: 'Peticao Nacional <contato@peticaonacional.online>')" -ForegroundColor Cyan
Write-Host "`nApos salvar as variaveis na Vercel, faca um REDEPLOY do projeto para aplicar as alteracoes!`n" -ForegroundColor Green
