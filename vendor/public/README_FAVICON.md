# Favicon Setup Instructions

## 📁 Required Files

Copy these files from `client/public/` or `admin/public/` to `vendor/public/`:

1. **favicon.png** - Main favicon (32x32 or 64x64 recommended)
2. **favicon.ico** - Traditional favicon format (16x16, 32x32, 48x48)
3. **logo192.png** - Apple touch icon (192x192)
4. **logo512.png** - Large icon for PWA (512x512)

## 🔄 Quick Setup

### Option 1: Copy from existing app
```bash
# From project root
cp client/public/fav.png vendor/public/favicon.png
cp client/public/fav.png vendor/public/favicon.ico
cp client/public/fav.png vendor/public/logo192.png
cp client/public/fav.png vendor/public/logo512.png
```

### Option 2: Generate from your logo
If you have a high-resolution logo:
1. Use an online tool like https://realfavicongenerator.net/
2. Upload your logo
3. Download all generated files
4. Place them in `vendor/public/`

## ✅ After Adding Files

1. Commit and push:
   ```bash
   git add vendor/public/
   git commit -m "Add favicon files for vendor dashboard"
   git push
   ```

2. Vercel will auto-deploy

3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## 🎨 Recommended Sizes

- **favicon.ico**: 16x16, 32x32, 48x48 (multi-size ICO)
- **favicon.png**: 32x32 or 64x64
- **logo192.png**: 192x192 (Apple touch icon)
- **logo512.png**: 512x512 (PWA icon)

## 📝 Note

The `index.html` and `manifest.json` are already configured. You just need to add the image files!

