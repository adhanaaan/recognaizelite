let nodes = [];
const max_nodes = 60; // Number of circles (60 for mobile, 100 for tablet & desktop)
const node_size = 4; // Size of circle (4 for mobile, 5 for tablet & desktop)
const connectable_probability = 0.5;
const distance_threshold = 0.2; // Adjust for longer or shorter connections

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255); // Change to RGB for better color accuracy with hex codes
  initNodes();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initNodes();
}

function initNodes() {
  nodes = [];
  for (let i = 0; i < max_nodes; i++) {
    nodes.push({
      x: Math.round(random(width)),
      y: Math.round(random(height)),
      x_rate: (0.05 + random(0.1)) * (random(1) >= 0.5 ? 1 : -1),
      y_rate: (0.05 + random(0.1)) * (random(1) >= 0.5 ? 1 : -1),
      size: node_size,
      connectable: random(1) <= connectable_probability,
    });
  }
}

function draw() {
  setGradientBackground(); // Adjusted to new gradient colors
  updateNodes();
  drawNodes();
}

function setGradientBackground() {
  let fromColor = color("#6584db"); // Start color
  let toColor = color("#b287bd"); // End color
  for (let y = 0; y < height; y++) {
    let lerpAmt = map(y, 0, height, 0, 1);
    let interColor = lerpColor(fromColor, toColor, lerpAmt);
    stroke(interColor);
    line(0, y, width, y);
  }
}

function updateNodes() {
  nodes.forEach((node) => {
    node.x += node.x_rate;
    node.y += node.y_rate;
    if (node.x <= 0 || node.x >= width) node.x_rate *= -1;
    if (node.y <= 0 || node.y >= height) node.y_rate *= -1;
  });
}

function drawNodes() {
  nodes.forEach((node) => {
    if (node.connectable) {
      nodes.forEach((other) => {
        if (other === node) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = sqrt(dx * dx + dy * dy);
        const threshold = distance_threshold * height;
        if (distance > threshold) return;
        let alpha = 1 - distance / threshold;
        stroke(`rgba(255, 255, 255, ${alpha * 0.6})`);
        line(node.x, node.y, other.x, other.y);
      });
    }
    fill(`rgba(255, 255, 255, 0.8)`);
    stroke(`rgba(255, 255, 255, 0.8)`);
    strokeWeight(1);
    circle(node.x, node.y, node.size * 2.5);
  });
}

function keyPressed() {
  if (key === "s") {
    saveGif("mySketch", 10, { delay: 1 });
  }
}
