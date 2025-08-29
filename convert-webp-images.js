const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertWebPImages() {
  console.log('Converting existing WebP images to JPG format...');
  
  const uploadsDir = path.join(__dirname, 'household-planet-backend', 'uploads');
  const directories = ['categories', 'products', 'temp'];
  
  let totalConverted = 0;
  
  for (const dir of directories) {
    const dirPath = path.join(uploadsDir, dir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory ${dir} does not exist, skipping...`);
      continue;
    }
    
    const files = fs.readdirSync(dirPath);
    const webpFiles = files.filter(file => file.toLowerCase().endsWith('.webp'));
    
    console.log(`Found ${webpFiles.length} WebP files in ${dir} directory`);
    
    for (const webpFile of webpFiles) {
      try {
        const webpPath = path.join(dirPath, webpFile);
        const jpgFile = webpFile.replace(/\.webp$/i, '.jpg');
        const jpgPath = path.join(dirPath, jpgFile);
        
        // Convert WebP to JPG
        await sharp(webpPath)
          .jpeg({ quality: 90 })
          .toFile(jpgPath);
        
        console.log(`✓ Converted ${webpFile} to ${jpgFile}`);
        
        // Remove the original WebP file
        fs.unlinkSync(webpPath);
        console.log(`✓ Removed original ${webpFile}`);
        
        totalConverted++;
      } catch (error) {
        console.error(`✗ Failed to convert ${webpFile}:`, error.message);
      }
    }
  }
  
  console.log(`\nConversion complete! Converted ${totalConverted} WebP images to JPG format.`);
  
  if (totalConverted > 0) {
    console.log('\nIMPORTANT: You may need to update your database records to reflect the new file extensions.');
    console.log('Run this SQL to update category images:');
    console.log("UPDATE categories SET image = REPLACE(image, '.webp', '.jpg') WHERE image LIKE '%.webp';");
    console.log('\nRun this SQL to update product images:');
    console.log("UPDATE products SET images = REPLACE(images, '.webp', '.jpg') WHERE images LIKE '%.webp%';");
  }
}

// Check if sharp is available
try {
  require('sharp');
  convertWebPImages().catch(console.error);
} catch (error) {
  console.log('Sharp is not installed. Installing it first...');
  console.log('Run: cd household-planet-backend && npm install sharp');
  console.log('Then run this script again.');
}