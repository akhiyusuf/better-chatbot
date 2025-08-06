# Deployment Guide

## Environment Variables for Vercel

Copy these environment variables to your Vercel project settings:

### Required Variables:
```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyBU3_d_VA4kTka8BNRoNAijzplxvO31Mo0
BETTER_AUTH_SECRET=59f5a15f3d0f6d7b96fc081b9e84b9c6ab6a1d06cd407c9352420e15c9ae4180
POSTGRES_URL=postgresql://postgres.sugzjwmvwxvilcebfrgt:Allahuakbar99@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
FILE_BASED_MCP_CONFIG=false
```

### Optional Variables (leave empty if not using):
```
OPENAI_API_KEY=
XAI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
EXA_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
DISABLE_EMAIL_SIGN_IN=
DISABLE_SIGN_UP=
NOT_ALLOW_ADD_MCP_SERVERS=
```

## Deployment Steps:
1. Push code to GitHub
2. Connect Vercel to GitHub repo
3. Add environment variables
4. Deploy!