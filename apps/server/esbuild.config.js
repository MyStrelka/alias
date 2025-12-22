import path from 'path';
import esbuild from 'esbuild';

// Define the output directory for your build
// const outDir = path.resolve(__dirname, 'dist');

// Create the esbuild build configuration
esbuild
  .build({
    entryPoints: ['src/index.ts'], // Main entry point (change as needed)
    bundle: true, // Enable bundling
    format: 'esm',
    outfile: './dist/index.js', // Output file
    sourcemap: true, // Generate sourcemaps
    minify: true, // Minify the output for production
    assetNames: 'assets/[name]-[hash]', // Asset file naming convention with hash for cache busting
    // loader: {
    //   '.png': 'file', // Handle PNG images
    //   '.jpg': 'file', // Handle JPEG images
    //   '.css': 'css', // Handle CSS files
    //   '.ts': 'ts', // Handle TypeScript files (optional, as esbuild does this by default)
    // },
    external: ['node_modules'], // Exclude specific modules from being bundled (e.g., node_modules)
    define: {
      'process.env.NODE_ENV': '"production"', // Define environment variables for optimization
    },
    banner: {
      js: `import { createRequire as topLevelCreateRequire } from "module";
            import { fileURLToPath as topLevelFileURLToPath } from "url";
            import { dirname as topLevelDirname, join as topLevelJoin } from "path";
            const __bundleRequire = topLevelCreateRequire(import.meta.url);
            const __bundleFilename = topLevelFileURLToPath(import.meta.url);
            const __bundleDirname = topLevelDirname(__bundleFilename);
            const __bundleJoin = topLevelJoin;

            // Make these variables available globally for compatibility
            const require = __bundleRequire;
            const __filename = __bundleFilename;
            const __dirname = __bundleDirname;
            const join = __bundleJoin;
            console.log('Bundle initialized in production mode.');`,
    },
    platform: 'node', // Target platform (node, browser, etc.)
  })
  .catch(() => process.exit(1)); // Exit on error
