export const sectionTypeToName = {
  'frame': 'Frame',
  'motor': 'Motor',
  'battery': 'Battery',
  'flight-controller': 'Flight Controller',
  'camera': 'Camera',
  'video-antenna': 'Video Antenna',
  'radio-module': 'Radio Module'
}

function *generateId() {
  let id = 0;

  while (true) {
    yield id++;
  }
}

const idGenerator = generateId();

export function generateUniqueId() {
  return idGenerator.next().value;
}