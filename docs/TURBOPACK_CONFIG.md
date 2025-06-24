# Next.js Configuration for Turbopack and Webpack

## Overview
This configuration handles the keyv package dependency issues that arise from dynamic imports in third-party packages like `office-text-extractor` and `got`.

## Key Configuration

### 1. **Server External Packages**
```typescript
serverExternalPackages: [
  'keyv',
  '@keyv/redis', 
  'redis',
  'office-text-extractor',
  'got',
  'cacheable-request'
]
```

This tells both Webpack and Turbopack to treat these packages as external dependencies instead of trying to bundle them. This is the **recommended approach for Turbopack**.

### 2. **Turbopack Configuration**
```typescript
turbo: {
  resolveExtensions: [
    '.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json',
  ],
}
```

Turbopack primarily relies on `serverExternalPackages` for handling problematic packages. The resolve extensions help with module resolution.

### 3. **Webpack Fallback**
The webpack configuration provides fallbacks for when Turbopack is not used:
- External declarations
- Resolve fallbacks for dynamic imports

## Why This Works

### **Root Cause**
The error occurs because:
1. `office-text-extractor` uses `got` for HTTP requests
2. `got` uses `cacheable-request` for caching 
3. `cacheable-request` uses `keyv` for storage
4. `keyv` tries to dynamically import adapters like `@keyv/redis`
5. The bundler can't resolve these dynamic imports at build time

### **Solution**
By marking these packages as external:
- They're not bundled by the build system
- Dynamic imports work as intended in the Node.js runtime
- Version conflicts are avoided
- Performance is improved (no unnecessary bundling)

## Turbopack vs Webpack

| Feature | Turbopack | Webpack |
|---------|-----------|---------|
| External Packages | `serverExternalPackages` | `config.externals` |
| Dynamic Imports | Handled automatically | Requires fallbacks |
| Performance | Faster builds | Slower builds |
| Stability | Newer, some edge cases | Mature, well-tested |

## Best Practices

### **For Turbopack (Recommended)**
1. Use `serverExternalPackages` for problematic dependencies
2. Keep the configuration minimal
3. Let Turbopack handle module resolution automatically

### **For Webpack (Fallback)**
1. Use `config.externals` to exclude packages
2. Add resolve fallbacks for dynamic imports
3. Test thoroughly as configuration is more complex

## Commands

### **Using Turbopack (Default)**
```bash
npm run dev  # Uses turbopack by default
```

### **Using Webpack**
```bash
npm run dev -- --turbo false
# or
next dev --turbo false
```

## Environment Variables
Make sure these are set for Redis functionality:
```env
REDIS_URL=redis://localhost:6379
```

## Troubleshooting

### **If you still see keyv errors:**
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `pnpm install`
3. Restart dev server

### **For production builds:**
```bash
npm run build
```
Should work without issues as the external packages are properly configured.

## Package Version Management

The `pnpm.overrides` in package.json forces consistent keyv versions:
```json
{
  "pnpm": {
    "overrides": {
      "keyv": "^5.3.4"
    }
  }
}
```

This ensures all packages use the same keyv version, preventing conflicts.
