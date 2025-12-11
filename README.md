# Sistema de Gerenciamento para Personal Trainers

Este é um sistema completo para gerenciamento de alunos, treinos e desempenho, desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## Funcionalidades

- **Dashboard**: Visão geral de alunos e treinos ativos.
- **Alunos**: Cadastro completo com histórico médico.
- **Exercícios**: Banco de exercícios com imagens e classificação por grupo muscular.
- **Treinos**:
  - Criação de treinos com interface Drag-and-Drop.
  - Organização por semanas.
  - Seleção de datas de vigência.
- **Desempenho**:
  - Registro de cargas e repetições diárias.
  - Gráficos de evolução por exercício.
  - Comparativo com histórico anterior.
- **Segurança**:
  - Autenticação via Supabase Auth.
  - Dados isolados por Personal Trainer (RLS).

## Tecnologias

- **Frontend**: React 18, Vite, TypeScript
- **Estilização**: Tailwind CSS, Lucide React (Ícones)
- **Estado**: Zustand
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Drag & Drop**: @dnd-kit
- **Backend/DB**: Supabase

## Configuração do Projeto

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar Supabase**:
   - Crie um projeto no Supabase.
   - Execute o script SQL localizado em `supabase/migrations/20251210120000_initial_schema.sql` no Editor SQL do Supabase.
   - Crie um arquivo `.env` na raiz do projeto com suas credenciais:
     ```env
     VITE_SUPABASE_URL=sua_url_do_supabase
     VITE_SUPABASE_ANON_KEY=sua_chave_anonima
     ```

3. **Rodar o projeto**:
   ```bash
   npm run dev
   ```

## Estrutura do Banco de Dados

- `personal_trainers`: Perfil do treinador (vinculado ao Auth).
- `students`: Alunos do treinador.
- `exercises`: Banco de exercícios do treinador.
- `workouts`: Planos de treino (cabeçalho).
- `workout_exercises`: Exercícios vinculados a um treino e semana.
- `performances`: Registros de carga/repetições.

## Deploy

O projeto está pronto para ser implantado na Vercel ou Netlify.
Certifique-se de configurar as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel de deploy.
