#!/bin/bash

# First install all dependencies
echo "Installing dependencies for all projects..."

cd Flashcard
npm install
cd ../mindmap-ai
npm install
cd ../mindmap-manual
npm install
cd ../pastel-pdf-sorcery-test
npm install
cd ../studyhub-interactives
npm install
cd ..

# Create public directory
echo "Creating public directory..."
rm -rf studyhub-interactives/public
mkdir -p studyhub-interactives/public

# Now build all projects
echo "Building all projects..."

# Build flashcard project
cd Flashcard
echo "Building Flashcard..."
npm run build
mkdir -p ../studyhub-interactives/public/flashcard
cp -r dist/* ../studyhub-interactives/public/flashcard/ || true

# Build mindmap-ai project
cd ../mindmap-ai
echo "Building MindMap AI..."
npm run build
mkdir -p ../studyhub-interactives/public/mindmap/mindmap-ai
cp -r dist/* ../studyhub-interactives/public/mindmap/mindmap-ai/ || true

# Build mindmap-manual project
cd ../mindmap-manual
echo "Building MindMap Manual..."
npm run build
mkdir -p ../studyhub-interactives/public/mindmap/mindmap-manual
cp -r dist/* ../studyhub-interactives/public/mindmap/mindmap-manual/ || true

# Build pdf-chat project
cd ../pastel-pdf-sorcery-test
echo "Building PDF Chat..."
npm run build
mkdir -p ../studyhub-interactives/public/pdf-chat
cp -r dist/* ../studyhub-interactives/public/pdf-chat/ || true

# Build main project (studyhub-interactives)
cd ../studyhub-interactives
echo "Building Main App..."
npm run build

# Create _redirects file
echo "Creating _redirects file..."
cat > public/_redirects << EOL
/ /index.html 200
/flashcard/* /flashcard/index.html 200!
/mindmap/mindmap-ai/* /mindmap/mindmap-ai/index.html 200!
/mindmap/mindmap-manual/* /mindmap/mindmap-manual/index.html 200!
/pdf-chat/* /pdf-chat/index.html 200!
/* /index.html 200!
EOL

# Create .nojekyll file to prevent GitHub Pages from ignoring files that begin with an underscore
touch public/.nojekyll

echo "Build completed!"
