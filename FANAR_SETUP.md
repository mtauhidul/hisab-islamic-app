# 🔑 Fanar API Setup Guide

Your HisabDaily app is now integrated with the Fanar API for authentic Islamic deed verification. Follow these steps to get it fully working:

## 📋 Quick Setup Steps

### 1. Request API Access

1. Visit [https://api.fanar.qa/request](https://api.fanar.qa/request)
2. Fill out the API access request form
3. Specify that you need access to the **Islamic-RAG** model for deed verification
4. Mention your use case: "Islamic deed verification for personal spiritual tracking app"

### 2. Get Your API Key

- Once approved (usually within 1-2 business days), you'll receive your API key
- The key will look something like: `fanar_1234567890abcdef...`

### 3. Configure Your Environment

1. Open your `.env` file
2. Replace the placeholder with your actual API key:
   ```env
   VITE_FANAR_API_KEY=your_actual_fanar_api_key_here
   ```
3. Save the file and restart your development server

### 4. Test the Integration

1. Start your dev server: `npm run dev`
2. Go to the "Checker" tab
3. Try a query like: "Is listening to music permissible in Islam?"
4. You should get authentic Islamic sources in the response

## 🎯 What You Get

### ✅ Authentic Islamic Sources

- Quran verses with references
- Authentic Hadiths from major collections
- Scholarly consensus (Ijma)
- Fatwa from trusted Islamic authorities

### ✅ Trusted Sources

The Islamic-RAG model uses:

- **Quran**: The holy book of Islam
- **Sunnah**: Authentic prophetic traditions
- **Islam Q&A**: Trusted fatwa website
- **IslamWeb**: Comprehensive Islamic resource
- **Dorar**: Classical Islamic texts

### ✅ Rate Limits

- 50 requests per minute
- Perfect for personal use
- Professional reliability

## 🔄 Current Status

**Without API Key**: You'll see demo responses with setup instructions
**With Valid API Key**: Real Islamic rulings with authentic sources

## 🚨 Troubleshooting

### Error: 401 Unauthorized

- Check that your API key is correct
- Ensure the key has been activated by Fanar
- Verify you have access to Islamic-RAG model

### Error: 429 Rate Limit

- Wait a moment before trying again
- You've exceeded 50 requests per minute

### Error: No Response

- Check your internet connection
- Verify the API key is properly set in .env
- Restart your development server

## 🔒 Privacy & Security

- Your API key is kept private in the .env file
- No deed text is stored permanently
- Only the daily count is tracked
- Full compliance with Islamic privacy principles

## 📞 Support

- **Fanar API Issues**: Contact support@fanar.qa
- **App Issues**: Check the GitHub repository
- **Islamic Questions**: Consult qualified Islamic scholars

---

**May Allah (SWT) make this tool beneficial for your spiritual growth! 🤲**
