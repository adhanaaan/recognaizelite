#!/bin/bash

# Security Verification Script
# This script verifies that the security implementation is working correctly

echo "🔒 Security Verification Script"
echo "================================"
echo ""

# Check 1: Verify server-only package is installed
echo "✓ Checking if server-only package is installed..."
if grep -q "server-only" package.json; then
    echo "  ✅ server-only package found in package.json"
else
    echo "  ❌ server-only package NOT found - run: npm install server-only"
    exit 1
fi

# Check 2: Verify server directory exists
echo ""
echo "✓ Checking server directory structure..."
if [ -d "src/server" ]; then
    echo "  ✅ src/server directory exists"
else
    echo "  ❌ src/server directory NOT found"
    exit 1
fi

# Check 3: Verify server files exist
echo ""
echo "✓ Checking server files..."
if [ -f "src/server/report.ts" ]; then
    echo "  ✅ src/server/report.ts exists"
else
    echo "  ❌ src/server/report.ts NOT found"
    exit 1
fi

if [ -f "src/server/validation.ts" ]; then
    echo "  ✅ src/server/validation.ts exists"
else
    echo "  ❌ src/server/validation.ts NOT found"
    exit 1
fi

if [ -f "src/server/data/report_data.json" ]; then
    echo "  ✅ src/server/data/report_data.json exists"
else
    echo "  ❌ src/server/data/report_data.json NOT found"
    exit 1
fi

# Check 4: Verify server-only imports
echo ""
echo "✓ Checking server-only imports..."
if grep -q '"server-only"' src/server/report.ts; then
    echo "  ✅ report.ts imports server-only"
else
    echo "  ⚠️  report.ts missing server-only import"
fi

if grep -q '"server-only"' src/server/validation.ts; then
    echo "  ✅ validation.ts imports server-only"
else
    echo "  ⚠️  validation.ts missing server-only import"
fi

# Check 5: Verify API route uses new imports
echo ""
echo "✓ Checking API route security..."
if grep -q "src/server/report" src/pages/api/generate-report.ts; then
    echo "  ✅ API route imports from src/server/report"
else
    echo "  ❌ API route NOT using server-only import"
    exit 1
fi

if grep -q "validateResultData" src/pages/api/generate-report.ts; then
    echo "  ✅ API route uses validation"
else
    echo "  ⚠️  API route missing validation"
fi

# Check 6: Verify old files can be removed
echo ""
echo "✓ Checking for old files that should be removed..."
if [ -f "src/utils/report.ts" ]; then
    echo "  ⚠️  Old src/utils/report.ts still exists - consider removing after verification"
else
    echo "  ✅ Old report.ts already removed"
fi

if [ -f "src/data/report_data.json" ]; then
    echo "  ⚠️  Old src/data/report_data.json still exists - consider removing after verification"
else
    echo "  ✅ Old report_data.json already removed"
fi

# Check 7: Try to build the project
echo ""
echo "✓ Attempting to build project..."
echo "  (This will verify that server-only code is properly isolated)"
echo ""

npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "  ✅ Build successful - server code is properly isolated"
else
    echo "  ❌ Build failed - check for errors"
    echo "  Run 'npm run build' to see detailed error messages"
    exit 1
fi

# Final summary
echo ""
echo "================================"
echo "✅ Security verification complete!"
echo ""
echo "Next steps:"
echo "1. Test the /api/generate-report endpoint"
echo "2. Verify client cannot access server algorithms"
echo "3. Remove old files after confirming everything works:"
echo "   - rm src/utils/report.ts"
echo "   - rm src/data/report_data.json"
echo "4. (Optional) Add API key authentication in .env"
echo ""
