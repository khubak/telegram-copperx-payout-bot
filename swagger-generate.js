const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Directories to scan for DTOs and controllers
const directories = [
  'src/modules/auth',
  'src/modules/wallet',
  'src/modules/transfer',
  'src/modules/notification',
  'src/modules/telegram',
];

// Function to find all TypeScript files in directories
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && 
              (file.includes('.dto.ts') || 
               file.includes('.controller.ts') || 
               file.includes('.entity.ts') || 
               file.includes('.interface.ts'))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to add Swagger decorators to DTOs
function addSwaggerDecorators(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse the TypeScript file
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  let updatedContent = fileContent;
  let hasChanges = false;
  
  // Check if file already has Swagger imports
  const hasSwaggerImport = fileContent.includes('@nestjs/swagger');
  
  // Add Swagger imports if needed
  if (!hasSwaggerImport && 
      (filePath.includes('.dto.ts') || 
       filePath.includes('.controller.ts') || 
       filePath.includes('.entity.ts'))) {
    updatedContent = `import { ApiProperty, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';\n${updatedContent}`;
    hasChanges = true;
  }
  
  // Process classes in DTOs
  if (filePath.includes('.dto.ts') || filePath.includes('.entity.ts')) {
    // Find class declarations
    sourceFile.forEachChild(node => {
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        
        // Process class properties
        node.members.forEach(member => {
          if (ts.isPropertyDeclaration(member) && member.name) {
            const propertyName = member.name.getText(sourceFile);
            const propertyType = member.type ? member.type.getText(sourceFile) : 'any';
            
            // Check if property already has @ApiProperty decorator
            const decorators = ts.getDecorators(member);
            const hasApiProperty = decorators && decorators.some(d => 
              d.expression.getText(sourceFile).includes('ApiProperty')
            );
            
            if (!hasApiProperty) {
              // Get property position
              const pos = member.getStart(sourceFile);
              const indent = ' '.repeat(2);  // Assuming 2-space indentation
              
              // Add @ApiProperty decorator
              const decorator = `${indent}@ApiProperty({ description: '${propertyName}' })\n${indent}`;
              updatedContent = updatedContent.slice(0, pos) + decorator + updatedContent.slice(pos);
              hasChanges = true;
            }
          }
        });
      }
    });
  }
  
  // Process controllers
  if (filePath.includes('.controller.ts')) {
    // Find class declarations
    sourceFile.forEachChild(node => {
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        
        // Check if class already has @ApiTags decorator
        const decorators = ts.getDecorators(node);
        const hasApiTags = decorators && decorators.some(d => 
          d.expression.getText(sourceFile).includes('ApiTags')
        );
        
        if (!hasApiTags) {
          // Get class position
          const pos = node.getStart(sourceFile);
          
          // Determine tag from file path
          let tag = 'api';
          if (filePath.includes('auth')) tag = 'auth';
          else if (filePath.includes('wallet')) tag = 'wallet';
          else if (filePath.includes('transfer')) tag = 'transfer';
          else if (filePath.includes('notification')) tag = 'notification';
          else if (filePath.includes('telegram')) tag = 'telegram';
          
          // Add @ApiTags decorator
          const decorator = `@ApiTags('${tag}')\n`;
          updatedContent = updatedContent.slice(0, pos) + decorator + updatedContent.slice(pos);
          hasChanges = true;
        }
        
        // Process methods
        node.members.forEach(member => {
          if (ts.isMethodDeclaration(member) && member.name) {
            const methodName = member.name.getText(sourceFile);
            
            // Check if method already has @ApiOperation decorator
            const methodDecorators = ts.getDecorators(member);
            const hasApiOperation = methodDecorators && methodDecorators.some(d => 
              d.expression.getText(sourceFile).includes('ApiOperation')
            );
            
            if (!hasApiOperation) {
              // Get method position
              const pos = member.getStart(sourceFile);
              const indent = ' '.repeat(2);  // Assuming 2-space indentation
              
              // Add @ApiOperation decorator
              const decorator = `${indent}@ApiOperation({ summary: '${methodName}' })\n${indent}`;
              updatedContent = updatedContent.slice(0, pos) + decorator + updatedContent.slice(pos);
              hasChanges = true;
            }
          }
        });
      }
    });
  }
  
  // Save changes if needed
  if (hasChanges) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Main function
function main() {
  console.log('Generating Swagger documentation...');
  
  // Find all TypeScript files
  let allFiles = [];
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = findTsFiles(dir);
      allFiles = [...allFiles, ...files];
    }
  });
  
  console.log(`Found ${allFiles.length} files to process`);
  
  // Process each file
  allFiles.forEach(file => {
    try {
      addSwaggerDecorators(file);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });
  
  console.log('Swagger documentation generation completed');
}

main(); 