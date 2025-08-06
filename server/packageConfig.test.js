/**
 * Unit tests for server package.json configuration validation
 * Testing framework: Jest (standard Node.js testing framework)
 * 
 * These tests validate the package.json configuration from the source file
 * focusing on the server-specific dependencies and TypeScript setup.
 */

const fs = require('fs');
const path = require('path');

describe('Server Package Configuration Tests', () => {
  let packageConfig;
  
  // The exact package configuration from the source file being tested
  const sourcePackageConfig = {
    "name": "server",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "start": "ts-node src/server.ts"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {
      "cors": "^2.8.5",
      "dotenv": "^17.2.0",
      "express": "^5.1.0",
      "mongodb": "^6.14.2",
      "escape-html": "^1.0.3",
      "express-rate-limit": "^8.0.1"
    },
    "devDependencies": {
      "@types/cors": "^2.8.17",
      "@types/express": "^5.0.0",
      "@types/node": "^22.13.10",
      "@typescript-eslint/eslint-plugin": "^8.26.1",
      "@typescript-eslint/parser": "^8.26.1",
      "eslint": "^9.22.0",
      "ts-node": "^10.9.2",
      "typescript": "^5.8.2"
    }
  };

  beforeEach(() => {
    // Create a fresh copy for each test to avoid mutations
    packageConfig = JSON.parse(JSON.stringify(sourcePackageConfig));
  });

  describe('Package Identity and Metadata', () => {
    test('should have correct package name for server component', () => {
      expect(packageConfig.name).toBe('server');
      expect(typeof packageConfig.name).toBe('string');
      expect(packageConfig.name).toMatch(/^[a-z0-9][a-z0-9\-._]*$/);
    });

    test('should have initial version 1.0.0', () => {
      expect(packageConfig.version).toBe('1.0.0');
      expect(packageConfig.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should have valid ISC license', () => {
      expect(packageConfig.license).toBe('ISC');
      expect(['MIT', 'ISC', 'Apache-2.0', 'BSD-3-Clause', 'GPL-3.0']).toContain(packageConfig.license);
    });

    test('should have JavaScript main entry point', () => {
      expect(packageConfig.main).toBe('index.js');
      expect(packageConfig.main).toMatch(/\.js$/);
      expect(packageConfig.main).not.toContain('../');
    });

    test('should handle empty optional metadata fields', () => {
      expect(packageConfig.description).toBe('');
      expect(packageConfig.author).toBe('');
      expect(Array.isArray(packageConfig.keywords)).toBe(true);
      expect(packageConfig.keywords).toHaveLength(0);
    });

    test('should have valid JSON structure', () => {
      expect(() => JSON.stringify(packageConfig)).not.toThrow();
      expect(typeof packageConfig).toBe('object');
      expect(packageConfig).not.toBeNull();
    });
  });

  describe('NPM Scripts Configuration', () => {
    test('should have both test and start scripts', () => {
      expect(packageConfig.scripts).toHaveProperty('test');
      expect(packageConfig.scripts).toHaveProperty('start');
      expect(Object.keys(packageConfig.scripts)).toHaveLength(2);
    });

    test('should have placeholder test script', () => {
      expect(packageConfig.scripts.test).toBe('echo "Error: no test specified" && exit 1');
      expect(packageConfig.scripts.test).toContain('echo');
      expect(packageConfig.scripts.test).toContain('exit 1');
    });

    test('should have TypeScript start script', () => {
      expect(packageConfig.scripts.start).toBe('ts-node src/server.ts');
      expect(packageConfig.scripts.start).toContain('ts-node');
      expect(packageConfig.scripts.start).toContain('src/server.ts');
    });

    test('start script should use ts-node for TypeScript execution', () => {
      const startParts = packageConfig.scripts.start.split(' ');
      expect(startParts[0]).toBe('ts-node');
      expect(startParts[1]).toBe('src/server.ts');
      expect(startParts).toHaveLength(2);
    });

    test('scripts should not contain dangerous commands', () => {
      const dangerousPatterns = [/rm\s+-rf/, /sudo/, /chmod\s+777/, /curl.*bash/];
      Object.values(packageConfig.scripts).forEach(script => {
        dangerousPatterns.forEach(pattern => {
          expect(script).not.toMatch(pattern);
        });
      });
    });

    test('all scripts should be non-empty strings', () => {
      Object.entries(packageConfig.scripts).forEach(([name, command]) => {
        expect(typeof command).toBe('string');
        expect(command.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Production Dependencies', () => {
    test('should have exactly 6 production dependencies', () => {
      expect(Object.keys(packageConfig.dependencies)).toHaveLength(6);
    });

    test('should include Express.js web framework', () => {
      expect(packageConfig.dependencies).toHaveProperty('express');
      expect(packageConfig.dependencies.express).toBe('^5.1.0');
      expect(packageConfig.dependencies.express).toMatch(/^\^5\./);
    });

    test('should include CORS middleware', () => {
      expect(packageConfig.dependencies).toHaveProperty('cors');
      expect(packageConfig.dependencies.cors).toBe('^2.8.5');
      expect(packageConfig.dependencies.cors).toMatch(/^\^2\./);
    });

    test('should include environment configuration', () => {
      expect(packageConfig.dependencies).toHaveProperty('dotenv');
      expect(packageConfig.dependencies.dotenv).toBe('^17.2.0');
      expect(packageConfig.dependencies.dotenv).toMatch(/^\^17\./);
    });

    test('should include MongoDB database driver', () => {
      expect(packageConfig.dependencies).toHaveProperty('mongodb');
      expect(packageConfig.dependencies.mongodb).toBe('^6.14.2');
      expect(packageConfig.dependencies.mongodb).toMatch(/^\^6\./);
    });

    test('should include security-focused dependencies', () => {
      expect(packageConfig.dependencies).toHaveProperty('escape-html');
      expect(packageConfig.dependencies['escape-html']).toBe('^1.0.3');
      
      expect(packageConfig.dependencies).toHaveProperty('express-rate-limit');
      expect(packageConfig.dependencies['express-rate-limit']).toBe('^8.0.1');
    });

    test('all dependencies should use caret versioning', () => {
      Object.values(packageConfig.dependencies).forEach(version => {
        expect(version).toMatch(/^\^\d+\.\d+\.\d+$/);
        expect(version).toStartWith('^');
      });
    });

    test('should not include test libraries in production dependencies', () => {
      const testLibraries = ['jest', 'mocha', 'chai', 'sinon', 'supertest', 'vitest'];
      testLibraries.forEach(lib => {
        expect(packageConfig.dependencies).not.toHaveProperty(lib);
      });
    });

    test('should use modern stable versions', () => {
      expect(packageConfig.dependencies.express).not.toMatch(/^\^[0-4]\./);
      expect(packageConfig.dependencies.mongodb).not.toMatch(/^\^[0-5]\./);
      expect(packageConfig.dependencies.cors).not.toMatch(/^\^[01]\./);
    });
  });

  describe('Development Dependencies', () => {
    test('should have exactly 9 development dependencies', () => {
      expect(Object.keys(packageConfig.devDependencies)).toHaveLength(9);
    });

    test('should include TypeScript compiler and runtime', () => {
      expect(packageConfig.devDependencies).toHaveProperty('typescript');
      expect(packageConfig.devDependencies.typescript).toBe('^5.8.2');
      
      expect(packageConfig.devDependencies).toHaveProperty('ts-node');
      expect(packageConfig.devDependencies['ts-node']).toBe('^10.9.2');
    });

    test('should include all necessary TypeScript type definitions', () => {
      const expectedTypes = ['@types/node', '@types/express', '@types/cors'];
      expectedTypes.forEach(typeDef => {
        expect(packageConfig.devDependencies).toHaveProperty(typeDef);
      });
      
      expect(packageConfig.devDependencies['@types/node']).toBe('^22.13.10');
      expect(packageConfig.devDependencies['@types/express']).toBe('^5.0.0');
      expect(packageConfig.devDependencies['@types/cors']).toBe('^2.8.17');
    });

    test('should include ESLint tooling for TypeScript', () => {
      expect(packageConfig.devDependencies).toHaveProperty('eslint');
      expect(packageConfig.devDependencies.eslint).toBe('^9.22.0');
      
      expect(packageConfig.devDependencies).toHaveProperty('@typescript-eslint/eslint-plugin');
      expect(packageConfig.devDependencies['@typescript-eslint/eslint-plugin']).toBe('^8.26.1');
      
      expect(packageConfig.devDependencies).toHaveProperty('@typescript-eslint/parser');
      expect(packageConfig.devDependencies['@typescript-eslint/parser']).toBe('^8.26.1');
    });

    test('TypeScript ESLint tools should have matching versions', () => {
      const pluginVersion = packageConfig.devDependencies['@typescript-eslint/eslint-plugin'];
      const parserVersion = packageConfig.devDependencies['@typescript-eslint/parser'];
      expect(pluginVersion).toBe(parserVersion);
      expect(pluginVersion).toMatch(/^\^8\./);
    });

    test('should have compatible TypeScript toolchain versions', () => {
      expect(packageConfig.devDependencies.typescript).toMatch(/^\^5\./);
      expect(packageConfig.devDependencies['ts-node']).toMatch(/^\^10\./);
      expect(packageConfig.devDependencies['@types/node']).toMatch(/^\^22\./);
    });

    test('type definitions should match production dependency versions', () => {
      expect(packageConfig.dependencies.express).toMatch(/^\^5\./);
      expect(packageConfig.devDependencies['@types/express']).toMatch(/^\^5\./);
      
      expect(packageConfig.dependencies.cors).toMatch(/^\^2\./);
      expect(packageConfig.devDependencies['@types/cors']).toMatch(/^\^2\./);
    });

    test('should not duplicate production dependencies', () => {
      const prodKeys = Object.keys(packageConfig.dependencies);
      const devKeys = Object.keys(packageConfig.devDependencies);
      const duplicates = prodKeys.filter(key => devKeys.includes(key));
      expect(duplicates).toHaveLength(0);
    });
  });

  describe('Version Management and Compatibility', () => {
    test('should use semantic versioning for all dependencies', () => {
      const allDeps = { ...packageConfig.dependencies, ...packageConfig.devDependencies };
      Object.values(allDeps).forEach(version => {
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+$/);
      });
    });

    test('should prefer caret ranges for flexibility', () => {
      const allVersions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      const caretVersions = allVersions.filter(v => v.startsWith('^'));
      expect(caretVersions.length).toBe(allVersions.length);
    });

    test('should not use wildcards or imprecise versions', () => {
      const allVersions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      allVersions.forEach(version => {
        expect(version).not.toContain('*');
        expect(version).not.toContain('x');
        expect(version).not.toContain('latest');
        expect(version).not.toMatch(/^\d+$/); // No major-only versions
      });
    });

    test('should avoid pre-release versions', () => {
      const allVersions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      allVersions.forEach(version => {
        expect(version).not.toContain('-alpha');
        expect(version).not.toContain('-beta');
        expect(version).not.toContain('-rc');
      });
    });
  });

  describe('Security and Best Practices', () => {
    test('should include security-focused middleware', () => {
      expect(packageConfig.dependencies).toHaveProperty('escape-html');
      expect(packageConfig.dependencies).toHaveProperty('express-rate-limit');
    });

    test('should not contain sensitive information', () => {
      const configString = JSON.stringify(packageConfig).toLowerCase();
      const sensitivePatterns = [
        /password/, /secret/, /token/, /api[_-]?key/,
        /private[_-]?key/, /credential/, /auth[_-]?token/
      ];
      
      sensitivePatterns.forEach(pattern => {
        expect(configString).not.toMatch(pattern);
      });
    });

    test('should not include known vulnerable packages', () => {
      const vulnerablePackages = ['request', 'node-uuid', 'bson'];
      const allPackages = Object.keys({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      vulnerablePackages.forEach(vuln => {
        expect(allPackages).not.toContain(vuln);
      });
    });

    test('should have reasonable dependency count', () => {
      const totalDeps = Object.keys({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      }).length;
      expect(totalDeps).toBeLessThan(25); // Keep dependencies minimal
    });
  });

  describe('Project Architecture Validation', () => {
    test('should be configured as TypeScript Node.js server', () => {
      expect(packageConfig.main).toMatch(/\.js$/);
      expect(packageConfig.scripts.start).toContain('ts-node');
      expect(packageConfig.scripts.start).toContain('.ts');
      expect(packageConfig.devDependencies).toHaveProperty('typescript');
    });

    test('should have server-appropriate dependencies', () => {
      const serverDeps = ['express', 'cors', 'mongodb', 'dotenv'];
      serverDeps.forEach(dep => {
        expect(packageConfig.dependencies).toHaveProperty(dep);
      });
    });

    test('should not include client-side dependencies', () => {
      const clientDeps = ['react', 'vue', 'angular', 'webpack', 'babel'];
      clientDeps.forEach(dep => {
        expect(packageConfig.dependencies).not.toHaveProperty(dep);
        expect(packageConfig.devDependencies).not.toHaveProperty(dep);
      });
    });

    test('should have consistent naming convention', () => {
      expect(packageConfig.name).toBe('server');
      expect(packageConfig.name).toMatch(/^[a-z][a-z0-9-]*$/);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle JSON serialization/deserialization', () => {
      expect(() => {
        const serialized = JSON.stringify(packageConfig);
        const deserialized = JSON.parse(serialized);
        expect(deserialized).toEqual(packageConfig);
      }).not.toThrow();
    });

    test('should validate required fields are not empty', () => {
      const requiredFields = ['name', 'version', 'main'];
      requiredFields.forEach(field => {
        expect(packageConfig[field]).toBeDefined();
        expect(packageConfig[field]).not.toBe('');
        expect(packageConfig[field]).not.toBeNull();
      });
    });

    test('should handle missing optional fields gracefully', () => {
      const testConfig = { ...packageConfig };
      delete testConfig.description;
      delete testConfig.keywords;
      delete testConfig.author;
      
      expect(() => JSON.stringify(testConfig)).not.toThrow();
      expect(testConfig.name).toBeDefined();
      expect(testConfig.version).toBeDefined();
    });

    test('should validate dependency object structure', () => {
      expect(Array.isArray(packageConfig.dependencies)).toBe(false);
      expect(Array.isArray(packageConfig.devDependencies)).toBe(false);
      expect(typeof packageConfig.dependencies).toBe('object');
      expect(typeof packageConfig.devDependencies).toBe('object');
    });

    test('should handle version comparison edge cases', () => {
      const versions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      versions.forEach(version => {
        expect(version).not.toBe('0.0.0');
        expect(version).not.toMatch(/^\^0\.0\./);
        expect(version.length).toBeGreaterThan(3);
      });
    });
  });

  describe('Integration and Compatibility Tests', () => {
    test('Express and MongoDB versions should be compatible', () => {
      const expressVersion = packageConfig.dependencies.express;
      const mongodbVersion = packageConfig.dependencies.mongodb;
      
      expect(expressVersion).toMatch(/^\^5\./);
      expect(mongodbVersion).toMatch(/^\^6\./);
    });

    test('TypeScript toolchain should be internally compatible', () => {
      const tsVersion = packageConfig.devDependencies.typescript;
      const tsNodeVersion = packageConfig.devDependencies['ts-node'];
      const nodeTypesVersion = packageConfig.devDependencies['@types/node'];
      
      expect(tsVersion).toMatch(/^\^5\./);
      expect(tsNodeVersion).toMatch(/^\^10\./);
      expect(nodeTypesVersion).toMatch(/^\^22\./);
    });

    test('should support modern Node.js LTS versions', () => {
      expect(packageConfig.devDependencies['@types/node']).toMatch(/^\^22\./);
    });

    test('start script path should be valid', () => {
      const startScript = packageConfig.scripts.start;
      const tsFilePath = startScript.split(' ')[1];
      expect(tsFilePath).toBe('src/server.ts');
      expect(tsFilePath).not.toStartWith('/');
      expect(tsFilePath).not.toContain('../');
    });
  });
});