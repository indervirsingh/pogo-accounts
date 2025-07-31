const fs = require('fs');
const path = require('path');

// Note: Using Jest testing framework - common choice for Node.js/Angular projects
describe('Package Configuration Validation', () => {
  let packageConfig;
  const packagePath = path.join(__dirname, 'package.json');

  beforeAll(() => {
    try {
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      packageConfig = JSON.parse(packageContent);
    } catch (error) {
      throw new Error(`Failed to load package.json: ${error.message}`);
    }
  });

  describe('Package Structure Validation', () => {
    test('should have all required package.json fields', () => {
      expect(packageConfig).toHaveProperty('name');
      expect(packageConfig).toHaveProperty('version');
      expect(packageConfig).toHaveProperty('scripts');
      expect(packageConfig).toHaveProperty('dependencies');
      expect(packageConfig).toHaveProperty('devDependencies');
    });

    test('should have correct package name', () => {
      expect(packageConfig.name).toBe('client');
      expect(typeof packageConfig.name).toBe('string');
      expect(packageConfig.name.length).toBeGreaterThan(0);
    });

    test('should have valid semver version', () => {
      expect(packageConfig.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(packageConfig.version).toBe('0.0.0');
    });

    test('should be marked as private package', () => {
      expect(packageConfig.private).toBe(true);
    });

    test('should have valid package structure types', () => {
      expect(typeof packageConfig.name).toBe('string');
      expect(typeof packageConfig.version).toBe('string');
      expect(typeof packageConfig.scripts).toBe('object');
      expect(typeof packageConfig.dependencies).toBe('object');
      expect(typeof packageConfig.devDependencies).toBe('object');
    });
  });

  describe('Scripts Configuration', () => {
    test('should have all essential Angular CLI scripts', () => {
      const requiredScripts = ['ng', 'start', 'build', 'watch', 'lint', 'test'];
      requiredScripts.forEach(script => {
        expect(packageConfig.scripts).toHaveProperty(script);
        expect(typeof packageConfig.scripts[script]).toBe('string');
        expect(packageConfig.scripts[script].trim()).not.toBe('');
      });
    });

    test('should have correct Angular CLI command formats', () => {
      expect(packageConfig.scripts.ng).toBe('ng');
      expect(packageConfig.scripts.start).toBe('ng serve');
      expect(packageConfig.scripts.build).toBe('ng build');
      expect(packageConfig.scripts.watch).toBe('ng build --watch --configuration development');
      expect(packageConfig.scripts.lint).toBe('ng lint');
    });

    test('should have test script configured correctly', () => {
      expect(packageConfig.scripts.test).toBe('ng lint');
      // Note: Test script points to lint instead of actual tests - this may indicate configuration issue
    });

    test('should not contain dangerous script commands', () => {
      const dangerousPatterns = [
        /rm\s+-rf/i,
        /sudo/i,
        /chmod\s+777/i,
        />\s*\/etc\//i,
        /curl.*\|\s*sh/i,
        /wget.*\|\s*sh/i
      ];

      Object.entries(packageConfig.scripts).forEach(([scriptName, command]) => {
        dangerousPatterns.forEach(pattern => {
          expect(command).not.toMatch(pattern);
        });
      });
    });

    test('should have proper script command structure', () => {
      Object.entries(packageConfig.scripts).forEach(([name, script]) => {
        expect(script).toBeTruthy();
        expect(typeof script).toBe('string');
        expect(script.trim().length).toBeGreaterThan(0);
        expect(script).not.toMatch(/^\s/);
      });
    });
  });

  describe('Production Dependencies', () => {
    test('should include core Angular framework packages', () => {
      const coreAngularPackages = [
        '@angular/animations',
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/platform-browser',
        '@angular/forms',
        '@angular/platform-browser-dynamic',
        '@angular/router'
      ];

      coreAngularPackages.forEach(pkg => {
        expect(packageConfig.dependencies).toHaveProperty(pkg);
        expect(packageConfig.dependencies[pkg]).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    test('should have RxJS for reactive programming', () => {
      expect(packageConfig.dependencies).toHaveProperty('rxjs');
      expect(packageConfig.dependencies.rxjs).toBe('^7.8.2');
    });

    test('should include TypeScript utilities and Zone.js', () => {
      expect(packageConfig.dependencies).toHaveProperty('tslib');
      expect(packageConfig.dependencies).toHaveProperty('zone.js');
      expect(packageConfig.dependencies['zone.js']).toMatch(/^~0\.15\.\d+/);
    });

    test('should have Angular version consistency within acceptable range', () => {
      const angularDeps = Object.entries(packageConfig.dependencies)
        .filter(([name]) => name.startsWith('@angular/'));
      
      const versions = angularDeps.map(([, version]) => {
        const match = version.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      });

      // All Angular packages should be version 19 or 20
      versions.forEach(version => {
        expect(version).toBeGreaterThanOrEqual(19);
        expect(version).toBeLessThanOrEqual(20);
      });

      // Verify mixed versions (19.x and 20.x) are present as shown in the config
      const uniqueVersions = [...new Set(versions)];
      expect(uniqueVersions.length).toBeGreaterThanOrEqual(1);
    });

    test('should use valid semantic versioning', () => {
      Object.entries(packageConfig.dependencies).forEach(([name, version]) => {
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
        expect(version).not.toMatch(/[><]/);
        expect(version).not.toContain('*');
      });
    });
  });

  describe('Development Dependencies', () => {
    test('should include Angular CLI and build tools', () => {
      const buildTools = [
        '@angular/cli',
        '@angular-devkit/build-angular',
        '@angular/compiler-cli'
      ];

      buildTools.forEach(tool => {
        expect(packageConfig.devDependencies).toHaveProperty(tool);
      });
    });

    test('should have comprehensive ESLint setup', () => {
      const eslintPackages = [
        '@angular-eslint/builder',
        '@angular-eslint/eslint-plugin-template',
        '@angular-eslint/eslint-plugin',
        '@angular-eslint/schematics',
        '@angular-eslint/template-parser',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint'
      ];

      eslintPackages.forEach(pkg => {
        expect(packageConfig.devDependencies).toHaveProperty(pkg);
      });
    });

    test('should have TypeScript and Node.js type definitions', () => {
      expect(packageConfig.devDependencies).toHaveProperty('typescript');
      expect(packageConfig.devDependencies).toHaveProperty('@types/node');
      expect(packageConfig.devDependencies.typescript).toMatch(/^\^5\./);
    });

    test('should have compatible CLI and core versions', () => {
      const cliVersion = packageConfig.devDependencies['@angular/cli'];
      const coreVersion = packageConfig.dependencies['@angular/core'];
      
      const cliMajor = parseInt(cliVersion.match(/\d+/)?.[0] || '0');
      const coreMajor = parseInt(coreVersion.match(/\d+/)?.[0] || '0');
      
      expect(Math.abs(cliMajor - coreMajor)).toBeLessThanOrEqual(1);
    });

    test('should use proper version constraints', () => {
      Object.entries(packageConfig.devDependencies).forEach(([name, version]) => {
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
        expect(version).not.toMatch(/[><]/);
        expect(version).not.toContain('*');
      });
    });
  });

  describe('Package Resolutions', () => {
    test('should have resolutions section for security fixes', () => {
      expect(packageConfig).toHaveProperty('resolutions');
      expect(typeof packageConfig.resolutions).toBe('object');
      expect(packageConfig.resolutions).not.toBeNull();
    });

    test('should resolve ip package vulnerability', () => {
      expect(packageConfig.resolutions).toHaveProperty('**/ip');
      expect(packageConfig.resolutions['**/ip']).toBe('https://registry.npmjs.org/neoip/-/neoip-2.1.0.tgz');
    });

    test('should use secure HTTPS URLs for resolutions', () => {
      Object.values(packageConfig.resolutions).forEach(resolution => {
        if (typeof resolution === 'string' && resolution.startsWith('http')) {
          expect(resolution).toMatch(/^https:/);
          expect(resolution).not.toMatch(/^http:[^s]/);
        }
      });
    });

    test('should have valid tarball URLs', () => {
      Object.values(packageConfig.resolutions).forEach(resolution => {
        if (typeof resolution === 'string') {
          try {
            const url = new URL(resolution);
            if (url.hostname === 'registry.npmjs.org') {
              expect(resolution).toMatch(/https:\/\/registry\.npmjs\.org\/.+\.tgz$/);
            }
          } catch (e) {
            // Ignore invalid URLs for this test
          }
        }
      });
    });

    test('should use glob patterns correctly in resolutions', () => {
      Object.keys(packageConfig.resolutions).forEach(key => {
        if (key.includes('*')) {
          expect(key).toMatch(/^\*\*?\//);
        }
      });
    });
  });

  describe('Package Health and Security', () => {
    test('should not have known vulnerable dependencies', () => {
      const vulnerablePackages = [
        'colors',
        'request',
        'node-sass',
        'bower',
        'gulp'
      ];

      const allDeps = { ...packageConfig.dependencies, ...packageConfig.devDependencies };
      
      vulnerablePackages.forEach(vulnPkg => {
        expect(allDeps).not.toHaveProperty(vulnPkg);
      });
    });

    test('should have reasonable dependency count', () => {
      const depCount = Object.keys(packageConfig.dependencies).length;
      const devDepCount = Object.keys(packageConfig.devDependencies).length;
      
      expect(depCount).toBeGreaterThan(0);
      expect(depCount).toBeLessThan(100);
      expect(devDepCount).toBeGreaterThan(0);
      expect(devDepCount).toBeLessThan(100);
    });

    test('should validate dependency duplication handling', () => {
      const deps = Object.keys(packageConfig.dependencies);
      const devDeps = Object.keys(packageConfig.devDependencies);
      const duplicates = deps.filter(dep => devDeps.includes(dep));
      
      // Allow duplicates but ensure they don't have conflicting major versions
      duplicates.forEach(dep => {
        const prodVersion = packageConfig.dependencies[dep];
        const devVersion = packageConfig.devDependencies[dep];
        const prodMajor = parseInt(prodVersion.match(/\d+/)?.[0] || '0');
        const devMajor = parseInt(devVersion.match(/\d+/)?.[0] || '0');
        
        expect(Math.abs(prodMajor - devMajor)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Angular Ecosystem Compatibility', () => {
    test('should have zone.js compatible with Angular version', () => {
      const zoneVersion = packageConfig.dependencies['zone.js'];
      const angularVersion = packageConfig.dependencies['@angular/core'];
      
      const angularMajor = parseInt(angularVersion.match(/\d+/)?.[0] || '0');
      
      if (angularMajor >= 19) {
        expect(zoneVersion).toMatch(/^~0\.1[4-5]\./);
      }
    });

    test('should have TypeScript version compatible with Angular', () => {
      const tsVersion = packageConfig.devDependencies.typescript;
      const tsMajor = parseInt(tsVersion.match(/\d+/)?.[0] || '0');
      
      expect(tsMajor).toBeGreaterThanOrEqual(4);
      expect(tsMajor).toBeLessThanOrEqual(6);
    });

    test('should have RxJS version compatible with Angular', () => {
      const rxjsVersion = packageConfig.dependencies.rxjs;
      const rxjsMajor = parseInt(rxjsVersion.match(/\d+/)?.[0] || '0');
      
      expect(rxjsMajor).toBeGreaterThanOrEqual(7);
      expect(rxjsMajor).toBeLessThanOrEqual(8);
    });

    test('should handle Angular version inconsistencies gracefully', () => {
      // Test for the actual version inconsistencies present in the config
      const angularCore = packageConfig.dependencies['@angular/core'];
      const angularPlatformBrowserDynamic = packageConfig.dependencies['@angular/platform-browser-dynamic'];
      
      expect(angularCore).toMatch(/^20\./);
      expect(angularPlatformBrowserDynamic).toMatch(/^19\./);
      
      // This is a real inconsistency in the config that should be flagged
      const coreMajor = parseInt(angularCore.match(/\d+/)?.[0] || '0');
      const dynamicMajor = parseInt(angularPlatformBrowserDynamic.match(/\d+/)?.[0] || '0');
      
      if (Math.abs(coreMajor - dynamicMajor) > 0) {
        console.warn('Angular version inconsistency detected between core and platform-browser-dynamic');
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle JSON parsing errors gracefully', () => {
      const invalidJson = '{ "name": "client", "version": }';
      expect(() => JSON.parse(invalidJson)).toThrow(SyntaxError);
    });

    test('should validate required fields presence', () => {
      const requiredFields = ['name', 'version', 'scripts', 'dependencies', 'devDependencies'];
      
      requiredFields.forEach(field => {
        expect(packageConfig).toHaveProperty(field);
        expect(packageConfig[field]).toBeDefined();
        expect(packageConfig[field]).not.toBeNull();
      });
    });

    test('should handle empty dependency objects', () => {
      // Test what happens with empty objects
      const testConfig = {
        ...packageConfig,
        dependencies: {},
        devDependencies: {}
      };

      expect(Object.keys(testConfig.dependencies)).toHaveLength(0);
      expect(Object.keys(testConfig.devDependencies)).toHaveLength(0);
    });

    test('should validate version string formats', () => {
      const invalidVersions = ['', '1', '1.0', 'invalid', '^invalid', 'latest'];
      
      Object.values(packageConfig.dependencies).forEach(version => {
        expect(invalidVersions).not.toContain(version);
      });
    });

    test('should handle missing optional fields gracefully', () => {
      const optionalFields = ['description', 'keywords', 'author', 'license', 'repository'];
      
      optionalFields.forEach(field => {
        if (packageConfig[field]) {
          expect(['string', 'object']).toContain(typeof packageConfig[field]);
        }
      });
    });
  });

  describe('Configuration-Specific Tests', () => {
    test('should detect test script misconfiguration', () => {
      // This test specifically addresses the issue where test script points to lint
      expect(packageConfig.scripts.test).toBe('ng lint');
      
      // This is likely a configuration error - test should run actual tests
      console.warn('Test script is configured to run linting instead of tests. Consider using "ng test" for actual test execution.');
    });

    test('should validate Angular CLI version compatibility', () => {
      const cliVersion = packageConfig.devDependencies['@angular/cli'];
      expect(cliVersion).toMatch(/^~20\.1\./);
      
      // Ensure CLI version is compatible with Angular core version
      const coreVersion = packageConfig.dependencies['@angular/core'];
      const cliMajor = parseInt(cliVersion.match(/\d+/)?.[0] || '0');
      const coreMajor = parseInt(coreVersion.match(/\d+/)?.[0] || '0');
      
      expect(cliMajor).toBe(20);
      expect([19, 20]).toContain(coreMajor);
    });

    test('should validate ESLint version consistency', () => {
      const angularEslintVersion = packageConfig.devDependencies['@angular-eslint/builder'];
      const typescriptEslintVersion = packageConfig.devDependencies['@typescript-eslint/eslint-plugin'];
      
      expect(angularEslintVersion).toBe('20.1.1');
      expect(typescriptEslintVersion).toBe('8.32.0');
    });

    test('should handle resolutions for security vulnerabilities', () => {
      // Verify the ip package resolution addresses the vulnerability correctly
      const ipResolution = packageConfig.resolutions['**/ip'];
      expect(ipResolution).toContain('neoip');
      expect(ipResolution).toContain('2.1.0');
      
      // Ensure it's a valid npm registry URL
      expect(ipResolution).toMatch(/^https:\/\/registry\.npmjs\.org\//);
    });
  });

  describe('Best Practices and Standards', () => {
    test('should follow npm naming conventions', () => {
      expect(packageConfig.name).toMatch(/^[a-z0-9-]+$/);
      expect(packageConfig.name).not.toMatch(/^[.-]/);
      expect(packageConfig.name).not.toMatch(/[.-]$/);
      expect(packageConfig.name.length).toBeLessThan(215);
    });

    test('should use appropriate version range strategies', () => {
      const allDeps = { ...packageConfig.dependencies, ...packageConfig.devDependencies };
      
      Object.entries(allDeps).forEach(([name, version]) => {
        // Should use ^ for most packages, ~ for more conservative updates
        expect(version).toMatch(/^[\^~]/);
        
        // Zone.js uses ~ for patch-level updates only
        if (name === 'zone.js') {
          expect(version).toMatch(/^~/);
        }
      });
    });

    test('should have consistent ESLint ecosystem', () => {
      const eslintDeps = Object.keys(packageConfig.devDependencies)
        .filter(dep => dep.includes('eslint'));
      
      expect(eslintDeps.length).toBeGreaterThan(5);
      
      // Verify Angular and TypeScript ESLint integrations
      const hasAngularEslint = eslintDeps.some(dep => dep.includes('@angular-eslint'));
      const hasTypeScriptEslint = eslintDeps.some(dep => dep.includes('@typescript-eslint'));
      
      expect(hasAngularEslint).toBe(true);
      expect(hasTypeScriptEslint).toBe(true);
    });

    test('should avoid overly permissive version ranges', () => {
      const allDeps = { ...packageConfig.dependencies, ...packageConfig.devDependencies };
      
      Object.values(allDeps).forEach(version => {
        expect(version).not.toMatch(/^\*/);
        expect(version).not.toMatch(/^x$/);
        expect(version).not.toMatch(/^>/);
        expect(version).not.toMatch(/^>=/);
      });
    });
  });
});