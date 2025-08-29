# Automatic Slug Generation Feature

## Overview
The product creation system now automatically generates URL-friendly slugs from product names when a slug is not explicitly provided.

## How It Works

### 1. Automatic Generation
- When creating a product without providing a `slug` field, the system automatically generates one from the product `name`
- The slug generation follows URL-friendly conventions:
  - Converts to lowercase
  - Replaces spaces and special characters with hyphens
  - Removes leading/trailing hyphens
  - Ensures uniqueness by appending numbers if needed

### 2. Slug Generation Rules
```javascript
// Example transformations:
"Samsung Galaxy S24" → "samsung-galaxy-s24"
"Apple iPhone 15 Pro Max - 256GB" → "apple-iphone-15-pro-max-256gb"
"Kitchen Utensils & Tools" → "kitchen-utensils-tools"
"  Washing Machine (7kg)  " → "washing-machine-7kg"
```

### 3. Uniqueness Handling
- If a generated slug already exists, the system appends a number: `-1`, `-2`, etc.
- Example: If `samsung-galaxy-s24` exists, the next product will get `samsung-galaxy-s24-1`

### 4. Manual Slug Override
- You can still provide a custom slug when creating products
- The system validates that custom slugs are unique
- If a provided slug conflicts, an error is returned

## API Changes

### CreateProductDto
The `slug` field is now **optional**:
```typescript
// Before (required)
slug: string;

// After (optional)
slug?: string;
```

### Product Creation Examples

#### Automatic Slug Generation
```json
{
  "name": "Samsung Galaxy S24",
  "description": "Latest Samsung smartphone",
  "price": 85000,
  "categoryId": 1,
  "sku": "SGS24-001"
  // No slug provided - will generate "samsung-galaxy-s24"
}
```

#### Manual Slug Specification
```json
{
  "name": "Samsung Galaxy S24",
  "slug": "samsung-s24-flagship",
  "description": "Latest Samsung smartphone",
  "price": 85000,
  "categoryId": 1,
  "sku": "SGS24-001"
}
```

## Product Updates

### Name Changes
- When updating a product's name, the slug is automatically regenerated unless explicitly provided
- This ensures the slug stays relevant to the product name

### Slug Updates
- You can update the slug directly by providing a new `slug` value
- The system validates uniqueness for the new slug

## Implementation Details

### Files Modified
1. `src/common/utils/slug.util.ts` - New utility for slug generation
2. `src/products/dto/create-product.dto.ts` - Made slug optional
3. `src/admin/admin.service.ts` - Added slug generation logic
4. `src/products/products.service.ts` - Added slug generation logic

### Key Functions
- `SlugUtil.generateSlug(text)` - Converts text to URL-friendly slug
- `SlugUtil.generateUniqueSlug(text, checkFunction)` - Generates unique slug with conflict resolution

## Benefits
1. **Improved UX**: No need to manually create slugs for every product
2. **SEO Friendly**: Automatic slugs are descriptive and URL-friendly
3. **Consistency**: All slugs follow the same formatting rules
4. **Flexibility**: Still allows manual slug specification when needed
5. **Data Integrity**: Ensures all slugs are unique

## Backward Compatibility
- Existing products with slugs are not affected
- The API still accepts slug parameters for manual specification
- No breaking changes to existing functionality