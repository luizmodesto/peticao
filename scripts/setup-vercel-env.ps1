# Script para adicionar as variáveis diretamente na Vercel via CLI
Write-Host "Configurando variáveis de ambiente na Vercel..." -ForegroundColor Cyan

$supabaseUrl = "https://hbwianqvbhzgxfihykhh.supabase.co"
$supabaseKey = "sb_publishable_3W-JL4X6nyJS4kqn2IBgYg_ngSRit_f"

# Adiciona NEXT_PUBLIC_SUPABASE_URL
Write-Host "Adicionando NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor Yellow
$supabaseUrl | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development --force

# Adiciona NEXT_PUBLIC_SUPABASE_ANON_KEY
Write-Host "Adicionando NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
$supabaseKey | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --force

Write-Host "Variáveis configuradas com sucesso na Vercel!" -ForegroundColor Green
