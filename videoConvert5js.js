const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });
let filesToConvert = [];
let currentFileIndex = 0;

async function loadFFmpeg() {
  // Load the FFmpeg core
  try {
    await ffmpeg.load();
    console.log("FFmpeg loaded successfully.");
  } catch (e) {
    console.error("Failed to load FFmpeg:", e);
  }
}

function setup() {
  noCanvas(); // We are not using the p5 canvas for this app

  // Load FFmpeg on startup
  loadFFmpeg();

  // Handle file input change
  const fileInput = document.getElementById('file-input');
  fileInput.addEventListener('change', (event) => {
    filesToConvert = event.target.files;
    if (filesToConvert.length > 0) {
      document.getElementById('convert-button').disabled = false;
    }
  });
}

async function startConversion() {
  const overallProgress = document.getElementById('overall-progress');
  const fileProgress = document.getElementById('file-progress');
  const outputDiv = document.getElementById('output');
  
  document.getElementById('convert-button').disabled = true;
  
  for (let i = 0; i < filesToConvert.length; i++) {
    const file = filesToConvert[i];
    currentFileIndex = i;
    const fileName = file.name.split('.').slice(0, -1).join('.') + '_converted.mjpeg';
    
    // Load the file into FFmpeg's virtual file system
    ffmpeg.FS('writeFile', file.name, await fetchFile(file));
    
    // Run the FFmpeg command to convert the video
    await ffmpeg.run('-i', file.name, '-q:v', '4', fileName);
    
    // Retrieve the output file
    const data = ffmpeg.FS('readFile', fileName);

    // Create a downloadable link
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mjpeg' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.textContent = `Download ${fileName}`;
    outputDiv.appendChild(a);
    outputDiv.appendChild(document.createElement('br'));

    // Update overall progress
    overallProgress.value = ((i + 1) / filesToConvert.length) * 100;
    fileProgress.value = 100; // Reset file progress to full after each conversion
  }
  
  document.getElementById('convert-button').disabled = false;
  console.log('Conversion completed');
}
