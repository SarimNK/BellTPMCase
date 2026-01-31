# OpenAI API Setup Guide

## Quick Setup

1. **Get your OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in to your OpenAI account
   - Click "Create new secret key"
   - Copy the API key (you won't be able to see it again!)

2. **Create `.env` file:**
   - In the root directory of the project, create a file named `.env`
   - Add the following line:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
   - Replace `sk-your-actual-api-key-here` with your actual API key

3. **Restart the dev server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again
   - The API key will now be loaded

## How It Works

- **With API Key:** The app uses GPT-4 to analyze your uploaded documents and generate intelligent, context-aware slides
- **Without API Key:** The app falls back to mock generation (still functional, but generic content)

## Cost Considerations

- OpenAI charges per API call (based on tokens used)
- GPT-4 Turbo is used by default (more accurate, slightly more expensive)
- You can modify the model in `src/utils/aiService.js` to use `gpt-3.5-turbo` for lower costs
- Typical cost per presentation generation: $0.10 - $0.50 depending on document size

## Security Notes

- **Never commit your `.env` file to Git** (it's already in `.gitignore`)
- For production deployment on Netlify:
  - Go to Netlify Dashboard → Site Settings → Environment Variables
  - Add `VITE_OPENAI_API_KEY` as a variable
  - Set the value to your API key
  - Redeploy the site

## Troubleshooting

**Error: "OpenAI API key not found"**
- Make sure `.env` file exists in the root directory
- Check that the variable name is exactly `VITE_OPENAI_API_KEY`
- Restart the dev server after creating/modifying `.env`

**Error: "Failed to generate slides"**
- Check your OpenAI account has credits
- Verify the API key is valid
- Check browser console for detailed error messages

**API Rate Limits:**
- Free tier has rate limits
- If you hit limits, wait a few minutes or upgrade your OpenAI plan

