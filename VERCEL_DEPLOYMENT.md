# 🚀 Vercel Deployment Guide for Swipe Interview Platform

## ✅ Pre-Deployment Checklist

Your project is now **Vercel-ready** with the following optimizations:

### 🔧 **Fixed Issues:**
- ✅ **PDF.js Configuration**: Optimized for serverless deployment
- ✅ **Build Optimization**: Manual chunking for better performance
- ✅ **CORS Headers**: Added for PDF parsing compatibility
- ✅ **Environment Variables**: Proper Vercel configuration
- ✅ **Bundle Size**: Optimized with chunk splitting

## 📋 Deployment Steps

### **Step 1: Prepare Your Repository**
```bash
# Ensure all changes are committed
git add .
git commit -m "Optimize for Vercel deployment"
git push origin main
```

### **Step 2: Deploy to Vercel**

#### **Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd swipe-internship
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: swipe-interview-platform
# - Directory: ./
# - Override settings? No
```

#### **Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### **Step 3: Configure Environment Variables**

**🔑 CRITICAL: Set up your Groq API Key**

1. **Get your Groq API Key:**
   - Go to [https://console.groq.com](https://console.groq.com)
   - Sign up/Login to your account
   - Navigate to API Keys section
   - Create a new API key (starts with `gsk_`)
   - Copy the complete key

2. **Add to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add new variable:
   ```
   Name: VITE_GROQ_API_KEY
   Value: gsk_your_actual_groq_api_key_here
   Environment: Production, Preview, Development
   ```

**⚠️ Important Notes:**
- API key MUST start with `gsk_`
- Do NOT use placeholder values like `your_groq_api_key_here`
- Ensure no extra spaces before/after the key
- Set for all environments (Production, Preview, Development)

### **Step 4: Deploy**
- Click **"Deploy"** 
- Wait for build to complete (2-3 minutes)
- Your app will be live at: `https://your-project-name.vercel.app`

## 🔍 Verification Steps

After deployment, test these features:

### **✅ Core Functionality:**
- [ ] Landing page loads correctly
- [ ] Resume upload works (PDF, DOCX, TXT)
- [ ] Contact information extraction
- [ ] Question generation (requires Groq API key)
- [ ] Interview flow and timer
- [ ] Dark/light mode toggle
- [ ] Responsive design on mobile

### **✅ PDF Processing:**
- [ ] PDF files upload successfully
- [ ] Text extraction works
- [ ] No console errors related to PDF.js

### **✅ AI Features (with API key):**
- [ ] Resume parsing with AI
- [ ] Question generation
- [ ] Answer evaluation
- [ ] Final summary generation

## 🚨 Troubleshooting

### **Build Fails:**
```bash
# Check build locally first
npm run build

# If successful locally but fails on Vercel:
# 1. Check Node.js version (should be 18+)
# 2. Clear Vercel cache: vercel --force
# 3. Check environment variables
```

### **PDF Upload Issues:**
- PDF.js worker is loaded from CDN (should work)
- If issues persist, check browser console for CORS errors
- Ensure files are under 10MB (Vercel limit)

### **API Key Issues:**

**🚨 Most Common Issues:**

1. **"API key is required" Error:**
   ```bash
   # Check if API key is set in Vercel
   # Go to: Dashboard → Project → Settings → Environment Variables
   # Ensure VITE_GROQ_API_KEY exists for all environments
   ```

2. **"Invalid API key" Error:**
   ```bash
   # Verify API key format:
   # ✅ Correct: gsk_abc123def456...
   # ❌ Wrong: your_groq_api_key_here
   # ❌ Wrong: abc123 (missing gsk_ prefix)
   ```

3. **API key works locally but fails on Vercel:**
   - Redeploy after adding environment variables
   - Check API key is set for Production environment
   - Verify no extra spaces in the key value

4. **"Authentication failed" Error:**
   - Generate a new API key at [Groq Console](https://console.groq.com)
   - Ensure your Groq account is active
   - Check API key hasn't expired

**🔧 Quick Fix Commands:**
```bash
# Test API key locally
npm run dev
# Check browser console for API key validation messages

# Force redeploy on Vercel
vercel --force

# Check environment variables
vercel env ls
```

### **Performance Issues:**
- Build is optimized with manual chunking
- Large dependencies (PDF.js, Groq) are split into separate chunks
- Sourcemaps disabled for production

## 📊 Expected Build Output

```
✓ Built in XXXms
✓ Chunks: 
  - index-[hash].js (~200KB)
  - pdf-worker-[hash].js (~150KB) 
  - groq-[hash].js (~100KB)
  - resume-parser-[hash].js (~80KB)
```

## 🎯 Post-Deployment

### **Custom Domain (Optional):**
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### **Analytics:**
- Vercel provides built-in analytics
- Monitor Core Web Vitals and performance

### **Monitoring:**
- Check Vercel Functions tab for any runtime errors
- Monitor build logs for warnings

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Groq Console**: https://console.groq.com
- **Project Repository**: [Your GitHub URL]
- **Live Demo**: [Your Vercel URL]

## 🆘 Support

If you encounter issues:

1. **Check Vercel Build Logs**: Dashboard → Project → Deployments → View Details
2. **Local Testing**: Run `npm run build && npm run preview`
3. **Environment Variables**: Ensure all required vars are set
4. **Dependencies**: All packages are compatible with Vercel

---

**✨ Your Swipe Interview Platform is now ready for production on Vercel!**
