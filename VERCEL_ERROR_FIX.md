# Vercel FUNCTION_INVOCATION_FAILED Error - Complete Guide

## 1. The Fix

For a **static HTML/CSS/JS site** like yours, create a `vercel.json` file that explicitly tells Vercel this is a static site:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**Alternative simpler approach** (recommended for pure static sites):
Just delete any `vercel.json` if it exists, or ensure your project structure doesn't have an `api/` folder. Vercel will auto-detect static sites.

## 2. Root Cause Analysis

### What Was Happening vs. What Should Happen

**What was happening:**
- Vercel detected your project and tried to deploy it
- It may have seen file patterns or routes that looked like they could be serverless functions
- When a request came in, Vercel tried to invoke a serverless function
- Since no function existed, it threw `FUNCTION_INVOCATION_FAILED`

**What should happen:**
- Vercel should recognize this as a static site (HTML, CSS, JS files)
- It should serve files directly without trying to invoke any functions
- All routing should be handled client-side

### Conditions That Trigger This Error

1. **Presence of `api/` directory**: If you have an `api/` folder, Vercel assumes serverless functions
2. **Incorrect `vercel.json`**: Configuration that routes requests to non-existent functions
3. **Build configuration**: Build settings that try to generate functions
4. **File naming**: Files matching patterns like `/api/route.js` trigger function detection

### The Misconception

**Common misconception:** "Vercel is smart enough to know this is static"
**Reality:** Vercel has heuristics, but explicit configuration prevents ambiguity

## 3. Understanding the Concept

### Why This Error Exists

The `FUNCTION_INVOCATION_FAILED` error exists because:

1. **Vercel's Dual Nature**: Vercel supports both:
   - **Static sites**: Pre-built HTML/CSS/JS files served from CDN
   - **Serverless functions**: Dynamic code that runs on-demand

2. **Route Matching System**: Vercel uses a routing system that:
   - Checks if a route matches an API/function pattern
   - If it matches, attempts to invoke a serverless function
   - If no function exists or it fails, throws this error

3. **Performance Optimization**: By distinguishing static vs dynamic, Vercel can:
   - Cache static files at edge locations (faster)
   - Only spin up serverless functions when needed (cost-effective)

### Mental Model: Static vs Serverless

Think of Vercel like a restaurant:

- **Static Site**: Pre-made meals (HTML files) stored in a display case - instant service
- **Serverless Functions**: Custom orders that require kitchen work - takes time, runs on-demand

Your salary slip app is like a menu (static HTML) that users can view and use in their browser. No kitchen (server) needed!

### How This Fits Into Vercel's Architecture

```
Request → Vercel Router
           ↓
    ┌──────┴──────┐
    │             │
Static?      Function?
    │             │
Serve file   Invoke function
(Cache at    (Run code)
 edge)       │
             │
         Error if
         function
         doesn't exist
```

## 4. Warning Signs to Watch For

### Code Smells That Indicate This Issue

1. **`api/` folder exists**: Even if empty, Vercel looks here
2. **Files named like API routes**: `api.js`, `server.js` in root
3. **Missing explicit static config**: No `vercel.json` declaring static site
4. **Mixed project structure**: Static files + function-like patterns

### Patterns to Avoid

```javascript
// ❌ DON'T: Create an api folder for no reason
api/
  index.js  // Empty or misconfigured

// ✅ DO: Keep static files in root
index.html
styles.css
script.js
```

### Red Flags in `vercel.json`

```json
// ❌ BAD: Routing to non-existent functions
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }  // But no /api/ folder exists!
  ]
}

// ❌ BAD: Using function builders for static files
{
  "builds": [
    { "src": "index.html", "use": "@vercel/node" }  // Wrong builder!
  ]
}

// ✅ GOOD: Explicit static declaration
{
  "builds": [
    { "src": "**", "use": "@vercel/static" }
  ]
}
```

## 5. Alternative Approaches & Trade-offs

### Option 1: Explicit Static Configuration (Current Solution)

**Pros:**
- Crystal clear intent
- No ambiguity
- Works in all scenarios

**Cons:**
- Requires a config file
- Slightly more setup

### Option 2: Auto-Detection (Simpler)

**Approach:** Remove `vercel.json` entirely, ensure no `api/` folder

**Pros:**
- Zero configuration
- Vercel auto-detects static sites
- Less files to maintain

**Cons:**
- Less control
- May fail if structure is ambiguous

### Option 3: Hybrid (For Future Growth)

If you later need serverless functions:

```json
{
  "version": 2,
  "builds": [
    { "src": "api/**/*.js", "use": "@vercel/node" },
    { "src": "**", "use": "@vercel/static" }
  ]
}
```

**Pros:**
- Scalable
- Supports both static and dynamic

**Cons:**
- More complex
- Overkill for pure static sites

### Recommendation

For your current project (pure static site):
- Use **Option 1** if you want explicit control
- Use **Option 2** if you prefer simplicity

Both work perfectly for static sites!

## Additional Notes

### Testing the Fix

After deploying with the fix:

1. ✅ Your site should load normally
2. ✅ No function invocation errors
3. ✅ All static files (HTML, CSS, JS) served correctly
4. ✅ Client-side JavaScript runs in browser

### If Error Persists

1. Check Vercel dashboard → Functions tab (should be empty for static site)
2. Verify no `api/` directory exists
3. Check build logs for function detection warnings
4. Ensure `vercel.json` uses `@vercel/static` builder

---

**Remember**: For static sites, you want Vercel to serve files, not invoke functions!

