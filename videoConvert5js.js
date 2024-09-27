let filesToConvert = [];
let currentFileIndex = 0;
let fileProgress = 0;
let overallProgress = 0;
let ffmpeg;

// Function to load FFmpeg
async function loadFFmpeg() {
  if (!ffmpeg) {
    const { createFFmpeg, fetchFile } = FFmpeg;
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  }
}

function setup() {
  createCanvas(600, 400);
  
  // Create file input element for selecting multiple files
  let input = createFileInput(handleFile, true); // Accept multiple files
  input.position(20, 20);

  // Create button for starting conversion
  let convertButton = createButton('Start Conversion');
  convertButton.position(20, 60);
  convertButton.mousePressed(startConversion);
  
  // Create status and progress elements
  textSize(16);
}

function draw() {
  background(200);
  
  // Display the progress bars if conversion is in progress
  drawOverallProgressBar();
  drawFileProgressBar();
}

// Function to handle file input
function handleFile(file) {
  // Check file extension instead of relying on file.type
  let fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (fileExtension === 'mp4') {
    filesToConvert.push(file);
    console.log('Added file:', file.name);
  } else {
    console.log('Invalid file type, only MP4 is allowed.');
  }
}

// Function to start conversion
async function startConversion() {
  if (filesToConvert.length === 0) {
    console.log("No files to convert");
    return;
  }

  // Load FFmpeg
  await loadFFmpeg();

  console.log('Starting conversion...');

  for (currentFileIndex = 0; currentFileIndex < filesToConvert.length; currentFileIndex++) {
    let file = filesToConvert[currentFileIndex];
    console.log('Converting:', file.name);
    
    // Fetch the file and convert it using FFmpeg
    const data = await fetchFile(file.file);
    ffmpeg.FS('writeFile', file.name, data);
    
    // Run the FFmpeg command to convert the video
    await ffmpeg.run('-i', file.name, '-vf', 'fps=18,scale=-1:240', 'output_' + (currentFileIndex + 1) + '.mjpeg');
    
    // Retrieve the converted file
    const output = ffmpeg.FS('readFile', 'output_' + (currentFileIndex + 1) + '.mjpeg');
    const blob = new Blob([output.buffer], { type: 'video/mjpeg' });
    
    // Save the converted file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output_' + (currentFileIndex + 1) + '.mjpeg';
    link.click();

    // Update progress
    fileProgress = ((currentFileIndex + 1) / filesToConvert.length) * 100;
    overallProgress = (currentFileIndex + 1) / filesToConvert.length * 100;
  }

  console.log('Conversion complete');
}

// Draw overall progress bar
function drawOverallProgressBar() {
  fill(255);
  rect(150, 200, 300, 30); // Background of the overall progress bar
  
  fill(0, 255, 0);
  rect(150, 200, map(overallProgress, 0, 100, 0, 300), 30); // Overall progress bar fill
}

// Draw file progress bar
function drawFileProgressBar() {
  fill(255);
  rect(150, 250, 300, 30); // Background of the file progress bar
  
  fill(0, 0, 255);
  rect(150, 250, map(fileProgress, 0, 100, 0, 300), 30); // File progress bar fill
}
