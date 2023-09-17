//* This is a custom script that automatically generates a static HTML Photo Gallery site every time a photo is added to my personal computer slideshow directory
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');
const absolutePath = path.resolve(__dirname);

// List of supported image file extensions
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const outputFileName = 'index.html';

// Function to delete existing HTML file if it exists
const deleteExistingHTMLFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Function to get image files from the directory
const getImageFiles = (directory) => {
  const files = fs.readdirSync(directory);
  return files.filter((file) => {
    const ext = path.extname(file).substring(1);
    return imageExtensions.includes(ext);
  });
};

// Function to generate HTML
const generateHTML = (imageFiles) => {
  return `<!DOCTYPE html>
<html class="w-auto">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="description" content="Joe's desktop wallpaper gallery. Click on any photo to view it full screen and download. New photos and artwork added regularly.">
  <title>Joe's Wallpaper Gallery</title>
 <!-- Facebook Meta Tags -->
  <meta property="og:url" content="https://vilasi.github.io/slideshow/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Joe's Wallpaper Gallery">
  <meta property="og:description" content="Joe's desktop wallpaper gallery. Click on any photo to view it full screen and download. New photos and artwork added regularly.">
  <meta property="og:image" content="https://i.imgur.com/EgCdtLB.jpg">
  <meta name="description" content="" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta property="twitter:domain" content="vilasi.github.io">
  <meta property="twitter:url" content="https://vilasi.github.io/slideshow/">
  <meta name="twitter:title" content="Joe's Wallpaper Gallery">
  <meta name="twitter:description" content="Joe's desktop wallpaper gallery. Click on any photo to view it full screen and download. New photos and artwork added regularly.">
  <meta name="twitter:image" content="https://i.imgur.com/EgCdtLB.jpg">
  <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
      crossorigin="anonymous"
    />
</head>
<body class="d-flex flex-column align-items-start">
  <header class="container my-5 border-bottom">
    <h1 class="display-1">Joe's Desktop Background Slideshow</h1>
    <p class="lead text-center">Click Image to View Full Size or Download</p>
  </header>
  <main class="row text-center">
    
    ${imageFiles
      .map(
        (file, index) =>
          `<div class="col-lg-3">
            <a href="${file}" target="_blank">
            <img class="img-fluid m-5 shadow-lg border rounded" src="${file}" alt="${path.basename(
            file,
            path.extname(file)
          )}"></a>
          <p>${index + 1}</p>
          </div>`
      )
      .join('\n  ')}
    
  </main>

  <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
      crossorigin="anonymous"
  ></script>
  <script src="app.js" async defer></script>
</body>
</html>`;
};

// Main function to generate HTML file
const main = () => {
  // Delete existing HTML file
  deleteExistingHTMLFile(outputFileName);

  // Get image files from the current directory
  const imageFiles = getImageFiles(process.cwd());
  const htmlContent = generateHTML(imageFiles);

  // Write the HTML content to the output file
  fs.writeFileSync(outputFileName, htmlContent, 'utf8');
};

// Execute the main function
main();

// Function to execute Git commands - Add/Commit/Push to the Remote Repo
const executeGitCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    console.log(err);
    // Handle the 'nothing to commit' case gracefully
    if (command.includes('git commit') && err.status === 1) {
      console.log('Nothing to commit. Skipping...');
      return;
    }

    console.error(`Error executing git command: ${command}\n${err.stderr}`);
    throw err; // if you want to stop further execution
  }
};

// Function to handle git operations
const handleGitOperations = () => {
  executeGitCommand('git add .');
  executeGitCommand('git commit -m "Photo added"');

  try {
    executeGitCommand('git push');
  } catch (err) {
    console.error(
      'Failed to push to git. Ensure you have the necessary permissions and network access.'
    );
  }
};

// Set up chokidar to watch the current directory for file additions
const watcher = chokidar.watch(absolutePath, {
  persistent: true,
  ignored: ['**/.git/**', /(^|[\/\\])\../],
  ignoreInitial: true, // this will ignore all files upon initialization
  depth: 0,
});

// Event handler for file additions
watcher.on('add', (filePath) => {
  console.log(`File added: ${filePath}`);

  const ext = path.extname(filePath).substring(1);

  if (imageExtensions.includes(ext)) {
    main();

    // Handle git operations after generating the HTML
    handleGitOperations();
    console.log(`Image added: ${filePath}. Regenerating HTML...`);
  }
});

// This indicates if the watcher is functioning properly.
watcher.on('ready', () => {
  console.log('Watcher is ready and watching for changes...');
});

console.log(`Watching for new images in directory: ${absolutePath}`);
