#!/bin/bash

# First install all dependencies
echo "Installing dependencies for all projects..."

# Create public directory first
echo "Creating public directory..."
rm -rf public
mkdir -p public

cd Flashcard
echo "Building Flashcard..."
npm install
npm run build
mkdir -p ../public/flashcard
cp -r dist/* ../public/flashcard/

cd ../mindmap-ai
echo "Building MindMap AI..."
npm install
npm run build
mkdir -p ../public/mindmap/mindmap-ai
cp -r dist/* ../public/mindmap/mindmap-ai/

cd ../mindmap-manual
echo "Building MindMap Manual..."
npm install
npm run build
mkdir -p ../public/mindmap/mindmap-manual
cp -r dist/* ../public/mindmap/mindmap-manual/

cd ../pastel-pdf-sorcery-test
echo "Building PDF Chat..."
npm install
npm run build
mkdir -p ../public/pdf-chat
cp -r dist/* ../public/pdf-chat/

cd ../studyhub-interactives
echo "Building Main App..."
npm install
npm run build
cp -r public/* ../public/

# Create _redirects file
echo "Creating _redirects file..."
cat > ../public/_redirects << EOL
/flashcard/* /flashcard/index.html 200
/mindmap/mindmap-ai/* /mindmap/mindmap-ai/index.html 200
/mindmap/mindmap-manual/* /mindmap/mindmap-manual/index.html 200
/pdf-chat/* /pdf-chat/index.html 200
/* /index.html 200
EOL

echo "Build completed!"
