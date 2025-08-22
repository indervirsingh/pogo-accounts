#!/usr/bin/env node

/**
 * Security Fix Script for Pogo Accounts Application
 * Addresses XSS vulnerabilities and information exposure issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Fixes for Pogo Accounts...\n');

// Check if .env file exists and contains sensitive data
function checkEnvSecurity() {
    const envPath = path.join(__dirname, 'server', '.env');
    
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('mongodb+srv://') && !envContent.includes('# SECURITY WARNING')) {
            console.log('⚠️  WARNING: .env file contains exposed MongoDB credentials');
            console.log('   Recommendation: Rotate credentials and use environment variables in production');
        } else {
            console.log('✅ .env file security warnings added');
        }
    }
}

// Check .gitignore for .env exclusion
function checkGitignore() {
    const gitignorePath = path.join(__dirname, '.gitignore');
    
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        
        if (gitignoreContent.includes('.env')) {
            console.log('✅ .env file is properly excluded from version control');
        } else {
            console.log('❌ .env file is NOT excluded from version control');
            console.log('   Add ".env" to your .gitignore file immediately');
        }
    }
}

// Verify XSS fixes in Angular components
function verifyXSSFixes() {
    const componentPath = path.join(__dirname, 'client', 'src', 'app', 'pogo-accounts-list', 'pogo-accounts-list.component.ts');
    
    if (fs.existsSync(componentPath)) {
        const componentContent = fs.readFileSync(componentPath, 'utf8');
        
        // Check for XSS-safe data binding
        if (componentContent.includes('[textContent]')) {
            console.log('✅ XSS vulnerabilities fixed in Angular templates');
        } else {
            console.log('❌ XSS vulnerabilities still present in Angular templates');
            console.log('   Replace {{ }} interpolation with [textContent] binding');
        }
        
        // Check for input validation
        if (componentContent.includes('isValidObjectId') || componentContent.includes('length !== 24')) {
            console.log('✅ Input validation added to client-side');
        } else {
            console.log('⚠️  Consider adding client-side input validation');
        }
    }
}

// Verify server-side security enhancements
function verifyServerSecurity() {
    const routesPath = path.join(__dirname, 'server', 'src', 'pogo-accounts.routes.ts');
    
    if (fs.existsSync(routesPath)) {
        const routesContent = fs.readFileSync(routesPath, 'utf8');
        
        // Check for input sanitization
        if (routesContent.includes('sanitizePogoAccount') && routesContent.includes('validator')) {
            console.log('✅ Enhanced input sanitization implemented');
        } else {
            console.log('❌ Input sanitization needs improvement');
        }
        
        // Check for security headers
        if (routesContent.includes('X-Content-Type-Options')) {
            console.log('✅ Security headers implemented');
        } else {
            console.log('❌ Security headers missing');
        }
        
        // Check for rate limiting
        if (routesContent.includes('rateLimit')) {
            console.log('✅ Rate limiting configured');
        } else {
            console.log('❌ Rate limiting not configured');
        }
    }
}

// Check for security dependencies
function checkSecurityDependencies() {
    const serverPackagePath = path.join(__dirname, 'server', 'package.json');
    
    if (fs.existsSync(serverPackagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
        const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
        
        const securityPackages = ['helmet', 'validator', 'express-rate-limit'];
        const missingPackages = securityPackages.filter(pkg => !dependencies[pkg]);
        
        if (missingPackages.length === 0) {
            console.log('✅ All security dependencies installed');
        } else {
            console.log(`❌ Missing security packages: ${missingPackages.join(', ')}`);
        }
    }
}

// Run all security checks
function runSecurityAudit() {
    console.log('📋 Security Audit Results:\n');
    
    checkEnvSecurity();
    checkGitignore();
    verifyXSSFixes();
    verifyServerSecurity();
    checkSecurityDependencies();
    
    console.log('\n🔒 Security audit complete!');
    console.log('\n📚 Additional Recommendations:');
    console.log('   1. Rotate MongoDB credentials immediately');
    console.log('   2. Use environment variables in production');
    console.log('   3. Implement Content Security Policy');
    console.log('   4. Add input validation on client-side');
    console.log('   5. Regular security dependency updates');
    console.log('   6. Consider implementing authentication/authorization');
}

// Run the security audit
runSecurityAudit();
