#!/usr/bin/env node

/**
 * Image Optimization Migration Script
 * Helps identify and migrate existing Image components to optimized versions
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Patterns to find and replace
const patterns = [
  {
    find: /import Image from ['"]next\/image['"];?/g,
    replace: "import { SmartImage } from '@/components/ui/SmartImage';"
  },
  {
    find: /<Image\s+/g,
    replace: '<SmartImage '
  },
  {
    find: /\/Image>/g,
    replace: '/SmartImage>'
  }
];

// Files to exclude from migration
const excludeFiles = [
  'SmartImage.tsx',
  'ProgressiveImage.tsx',
  'OptimizedImage.tsx',
  'MobileImageOptimizer.tsx'
];

function findFiles(dir, extension = '.tsx') {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extension));
    } else if (file.endsWith(extension) && !excludeFiles.includes(file)) {
      results.push(filePath);
    }
  }

  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for Next.js Image imports
  if (content.includes('import Image from \'next/image\'') || content.includes('import Image from "next/image"')) {
    issues.push('Uses Next.js Image component');
  }

  // Check for Image components without optimization
  const imageMatches = content.match(/<Image\s[^>]*>/g);
  if (imageMatches) {
    imageMatches.forEach((match, index) => {
      if (!match.includes('quality=') && !match.includes('sizes=')) {
        issues.push(`Image component ${index + 1} missing optimization props`);
      }
    });
  }

  return issues;
}

function generateMigrationReport() {
  console.log('🔍 Analyzing image usage in your application...\n');

  const files = findFiles(srcDir);
  const report = {
    totalFiles: files.length,
    filesWithImages: 0,
    totalIssues: 0,
    fileReports: []
  };

  files.forEach(filePath => {
    const issues = analyzeFile(filePath);
    if (issues.length > 0) {
      report.filesWithImages++;
      report.totalIssues += issues.length;
      report.fileReports.push({
        file: path.relative(srcDir, filePath),
        issues
      });
    }
  });

  return report;
}

function displayReport(report) {
  console.log('📊 Image Optimization Analysis Report');
  console.log('=====================================\n');
  
  console.log(`📁 Total files analyzed: ${report.totalFiles}`);
  console.log(`🖼️  Files with images: ${report.filesWithImages}`);
  console.log(`⚠️  Total optimization opportunities: ${report.totalIssues}\n`);

  if (report.fileReports.length > 0) {
    console.log('📋 Files needing optimization:\n');
    
    report.fileReports.forEach(({ file, issues }) => {
      console.log(`📄 ${file}`);
      issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
      console.log('');
    });

    console.log('🚀 Recommended Actions:\n');
    console.log('1. Replace Image imports with SmartImage:');
    console.log('   import { SmartImage } from \'@/components/ui/SmartImage\';');
    console.log('');
    console.log('2. For hero/large images, use ProgressiveImage:');
    console.log('   import { ProgressiveImage } from \'@/components/ui/ProgressiveImage\';');
    console.log('');
    console.log('3. Add optimization props:');
    console.log('   - priority={true} for above-the-fold images');
    console.log('   - quality={60-90} based on importance');
    console.log('   - sizes="..." for responsive behavior');
    console.log('');
    console.log('4. Use the optimization hook:');
    console.log('   const { preloadImages } = useImageOptimization();');
  } else {
    console.log('✅ All images are already optimized!');
  }
}

function createMigrationChecklist() {
  const checklist = `
# Image Optimization Migration Checklist

## Phase 1: Component Updates
- [ ] Replace Next.js Image imports with SmartImage
- [ ] Update hero images to use ProgressiveImage
- [ ] Add priority prop to above-the-fold images
- [ ] Configure responsive sizes for all images

## Phase 2: Performance Optimization
- [ ] Implement image preloading for critical images
- [ ] Add lazy loading for below-the-fold content
- [ ] Configure adaptive quality settings
- [ ] Test on different network conditions

## Phase 3: Monitoring
- [ ] Set up performance monitoring
- [ ] Track Core Web Vitals improvements
- [ ] Monitor image loading metrics
- [ ] Validate format support across browsers

## Testing Checklist
- [ ] Test on mobile devices (various screen sizes)
- [ ] Test on slow network connections (3G)
- [ ] Verify WebP/AVIF format delivery
- [ ] Check loading performance with Lighthouse
- [ ] Validate accessibility (alt text, etc.)

## Performance Targets
- [ ] Lighthouse Performance Score: 90+
- [ ] Largest Contentful Paint (LCP): <2.5s
- [ ] Cumulative Layout Shift (CLS): <0.1
- [ ] First Input Delay (FID): <100ms
`;

  fs.writeFileSync('IMAGE_MIGRATION_CHECKLIST.md', checklist);
  console.log('📝 Created IMAGE_MIGRATION_CHECKLIST.md');
}

// Main execution
function main() {
  console.log('🎯 Household Planet Kenya - Image Optimization Migration Tool\n');

  try {
    const report = generateMigrationReport();
    displayReport(report);
    createMigrationChecklist();
    
    console.log('\n💡 Next Steps:');
    console.log('1. Review the analysis report above');
    console.log('2. Follow the IMAGE_MIGRATION_CHECKLIST.md');
    console.log('3. Test performance improvements');
    console.log('4. Monitor Core Web Vitals');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateMigrationReport,
  analyzeFile,
  findFiles
};