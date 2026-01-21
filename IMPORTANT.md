# ⚠️ IMPORTANT - READ FIRST

## 🔑 API Key Required

**Before you can run the system, you MUST:**

1. **Get a Google Gemini API Key** (Free)
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your key

2. **Add it to `.env` file**
   - Open the `.env` file in this directory
   - Find the line: `GOOGLE_API_KEY=your_google_gemini_api_key_here`
   - Replace `your_google_gemini_api_key_here` with your actual key
   - Save the file

**Example:**
```bash
# Before:
GOOGLE_API_KEY=your_google_gemini_api_key_here

# After:
GOOGLE_API_KEY=AIzaSyA_your_actual_key_here_1234567890
```

---

## 🚀 Quick Start Commands

Once you've added your API key:

```bash
# 1. Install dependencies
npm install

# 2. Start Weaviate
npm run docker:up

# 3. Wait and setup database
sleep 10 && npm run setup

# 4. Run examples
npm run example
```

---

## ⚡ What If I Don't Have an API Key?

The system **will not work** without a valid Google Gemini API key because:
- The delegating agent uses Google Gemini to analyze queries
- The RAG agent uses Google Gemini to generate answers
- All LLM operations require the API

**Good news:** The free tier is sufficient for testing and development!

---

## 📋 Pre-Flight Checklist

Before running anything, verify:

- [ ] Docker is installed and running
- [ ] Node.js 18+ is installed
- [ ] You have a Google Gemini API key
- [ ] The API key is added to `.env` file
- [ ] The `.env` file is NOT the `.env.example` file

---

## 🛑 Common Mistake

**Don't edit `.env.example` - edit `.env`**

Two files exist:
- `.env.example` - Template (don't edit this)
- `.env` - Your actual config (edit this one!)

---

## ✅ Verify Your Setup

After adding your API key, verify it's correct:

```bash
# Check the .env file has your key
cat .env | grep GOOGLE_API_KEY

# Should NOT show "your_google_gemini_api_key_here"
# Should show your actual key
```

---

## 📚 Next Steps

Once your API key is configured:

1. Read `GET_STARTED.md` - Complete setup guide
2. Or read `QUICKSTART.md` - Fast 5-minute setup
3. Or run `npm run example` - See it in action

---

## 🆘 Still Having Issues?

### Issue: "API key not configured" error

**Solution:**
```bash
# 1. Check .env file exists
ls -la .env

# 2. Check it has your key
cat .env

# 3. Make sure key starts with "AIza"
# Google Gemini keys typically start with AIza
```

### Issue: "Invalid API key" error

**Solution:**
- Go back to https://makersuite.google.com/app/apikey
- Make sure you copied the entire key
- Try generating a new key
- Check for extra spaces when pasting

---

## 🔒 Security Reminder

**Never:**
- Commit `.env` to git (it's already in `.gitignore`)
- Share your API key publicly
- Upload it to GitHub or other platforms
- Hardcode it in your source files

**Always:**
- Keep it in `.env` file
- Use environment variables
- Regenerate if compromised

---

## 💡 Free Tier Limits

Google Gemini Free Tier:
- **60 requests per minute**
- **1,500 requests per day**
- **Sufficient for development and testing**

If you hit limits:
- Add delays between requests
- Use caching
- Upgrade to paid tier if needed

---

## ✨ You're Ready!

Once you've added your API key:

```bash
npm install && npm run docker:up && sleep 10 && npm run setup && npm run example
```

This single command will:
1. Install everything
2. Start the database
3. Set up the schema
4. Run examples

**Time required:** ~2 minutes

---

## 📞 Documentation Links

- **Complete Guide:** `GET_STARTED.md`
- **Quick Setup:** `QUICKSTART.md`
- **Architecture:** `ARCHITECTURE.md`
- **API Reference:** `API.md`
- **Verification:** `CHECKLIST.md`

---

**Ready to begin?** Add your API key and run the commands above! 🚀
