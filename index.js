const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

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
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Joe's Wallpaper Gallery</title>
  <meta name="description" content="" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
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

  const imageFiles = getImageFiles(process.cwd());
  const htmlContent = generateHTML(imageFiles);

  fs.writeFileSync(outputFileName, htmlContent, 'utf8');
};

// Execute the main function
main();

// Function to execute git commands
const executeGitCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error executing git command: ${command}`, err);
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

// Set up chokidar to watch the current directory
const watcher = chokidar.watch(process.cwd(), {
  persistent: true,
  ignored: outputFileName,
  depth: 0,
});

watcher.on('add', (filePath) => {
  const ext = path.extname(filePath).substring(1);

  // Check if the added file is the output HTML file
  if (path.basename(filePath) === outputFileName) {
    console.log('Output HTML file updated. Skipping regeneration...');
    return;
  }

  if (imageExtensions.includes(ext)) {
    console.log(`Image added: ${filePath}. Regenerating HTML...`);
    main();

    // Handle git operations after generating the HTML
    handleGitOperations();
  }
});

// watcher.on('add', (filePath) => {
//   const ext = path.extname(filePath).substring(1);
//   if (imageExtensions.includes(ext)) {
//     console.log(`Image added: ${filePath}. Regenerating HTML...`);
//     main();

//     // Handle git operations after generating the HTML
//     handleGitOperations();
//   }
// });

console.log(`Watching for new images in directory: ${process.cwd()}`);
