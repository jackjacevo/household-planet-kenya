const fs = require('fs');

// Fix specific syntax errors caused by regex replacement
const fixes = [
  {
    file: 'src/app/admin/orders/page.tsx',
    fixes: [
      {
        search: 'returnReq.(order as any).user',
        replace: '(returnReq.order as any).user'
      }
    ]
  },
  {
    file: 'src/app/admin/payments/page.tsx',
    fixes: [
      {
        search: '.(order as any).',
        replace: '((order as any)).'
      }
    ]
  },
  {
    file: 'src/app/checkout/page.tsx',
    fixes: [
      {
        search: '.(error as Error).',
        replace: '((error as Error)).'
      }
    ]
  },
  {
    file: 'src/components/admin/ImageUpload.tsx',
    fixes: [
      {
        search: '.(error as Error).',
        replace: '((error as Error)).'
      }
    ]
  }
];

fixes.forEach(({ file, fixes: fileFixes }) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    fileFixes.forEach(({ search, replace }) => {
      if (content.includes(search)) {
        content = content.replaceAll(search, replace);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('Syntax error fixes completed!');