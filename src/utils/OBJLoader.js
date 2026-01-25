/**
 * Simple OBJ file loader for WorldWind integration
 * Parses Wavefront OBJ files into usable geometry data
 */
export class OBJLoader {
  constructor() {
    this.vertices = [];
    this.normals = [];
    this.faces = [];
  }

  /**
   * Parse OBJ file content
   * @param {string} objText - Raw OBJ file content
   * @returns {Object} Parsed geometry data
   */
  parse(objText) {
    const lines = objText.split('\n');

    for (let line of lines) {
      line = line.trim();

      // Skip comments and empty lines
      if (line.startsWith('#') || line.length === 0) {
        continue;
      }

      const parts = line.split(/\s+/);
      const type = parts[0];

      // Vertex positions (v x y z)
      if (type === 'v') {
        this.vertices.push([
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        ]);
      }
      // Vertex normals (vn x y z)
      else if (type === 'vn') {
        this.normals.push([
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        ]);
      }
      // Faces (f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3)
      else if (type === 'f') {
        const face = [];
        // OBJ faces can be triangles or quads, we'll triangulate quads
        for (let i = 1; i < parts.length; i++) {
          const indices = parts[i].split('/');
          face.push({
            vertex: parseInt(indices[0]) - 1, // OBJ is 1-indexed
            normal: indices[2] ? parseInt(indices[2]) - 1 : null
          });
        }

        // If quad, split into two triangles
        if (face.length === 4) {
          this.faces.push([face[0], face[1], face[2]]);
          this.faces.push([face[0], face[2], face[3]]);
        } else {
          this.faces.push(face);
        }
      }
    }

    return {
      vertices: this.vertices,
      normals: this.normals,
      faces: this.faces
    };
  }

  /**
   * Load OBJ file from URL
   * @param {string} url - Path to OBJ file
   * @returns {Promise<Object>} Parsed geometry data
   */
  async load(url) {
    const response = await fetch(url);
    const text = await response.text();
    return this.parse(text);
  }

  /**
   * Convert parsed data to flat arrays for WebGL
   * @returns {Object} { positions: Float32Array, normals: Float32Array }
   */
  toArrays() {
    const positions = [];
    const normals = [];

    // Convert faces to flat vertex arrays
    for (const face of this.faces) {
      for (const vertex of face) {
        const v = this.vertices[vertex.vertex];
        positions.push(v[0], v[1], v[2]);

        if (vertex.normal !== null) {
          const n = this.normals[vertex.normal];
          normals.push(n[0], n[1], n[2]);
        } else {
          normals.push(0, 0, 1); // Default normal
        }
      }
    }

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      vertexCount: positions.length / 3
    };
  }
}

export default OBJLoader;
