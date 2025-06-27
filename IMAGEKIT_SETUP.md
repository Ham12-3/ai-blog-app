# ImageKit Setup Guide

## Overview

This blog platform now supports image uploads using [ImageKit.io](https://imagekit.io), which provides:

- **Fast CDN delivery** - Images served from global CDN
- **Automatic optimization** - WebP conversion, quality optimization
- **Real-time transformations** - Resize, crop, format conversion on-the-fly
- **Free tier** - 20GB bandwidth and 20GB storage per month

## Features Added

✅ **Featured Image Upload** - Upload a main image for each blog post  
✅ **Inline Content Images** - Insert images anywhere in your blog content  
✅ **Drag & Drop** - Drag images directly into upload areas  
✅ **Paste Support** - Ctrl+V to paste images from clipboard  
✅ **Progress Indicators** - Real-time upload progress  
✅ **Image Preview** - See uploaded images immediately  
✅ **Validation** - File type and size validation  

## Setup Instructions

### 1. Create ImageKit Account

1. Go to [imagekit.io](https://imagekit.io) and sign up for free
2. Complete the onboarding process
3. Navigate to your dashboard

### 2. Get API Credentials

1. In your ImageKit dashboard, go to **Developer Options** → **API Keys**
2. Copy these three values:
   - **Public Key** (starts with `public_`)
   - **Private Key** (starts with `private_`)  
   - **URL Endpoint** (format: `https://ik.imagekit.io/your_id/`)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_your_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id/
IMAGEKIT_PRIVATE_KEY=private_your_key_here
```

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/create` and try uploading a featured image
3. Try inserting images in the content editor
4. Check that images appear in preview mode

## Usage

### Featured Images

1. When creating a blog post, scroll to the "Featured Image" section
2. Click the upload area or drag an image onto it
3. The image will be uploaded and displayed as a preview
4. This image will appear at the top of your blog post

### Content Images

1. In the content editor, click the "Image" button in the toolbar
2. Upload an image using the same drag & drop interface
3. The image will be automatically inserted as Markdown: `![filename](url)`
4. Switch to Preview tab to see how it looks

### Image Optimization

ImageKit automatically:
- Converts images to WebP format for better compression
- Serves the optimal image size based on device
- Provides global CDN delivery for fast loading
- Generates progressive JPEG for better perceived performance

## File Organization

Images are organized in folders:
- `featured-images/` - Blog post featured images
- `blog-content/` - Inline content images

## Limits & Validation

- **File Size**: Up to 10MB per image
- **File Types**: PNG, JPG, GIF, WebP
- **Free Tier**: 20GB bandwidth/month, 20GB storage
- **Paste Support**: Copy images from other apps and paste with Ctrl+V

## Troubleshooting

### Authentication Errors
- Verify your API keys are correct
- Make sure private key is not exposed in frontend code
- Check that URL endpoint includes trailing slash

### Upload Failures
- Confirm file size is under 10MB
- Verify file type is supported (images only)
- Check browser console for specific error messages

### Images Not Loading
- Verify URL endpoint is correctly formatted
- Check that images exist in your ImageKit media library
- Ensure CDN has finished processing (usually instant)

## Advanced Features

ImageKit offers additional features you can implement:
- **Real-time transformations**: Resize images on-the-fly
- **Video uploads**: Support for video content  
- **AI-based optimizations**: Smart cropping and enhancement
- **Advanced analytics**: Usage statistics and performance metrics

For more advanced features, refer to the [ImageKit documentation](https://docs.imagekit.io/). 