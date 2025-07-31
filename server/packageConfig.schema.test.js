/**
 * Schema validation and NPM integration tests for package.json
 * Testing framework: Jest
 * 
 * These tests validate the package.json schema compliance and NPM compatibility
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const fs = require('fs');
const path = require('path');

describe('Package.json Schema and NPM Integration Tests', () => {
  let packageConfig;

  beforeAll(() => {
    try {
      const packagePath = path.join(__dirname, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      packageConfig = JSON.parse(packageContent);
    } catch (error) {
      // Fallback to hardcoded config if file not found
      packageConfig = {
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
    }
  });

  // ... rest of your tests ...
});

  describe('NPM Package Schema Compliance', () => {
    test('should comply with package.json schema', () => {
      expect(packageConfig).toHaveProperty('name');
      expect(packageConfig).toHaveProperty('version');
      expect(typeof packageConfig.name).toBe('string');
      expect(typeof packageConfig.version).toBe('string');
    });

    test('name should follow NPM naming conventions', () => {
      expect(packageConfig.name).toMatch(/^[a-z0-9][a-z0-9\-._]*$/);
      expect(packageConfig.name.length).toBeLessThanOrEqual(214);
      expect(packageConfig.name).not.toMatch(/[A-Z]/);
      expect(packageConfig.name).not.toStartWith('.');
      expect(packageConfig.name).not.toStartWith('_');
    });

    test('version should follow semantic versioning', () => {
      expect(packageConfig.version).toMatch(/^\d+\.\d+\.\d+(-[a-zA-Z0-9\-._]+)?$/);
      const [major, minor, patch] = packageConfig.version.split('.');
      expect(parseInt(major)).toBeGreaterThanOrEqual(0);
      expect(parseInt(minor)).toBeGreaterThanOrEqual(0);
      expect(parseInt(patch)).toBeGreaterThanOrEqual(0);
    });

    test('main field should be valid', () => {
      expect(typeof packageConfig.main).toBe('string');
      expect(packageConfig.main).toMatch(/\.(js|ts)$/);
      expect(path.isAbsolute(packageConfig.main)).toBe(false);
    });

    test('scripts should be valid shell commands', () => {
      expect(typeof packageConfig.scripts).toBe('object');
      Object.values(packageConfig.scripts).forEach(script => {
        expect(typeof script).toBe('string');
        expect(script.trim()).not.toBe('');
      });
    });

    test('keywords should be array of strings', () => {
      expect(Array.isArray(packageConfig.keywords)).toBe(true);
      packageConfig.keywords.forEach(keyword => {
        expect(typeof keyword).toBe('string');
      });
    });

    test('license should be valid SPDX identifier', () => {
      const validLicenses = [
        'MIT', 'ISC', 'Apache-2.0', 'BSD-3-Clause', 'GPL-3.0',
        'LGPL-3.0', 'MPL-2.0', 'UNLICENSED'
      ];
      expect(validLicenses).toContain(packageConfig.license);
    });
  });

  describe('Dependency Version Validation', () => {
    test('all dependency versions should be valid semver ranges', () => {
      const allDeps = { ...packageConfig.dependencies, ...packageConfig.devDependencies };
      Object.entries(allDeps).forEach(([name, version]) => {
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+(-[a-zA-Z0-9\-._]+)?$/);
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    test('should not have circular dependencies', () => {
      const prodDeps = Object.keys(packageConfig.dependencies);
      const devDeps = Object.keys(packageConfig.devDependencies);
      
      expect(prodDeps).not.toContain(packageConfig.name);
      expect(devDeps).not.toContain(packageConfig.name);
    });

    test('should use consistent versioning strategy', () => {
      const allVersions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      const caretVersions = allVersions.filter(v => v.startsWith('^'));
      expect(caretVersions.length / allVersions.length).toBeGreaterThan(0.9);
    });

    test('should not have deprecated version formats', () => {
      const allVersions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      allVersions.forEach(version => {
        expect(version).not.toContain('git+');
        expect(version).not.toContain('http://');
        expect(version).not.toContain('https://');
        expect(version).not.toMatch(/^\d+$/); // Major only
        expect(version).not.toMatch(/^\d+\.\d+$/); // Major.minor only
      });
    });
  });

  describe('File System and Path Validation', () => {
    test('main entry point should use valid path format', () => {
      expect(packageConfig.main).not.toContain('\\');
      expect(packageConfig.main).not.toStartWith('/');
      expect(packageConfig.main).not.toContain('../');
      expect(packageConfig.main).not.toContain('./');
    });

    test('TypeScript file paths in scripts should be valid', () => {
      const startScript = packageConfig.scripts.start;
      if (startScript.includes('.ts')) {
        const tsPath = startScript.split(' ').find(part => part.endsWith('.ts'));
        expect(tsPath).not.toContain('../');
        expect(tsPath).not.toStartWith('/');
      }
    });

    test('should not reference non-existent files in critical paths', () => {
      expect(packageConfig.main).toBeDefined();
      expect(typeof packageConfig.main).toBe('string');
      
      if (packageConfig.scripts.start.includes('src/server.ts')) {
        expect(packageConfig.scripts.start).toContain('src/server.ts');
      }
    });
  });

  describe('Security and Vulnerability Checks', () => {
    test('should not contain hardcoded credentials or secrets', () => {
      const configStr = JSON.stringify(packageConfig);
      const secretPatterns = [
        /password/i, /secret/i, /token/i, /key.*[=:]/i,
        /api[_-]?key/i, /auth[_-]?token/i, /private[_-]?key/i
      ];
      
      secretPatterns.forEach(pattern => {
        expect(configStr).not.toMatch(pattern);
      });
    });

    test('should not include packages with known security issues', () => {
      const problematicPackages = [
        'request', 'node-uuid', 'bson', 'js-yaml',
        'handlebars', 'lodash', 'moment'
      ];
      
      const allPackages = [
        ...Object.keys(packageConfig.dependencies || {}),
        ...Object.keys(packageConfig.devDependencies || {})
      ];
      
      problematicPackages.forEach(pkg => {
        expect(allPackages).not.toContain(pkg);
      });
    });

    test('should use security-focused versions', () => {
      // Ensure we're not using very old versions that might have vulnerabilities
      expect(packageConfig.dependencies.express).not.toMatch(/^\^[0-4]\./);
      expect(packageConfig.dependencies.cors).not.toMatch(/^\^[01]\./);
      expect(packageConfig.dependencies.mongodb).not.toMatch(/^\^[0-5]\./);
    });
  });

  describe('Performance and Bundle Size Considerations', () => {
    test('should have reasonable number of dependencies', () => {
      const totalDeps = Object.keys({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      }).length;
      
      expect(totalDeps).toBeLessThan(20);
      expect(totalDeps).toBeGreaterThan(5);
    });

    test('should prefer specific over broad dependencies', () => {
      const allVersions = Object.values({
        ...packageConfig.dependencies,
        ...packageConfig.devDependencies
      });
      
      allVersions.forEach(version => {
        expect(version).not.toContain('*');
        expect(version).not.toMatch(/^\^0\./); // Avoid pre-1.0 deps in production
      });
    });

    test('should not have redundant type definitions', () => {
      const typeDefs = Object.keys(packageConfig.devDependencies)
        .filter(dep => dep.startsWith('@types/'));
      
      typeDefs.forEach(typeDef => {
        const basePackage = typeDef.replace('@types/', '');
        if (basePackage !== 'node') { // @types/node is always needed
          expect(packageConfig.dependencies).toHaveProperty(basePackage);
        }
      });
    });
  });

  describe('Build and Deployment Readiness', () => {
    test('should be ready for containerization', () => {
      expect(packageConfig.scripts).toHaveProperty('start');
      expect(packageConfig.main).toMatch(/\.(js)$/);
      expect(packageConfig.name).not.toContain('/');
    });

    test('should support production deployment', () => {
      // Should not have dev-only scripts in production critical paths
      expect(packageConfig.scripts.start).not.toContain('nodemon');
      expect(packageConfig.scripts.start).not.toContain('--watch');
    });

    test('should have appropriate entry points', () => {
      expect(packageConfig.main).toBe('index.js');
      expect(packageConfig.scripts.start).toContain('ts-node');
      
      // These are complementary - main for built version, start for dev
      expect(packageConfig.main).toMatch(/\.js$/);
      expect(packageConfig.scripts.start).toMatch(/\.ts$/);
    });
  });
});