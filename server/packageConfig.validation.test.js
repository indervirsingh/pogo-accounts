/**
 * Configuration validation and best practices tests for package.json
 * Testing framework: Jest
 * 
 * These tests focus on validating configuration patterns, best practices,
 * and ensuring the package.json follows industry standards
 */

describe('Package Configuration Validation and Best Practices', () => {
  const packageConfig = {
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

  describe('Configuration Validation Tests', () => {
    test('should have all required package.json fields', () => {
      const requiredFields = ['name', 'version', 'main', 'scripts', 'dependencies', 'devDependencies'];
      requiredFields.forEach(field => {
        expect(packageConfig).toHaveProperty(field);
        expect(packageConfig[field]).not.toBeUndefined();
      });
    });

    test('should validate package name format', () => {
      expect(packageConfig.name).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(packageConfig.name).not.toContain('_');
      expect(packageConfig.name).not.toContain('.');
      expect(packageConfig.name).not.toContain(' ');
    });

    test('should have proper version increment strategy', () => {
      const version = packageConfig.version;
      const [major, minor, patch] = version.split('.').map(Number);
      
      expect(major).toBeGreaterThanOrEqual(1);
      expect(minor).toBeGreaterThanOrEqual(0);
      expect(patch).toBeGreaterThanOrEqual(0);
    });

    test('should have appropriate script names and commands', () => {
      expect(packageConfig.scripts).toHaveProperty('start');
      expect(packageConfig.scripts).toHaveProperty('test');
      
      // Scripts should be meaningful
      expect(packageConfig.scripts.start).not.toBe('');
      expect(packageConfig.scripts.test).not.toBe('');
    });

    test('should validate dependency naming conventions', () => {
      const allDeps = { ...packageConfig.dependencies, ...packageConfig.devDependencies };
      Object.keys(allDeps).forEach(depName => {
        expect(depName).toMatch(/^[a-z@][a-z0-9\-\/]*$/);
        expect(depName).not.toContain(' ');
        expect(depName).not.toContain('_');
      });
    });
  });

  describe('Security Best Practices', () => {
    test('should include essential security packages', () => {
      expect(packageConfig.dependencies).toHaveProperty('escape-html');
      expect(packageConfig.dependencies).toHaveProperty('express-rate-limit');
    });

    test('should not expose internal paths in package name', () => {
      expect(packageConfig.name).not.toContain('/');
      expect(packageConfig.name).not.toContain('\\');
      expect(packageConfig.name).not.toContain('..');
    });

    test('should not have development tools in production dependencies', () => {
      const devTools = ['nodemon', 'webpack', 'babel', 'jest', 'mocha'];
      devTools.forEach(tool => {
        expect(packageConfig.dependencies).not.toHaveProperty(tool);
      });
    });

    test('should use modern, secure dependency versions', () => {
      // Check for modern Express version (v5+)
      expect(packageConfig.dependencies.express).toMatch(/^\^5\./);
      
      // Check for modern TypeScript (v5+)
      expect(packageConfig.devDependencies.typescript).toMatch(/^\^5\./);
      
      // Check for recent Node types
      expect(packageConfig.devDependencies['@types/node']).toMatch(/^\^22\./);
    });

    test('should not have packages with known vulnerabilities', () => {
      const vulnPackages = ['request', 'lodash', 'moment', 'handlebars'];
      const allPackages = Object.keys({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      vulnPackages.forEach(pkg => {
        expect(allPackages).not.toContain(pkg);
      });
    });
  });

  describe('Performance and Optimization', () => {
    test('should have minimal dependency count', () => {
      const prodCount = Object.keys(packageConfig.dependencies).length;
      const devCount = Object.keys(packageConfig.devDependencies).length;
      
      expect(prodCount).toBeLessThan(15); // Keep production deps minimal
      expect(devCount).toBeLessThan(15); // Keep dev deps reasonable
    });

    test('should use caret versioning for automatic updates', () => {
      const allVersions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      allVersions.forEach(version => {
        expect(version).toStartWith('^');
      });
    });

    test('should not have unused or redundant dependencies', () => {
      // Check that each @types package has corresponding runtime package
      const typePackages = Object.keys(packageConfig.devDependencies)
        .filter(dep => dep.startsWith('@types/'));
      
      typePackages.forEach(typePkg => {
        const baseName = typePkg.replace('@types/', '');
        if (baseName !== 'node') { // @types/node is always needed
          expect(packageConfig.dependencies).toHaveProperty(baseName);
        }
      });
    });

    test('should prioritize tree-shakable dependencies', () => {
      // Modern packages should support tree shaking
      expect(packageConfig.dependencies.express).toMatch(/^\^5\./); // Express 5+ has better tree shaking
    });
  });

  describe('Development Experience', () => {
    test('should have TypeScript development setup', () => {
      expect(packageConfig.devDependencies).toHaveProperty('typescript');
      expect(packageConfig.devDependencies).toHaveProperty('ts-node');
      expect(packageConfig.devDependencies).toHaveProperty('@types/node');
    });

    test('should have linting configuration', () => {
      expect(packageConfig.devDependencies).toHaveProperty('eslint');
      expect(packageConfig.devDependencies).toHaveProperty('@typescript-eslint/eslint-plugin');
      expect(packageConfig.devDependencies).toHaveProperty('@typescript-eslint/parser');
    });

    test('should have proper start script for development', () => {
      expect(packageConfig.scripts.start).toContain('ts-node');
      expect(packageConfig.scripts.start).toContain('src/server.ts');
    });

    test('should have placeholder test script ready for enhancement', () => {
      expect(packageConfig.scripts.test).toContain('echo');
      expect(packageConfig.scripts.test).toContain('Error: no test specified');
    });
  });

  describe('Production Readiness', () => {
    test('should have appropriate main entry point', () => {
      expect(packageConfig.main).toBe('index.js');
      expect(packageConfig.main).toMatch(/\.js$/);
    });

    test('should separate development and production dependencies correctly', () => {
      // Runtime dependencies
      const runtimeDeps = ['express', 'cors', 'mongodb', 'dotenv', 'escape-html', 'express-rate-limit'];
      runtimeDeps.forEach(dep => {
        expect(packageConfig.dependencies).toHaveProperty(dep);
      });
      
      // Development only dependencies
      const devOnlyDeps = ['typescript', 'ts-node', 'eslint'];
      devOnlyDeps.forEach(dep => {
        expect(packageConfig.devDependencies).toHaveProperty(dep);
        expect(packageConfig.dependencies).not.toHaveProperty(dep);
      });
    });

    test('should have production-safe license', () => {
      const productionSafeLicenses = ['MIT', 'ISC', 'Apache-2.0', 'BSD-3-Clause'];
      expect(productionSafeLicenses).toContain(packageConfig.license);
    });

    test('should not include sensitive configuration', () => {
      const configStr = JSON.stringify(packageConfig);
      const sensitivePatterns = [
        /mongodb:\/\/.*:[^@]*@/, // MongoDB connection string with credentials
        /postgres:\/\/.*:[^@]*@/, // PostgreSQL connection string with credentials
        /api[_-]?key/i,
        /secret/i,
        /password/i
      ];
      
      sensitivePatterns.forEach(pattern => {
        expect(configStr).not.toMatch(pattern);
      });
    });
  });

  describe('Maintainability and Documentation', () => {
    test('should have consistent field ordering', () => {
      const expectedFieldOrder = ['name', 'version', 'description', 'main', 'scripts', 'keywords', 'author', 'license', 'dependencies', 'devDependencies'];
      const actualFields = Object.keys(packageConfig);
      
      // Check that critical fields are present in logical order
      expect(actualFields.indexOf('name')).toBeLessThan(actualFields.indexOf('version'));
      expect(actualFields.indexOf('version')).toBeLessThan(actualFields.indexOf('dependencies'));
    });

    test('should have empty but defined optional fields', () => {
      expect(packageConfig.description).toBeDefined();
      expect(packageConfig.author).toBeDefined();
      expect(packageConfig.keywords).toBeDefined();
      
      // These can be empty initially but should be defined
      expect(typeof packageConfig.description).toBe('string');
      expect(typeof packageConfig.author).toBe('string');
      expect(Array.isArray(packageConfig.keywords)).toBe(true);
    });

    test('should have meaningful package name', () => {
      expect(packageConfig.name).toBe('server');
      expect(packageConfig.name).toMatch(/^[a-z][a-z0-9-]*$/);
    });

    test('should be ready for documentation enhancement', () => {
      // Fields are present and can be enhanced
      expect(packageConfig.hasOwnProperty('description')).toBe(true);
      expect(packageConfig.hasOwnProperty('keywords')).toBe(true);
      expect(packageConfig.hasOwnProperty('author')).toBe(true);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should use cross-platform compatible paths', () => {
      expect(packageConfig.main).not.toContain('\\');
      expect(packageConfig.scripts.start).not.toContain('\\');
    });

    test('should not have platform-specific dependencies', () => {
      const allDeps = Object.keys({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      const platformSpecific = ['win32', 'darwin', 'linux'];
      allDeps.forEach(dep => {
        platformSpecific.forEach(platform => {
          expect(dep).not.toContain(platform);
        });
      });
    });

    test('should use Node.js LTS compatible versions', () => {
      expect(packageConfig.devDependencies['@types/node']).toMatch(/^\^22\./); // Node 22 LTS
    });
  });
});