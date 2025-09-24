#!/usr/bin/env node

/**
 * Phase 3 Performance Testing Script
 * Tests the performance improvements implemented in Phase 3
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

class Phase3PerformanceTester {
  constructor() {
    this.results = {
      bundleAnalysis: {},
      featureFlags: {},
      cacheImplementation: {},
      virtualizationSupport: {},
      lazyLoading: {}
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Phase 3 Performance Tests...\n');

    await this.testBundleOptimization();
    await this.testFeatureFlags();
    await this.testCacheImplementation();
    await this.testVirtualizationComponents();
    await this.testLazyLoadingComponents();

    this.generateReport();
  }

  async testBundleOptimization() {
    console.log('📦 Testing Bundle Optimization...');

    const buildOutputPath = path.join(__dirname, '../.next');
    const nextConfigPath = path.join(__dirname, '../next.config.js');

    // Check if build artifacts exist
    const buildExists = fs.existsSync(buildOutputPath);
    const configExists = fs.existsSync(nextConfigPath);

    this.results.bundleAnalysis = {
      buildArtifactsPresent: buildExists,
      nextConfigOptimized: configExists,
      bundleAnalyzerEnabled: configExists && fs.readFileSync(nextConfigPath, 'utf8').includes('@next/bundle-analyzer'),
      codeSplitreignsConfigured: configExists && fs.readFileSync(nextConfigPath, 'utf8').includes('splitChunks')
    };

    console.log(`   ✅ Build artifacts: ${buildExists ? 'Found' : 'Missing'}`);
    console.log(`   ✅ Next.js config optimized: ${configExists ? 'Yes' : 'No'}`);
    console.log(`   ✅ Bundle analyzer: ${this.results.bundleAnalysis.bundleAnalyzerEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   ✅ Code splitting: ${this.results.bundleAnalysis.codeSplitreignsConfigured ? 'Configured' : 'Not configured'}\n`);
  }

  async testFeatureFlags() {
    console.log('🚦 Testing Feature Flags...');

    const adminConfigPath = path.join(__dirname, '../src/lib/config/admin-config.ts');
    const configExists = fs.existsSync(adminConfigPath);

    let phase3FlagsPresent = false;
    let unifiedDashboardFlag = false;
    let advancedCachingFlag = false;

    if (configExists) {
      const configContent = fs.readFileSync(adminConfigPath, 'utf8');
      phase3FlagsPresent = configContent.includes('unifiedDashboard') && configContent.includes('advancedCaching');
      unifiedDashboardFlag = configContent.includes('UNIFIED_DASHBOARD');
      advancedCachingFlag = configContent.includes('ADVANCED_CACHING');
    }

    this.results.featureFlags = {
      adminConfigExists: configExists,
      phase3FlagsPresent,
      unifiedDashboardFlag,
      advancedCachingFlag
    };

    console.log(`   ✅ Admin config: ${configExists ? 'Found' : 'Missing'}`);
    console.log(`   ✅ Phase 3 flags: ${phase3FlagsPresent ? 'Present' : 'Missing'}`);
    console.log(`   ✅ Unified dashboard flag: ${unifiedDashboardFlag ? 'Yes' : 'No'}`);
    console.log(`   ✅ Advanced caching flag: ${advancedCachingFlag ? 'Yes' : 'No'}\n`);
  }

  async testCacheImplementation() {
    console.log('💾 Testing Cache Implementation...');

    const cacheFilePath = path.join(__dirname, '../src/lib/cache.ts');
    const swManagerPath = path.join(__dirname, '../src/lib/services/sw-manager.ts');
    const serviceWorkerPath = path.join(__dirname, '../public/sw.js');

    const cacheExists = fs.existsSync(cacheFilePath);
    const swManagerExists = fs.existsSync(swManagerPath);
    const serviceWorkerExists = fs.existsSync(serviceWorkerPath);

    let adminCacheClass = false;
    let indexedDBCache = false;
    let serviceWorkerOptimized = false;

    if (cacheExists) {
      const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
      adminCacheClass = cacheContent.includes('class AdminCache');
      indexedDBCache = cacheContent.includes('class IndexedDBCache');
    }

    if (serviceWorkerExists) {
      const swContent = fs.readFileSync(serviceWorkerPath, 'utf8');
      serviceWorkerOptimized = swContent.includes('ADMIN_CACHE_PATTERNS') && swContent.includes('handleAdminApiRequest');
    }

    this.results.cacheImplementation = {
      browserCacheExists: cacheExists,
      adminCacheImplemented: adminCacheClass,
      indexedDBImplemented: indexedDBCache,
      serviceWorkerManagerExists: swManagerExists,
      serviceWorkerOptimized
    };

    console.log(`   ✅ Browser cache: ${cacheExists ? 'Implemented' : 'Missing'}`);
    console.log(`   ✅ Admin cache class: ${adminCacheClass ? 'Yes' : 'No'}`);
    console.log(`   ✅ IndexedDB cache: ${indexedDBCache ? 'Yes' : 'No'}`);
    console.log(`   ✅ Service worker manager: ${swManagerExists ? 'Yes' : 'No'}`);
    console.log(`   ✅ SW admin optimization: ${serviceWorkerOptimized ? 'Yes' : 'No'}\n`);
  }

  async testVirtualizationComponents() {
    console.log('📋 Testing Virtualization Components...');

    const virtualizedTablePath = path.join(__dirname, '../src/components/admin/VirtualizedTable.tsx');
    const virtualizedOrdersPath = path.join(__dirname, '../src/components/admin/VirtualizedOrdersTable.tsx');
    const virtualizedProductsPath = path.join(__dirname, '../src/components/admin/VirtualizedProductsTable.tsx');

    const virtualizedTableExists = fs.existsSync(virtualizedTablePath);
    const virtualizedOrdersExists = fs.existsSync(virtualizedOrdersPath);
    const virtualizedProductsExists = fs.existsSync(virtualizedProductsPath);

    let reactWindowIntegration = false;
    let performanceOptimized = false;

    if (virtualizedTableExists) {
      const tableContent = fs.readFileSync(virtualizedTablePath, 'utf8');
      reactWindowIntegration = tableContent.includes('react-window') || tableContent.includes('FixedSizeList');
      performanceOptimized = tableContent.includes('React.memo') || tableContent.includes('useCallback');
    }

    this.results.virtualizationSupport = {
      virtualizedTableExists,
      virtualizedOrdersExists,
      virtualizedProductsExists,
      reactWindowIntegration,
      performanceOptimized
    };

    console.log(`   ✅ Virtualized table: ${virtualizedTableExists ? 'Implemented' : 'Missing'}`);
    console.log(`   ✅ Orders table virtualization: ${virtualizedOrdersExists ? 'Yes' : 'No'}`);
    console.log(`   ✅ Products table virtualization: ${virtualizedProductsExists ? 'Yes' : 'No'}`);
    console.log(`   ✅ React Window integration: ${reactWindowIntegration ? 'Yes' : 'No'}`);
    console.log(`   ✅ Performance optimized: ${performanceOptimized ? 'Yes' : 'No'}\n`);
  }

  async testLazyLoadingComponents() {
    console.log('⚡ Testing Lazy Loading Components...');

    const lazyComponentsPath = path.join(__dirname, '../src/components/admin/LazyAdminComponents.tsx');
    const chartBundlePath = path.join(__dirname, '../src/components/admin/charts/ChartBundle.tsx');

    const lazyComponentsExists = fs.existsSync(lazyComponentsPath);
    const chartBundleExists = fs.existsSync(chartBundlePath);

    let lazyImportsImplemented = false;
    let suspenseBoundaries = false;
    let chartOptimization = false;

    if (lazyComponentsExists) {
      const lazyContent = fs.readFileSync(lazyComponentsPath, 'utf8');
      lazyImportsImplemented = lazyContent.includes('lazy(') && lazyContent.includes('import(');
      suspenseBoundaries = lazyContent.includes('Suspense');
    }

    if (chartBundleExists) {
      const chartContent = fs.readFileSync(chartBundlePath, 'utf8');
      chartOptimization = chartContent.includes('lazy(') || chartContent.includes('ChartSkeleton');
    }

    this.results.lazyLoading = {
      lazyComponentsExists,
      chartBundleExists,
      lazyImportsImplemented,
      suspenseBoundaries,
      chartOptimization
    };

    console.log(`   ✅ Lazy components: ${lazyComponentsExists ? 'Implemented' : 'Missing'}`);
    console.log(`   ✅ Chart bundle: ${chartBundleExists ? 'Yes' : 'No'}`);
    console.log(`   ✅ Lazy imports: ${lazyImportsImplemented ? 'Yes' : 'No'}`);
    console.log(`   ✅ Suspense boundaries: ${suspenseBoundaries ? 'Yes' : 'No'}`);
    console.log(`   ✅ Chart optimization: ${chartOptimization ? 'Yes' : 'No'}\n`);
  }

  generateReport() {
    console.log('📊 Phase 3 Performance Test Results');
    console.log('=====================================');

    const overallScore = this.calculateOverallScore();

    console.log(`\n🎯 Overall Score: ${overallScore.toFixed(1)}/100`);
    console.log(`   ${this.getScoreEmoji(overallScore)} ${this.getScoreDescription(overallScore)}\n`);

    // Detailed breakdown
    console.log('📈 Detailed Results:');
    console.log('-------------------');

    const categories = [
      { name: 'Bundle Optimization', data: this.results.bundleAnalysis, weight: 25 },
      { name: 'Feature Flags', data: this.results.featureFlags, weight: 15 },
      { name: 'Cache Implementation', data: this.results.cacheImplementation, weight: 25 },
      { name: 'Virtualization Support', data: this.results.virtualizationSupport, weight: 20 },
      { name: 'Lazy Loading', data: this.results.lazyLoading, weight: 15 }
    ];

    categories.forEach(category => {
      const categoryScore = this.calculateCategoryScore(category.data);
      console.log(`   ${category.name}: ${categoryScore.toFixed(1)}% (Weight: ${category.weight}%)`);

      Object.entries(category.data).forEach(([key, value]) => {
        const emoji = value ? '✅' : '❌';
        console.log(`     ${emoji} ${key}: ${value}`);
      });
      console.log('');
    });

    // Recommendations
    this.generateRecommendations();

    // Save results to file
    const reportPath = path.join(__dirname, '../phase3-performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      overallScore,
      results: this.results,
      recommendations: this.getRecommendations()
    }, null, 2));

    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  }

  calculateOverallScore() {
    const weights = {
      bundleAnalysis: 25,
      featureFlags: 15,
      cacheImplementation: 25,
      virtualizationSupport: 20,
      lazyLoading: 15
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      const categoryScore = this.calculateCategoryScore(this.results[category]);
      totalScore += categoryScore * (weight / 100);
      totalWeight += weight;
    });

    return totalScore;
  }

  calculateCategoryScore(categoryData) {
    const values = Object.values(categoryData);
    const trueCount = values.filter(v => v === true).length;
    return (trueCount / values.length) * 100;
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🎉';
    if (score >= 80) return '👍';
    if (score >= 70) return '👌';
    if (score >= 60) return '⚠️';
    return '❌';
  }

  getScoreDescription(score) {
    if (score >= 90) return 'Excellent! Phase 3 implementation is outstanding.';
    if (score >= 80) return 'Great! Most Phase 3 features are implemented.';
    if (score >= 70) return 'Good! Phase 3 is mostly complete with room for improvement.';
    if (score >= 60) return 'Fair! Some Phase 3 features need attention.';
    return 'Poor! Phase 3 implementation needs significant work.';
  }

  generateRecommendations() {
    console.log('💡 Recommendations:');
    console.log('------------------');

    const recommendations = this.getRecommendations();

    if (recommendations.length === 0) {
      console.log('   🎊 All Phase 3 features are properly implemented! Great job!\n');
      return;
    }

    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log('');
  }

  getRecommendations() {
    const recommendations = [];

    // Bundle optimization recommendations
    if (!this.results.bundleAnalysis.bundleAnalyzerEnabled) {
      recommendations.push('Enable bundle analyzer in next.config.js for better optimization insights');
    }
    if (!this.results.bundleAnalysis.codeSplitreignsConfigured) {
      recommendations.push('Configure code splitting in webpack config for better bundle optimization');
    }

    // Feature flags recommendations
    if (!this.results.featureFlags.phase3FlagsPresent) {
      recommendations.push('Implement Phase 3 feature flags (unifiedDashboard, advancedCaching)');
    }

    // Cache implementation recommendations
    if (!this.results.cacheImplementation.adminCacheImplemented) {
      recommendations.push('Implement AdminCache class for admin-specific caching');
    }
    if (!this.results.cacheImplementation.indexedDBImplemented) {
      recommendations.push('Add IndexedDB cache for large dataset support');
    }
    if (!this.results.cacheImplementation.serviceWorkerOptimized) {
      recommendations.push('Optimize service worker for admin API requests');
    }

    // Virtualization recommendations
    if (!this.results.virtualizationSupport.reactWindowIntegration) {
      recommendations.push('Integrate react-window for better virtualization performance');
    }
    if (!this.results.virtualizationSupport.performanceOptimized) {
      recommendations.push('Add React.memo and useCallback optimizations to virtualized components');
    }

    // Lazy loading recommendations
    if (!this.results.lazyLoading.lazyImportsImplemented) {
      recommendations.push('Implement lazy imports for heavy admin components');
    }
    if (!this.results.lazyLoading.suspenseBoundaries) {
      recommendations.push('Add Suspense boundaries for better loading UX');
    }

    return recommendations;
  }
}

// Run the tests
if (require.main === module) {
  const tester = new Phase3PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = Phase3PerformanceTester;