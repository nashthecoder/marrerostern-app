#!/usr/bin/env node

/**
 * Pull Local Changes Script
 * 
 * This script helps pull and sync the latest changes from local development.
 * Usage: npm run pull-local
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Starting local pull and sync process...\n');

try {
  // Check if we're in a git repository
  console.log('📋 Checking git repository status...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (gitStatus.trim()) {
    console.log('⚠️  Working directory has uncommitted changes:');
    console.log(gitStatus);
    console.log('Please commit or stash changes before pulling.\n');
    process.exit(1);
  }

  // Fetch latest changes from remote
  console.log('📡 Fetching latest changes from remote...');
  execSync('git fetch origin', { stdio: 'inherit' });

  // Check current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📌 Current branch: ${currentBranch}`);

  // Pull latest changes
  console.log('⬇️  Pulling latest changes...');
  try {
    execSync(`git pull origin ${currentBranch}`, { stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️  No changes to pull or already up to date.');
  }

  // Install/update dependencies if package.json changed
  console.log('📦 Checking for dependency updates...');
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (fs.existsSync(packageLockPath) && fs.existsSync(nodeModulesPath)) {
    const packageLockStat = fs.statSync(packageLockPath);
    const nodeModulesStat = fs.statSync(nodeModulesPath);
    
    if (packageLockStat.mtime > nodeModulesStat.mtime) {
      console.log('🔧 Installing updated dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      console.log('✅ Dependencies are up to date.');
    }
  }

  // Build the project to ensure everything works
  console.log('🏗️  Building project to verify changes...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n✅ Local pull and sync completed successfully!');
  console.log('🚀 Run `npm run dev` to start development server');

} catch (error) {
  console.error('\n❌ Error during pull and sync process:');
  console.error(error.message);
  process.exit(1);
}