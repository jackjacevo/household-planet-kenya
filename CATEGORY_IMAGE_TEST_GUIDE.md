# Category Image Upload Test Guide

## 🎯 Testing Category Image Upload in Production

### Prerequisites
- Access to the deployed admin panel
- Admin credentials
- Test images in various formats

### Test Steps

#### 1. Access Admin Categories Page
- Navigate to: `https://your-domain.com/admin/categories`
- Login with admin credentials
- Click "Add Category" button

#### 2. Test Basic Image Upload
- Fill in category name: "Test Category - Images"
- Select "No Parent (Main Category)"
- Click on the file input under "Category Image"
- Upload a **PNG image** (most common format)
- Verify:
  - ✅ Upload progress indicator appears
  - ✅ Success toast notification shows
  - ✅ Image preview appears below the input
  - ✅ Image displays correctly in preview

#### 3. Test Different Image Formats
Test each format by creating new categories:

**Supported Formats to Test:**
- ✅ **JPG/JPEG** - `test-image.jpg`
- ✅ **PNG** - `test-image.png` 
- ✅ **GIF** - `test-image.gif`
- ✅ **WebP** - `test-image.webp`
- ✅ **BMP** - `test-image.bmp`
- ✅ **TIFF** - `test-image.tiff`
- ✅ **SVG** - `test-image.svg`
- ✅ **ICO** - `test-image.ico`
- ✅ **AVIF** - `test-image.avif` (if available)
- ✅ **HEIC** - `test-image.heic` (if available)

#### 4. Test Error Handling
- Try uploading a **non-image file** (e.g., .txt, .pdf)
- Try uploading a **very large image** (>5MB)
- Verify appropriate error messages appear

#### 5. Test Category Creation
- Complete the form and click "Create"
- Verify:
  - ✅ Category is created successfully
  - ✅ Image is stored and accessible
  - ✅ Category appears in the list with image
  - ✅ Image displays correctly in category list

#### 6. Test Image Display
- Check that images display correctly in:
  - ✅ Category form preview
  - ✅ Parent category cards
  - ✅ Subcategory chips
  - ✅ Category list view

#### 7. Test Image URLs
- Right-click on displayed images and "Open in new tab"
- Verify:
  - ✅ Images load from `/uploads/categories/` path
  - ✅ Images have UUID-based filenames
  - ✅ Images are accessible via direct URL

### Expected Results

#### ✅ Success Indicators:
- All image formats upload successfully
- Images display correctly in all views
- Proper error handling for invalid files
- UUID-based secure filenames
- Images served from `/uploads/categories/` directory

#### ❌ Failure Indicators:
- Upload fails with supported formats
- Images don't display after upload
- Error messages are unclear or missing
- Images accessible with original filenames (security issue)

### API Endpoints Being Tested

1. **Image Upload**: `POST /api/categories/upload`
   - Accepts multipart/form-data
   - Returns: `{ url: "/uploads/categories/uuid.ext" }`

2. **Category Creation**: `POST /api/categories`
   - Accepts JSON with image URL
   - Stores category with image reference

3. **Category Retrieval**: `GET /api/categories`
   - Returns categories with image URLs
   - Images should be accessible

### Troubleshooting

If tests fail, check:
- Network tab for API errors
- Console for JavaScript errors
- Server logs for upload issues
- File permissions on uploads directory
- Image format validation errors

### Test Results Template

```
✅ PNG Upload: Success/Failed
✅ JPG Upload: Success/Failed  
✅ GIF Upload: Success/Failed
✅ WebP Upload: Success/Failed
✅ BMP Upload: Success/Failed
✅ TIFF Upload: Success/Failed
✅ SVG Upload: Success/Failed
✅ ICO Upload: Success/Failed
✅ Error Handling: Success/Failed
✅ Image Display: Success/Failed
✅ Category Creation: Success/Failed
```

---

**Note**: After testing, you can delete the test categories created during this process.