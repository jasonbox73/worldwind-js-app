import WorldWind from 'worldwindjs';

/**
 * Custom WorldWind shape that renders a 3D satellite model
 * Extends the basic Renderable interface
 */
export class SatelliteShape {
  constructor(position, modelData, color) {
    // Renderable interface properties
    this.enabled = true;
    this.displayName = 'Satellite';

    this.position = position; // WorldWind.Position
    this.modelData = modelData; // { positions, normals, vertexCount }
    this.color = color; // WorldWind.Color
    this.scale = 50000; // Scale factor for satellite size (50km)
    this.heading = 0; // Rotation angle

    // WebGL resources (created on first render)
    this.vertexBuffer = null;
    this.normalBuffer = null;
    this.initialized = false;
  }

  /**
   * Render the 3D satellite model
   */
  render(dc) {
    try {
      if (!this.enabled) {
        return;
      }

    // Initialize WebGL buffers on first render
    if (!this.initialized) {
      this.initializeBuffers(dc);
    }

    const gl = dc.currentGlContext;
    const program = dc.currentProgram;

    if (!program || !this.vertexBuffer) {
      return;
    }

    // Convert geographic position to Cartesian coordinates
    const globe = dc.globe;
    const point = new WorldWind.Vec3(0, 0, 0);
    globe.computePointFromPosition(
      this.position.latitude,
      this.position.longitude,
      this.position.altitude,
      point
    );

    // Set up model-view matrix
    const mvMatrix = WorldWind.Matrix.fromIdentity();
    mvMatrix.multiplyByTranslation(point[0], point[1], point[2]);
    mvMatrix.multiplyByScale(this.scale, this.scale, this.scale);

    // Apply rotation for heading
    mvMatrix.multiplyByRotation(1, 0, 0, 90); // Align model upright
    mvMatrix.multiplyByRotation(0, 0, 1, this.heading);

    // Multiply by the projection matrix
    const mvpMatrix = WorldWind.Matrix.fromIdentity();
    mvpMatrix.setToMultiply(dc.projection, mvMatrix);

    // Apply to GL context
    program.loadModelviewProjection(gl, mvpMatrix);

    // Bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(
      program.vertexPointLocation,
      3, gl.FLOAT, false, 0, 0
    );
    gl.enableVertexAttribArray(program.vertexPointLocation);

    // Bind normal buffer
    if (this.normalBuffer && program.normalVectorLocation >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.vertexAttribPointer(
        program.normalVectorLocation,
        3, gl.FLOAT, false, 0, 0
      );
      gl.enableVertexAttribArray(program.normalVectorLocation);
    }

    // Set color using WorldWind's built-in color uniform
    if (program.colorLocation !== undefined && program.colorLocation !== null) {
      // Use loadUniformColor which handles premultiplied alpha correctly
      program.loadUniformColor(gl, this.color, program.colorLocation);
    }

    // Draw the model
    gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertexCount);

    } catch (error) {
      console.error('Error rendering satellite:', error);
    }
  }

  /**
   * Initialize WebGL buffers
   */
  initializeBuffers(dc) {
    const gl = dc.currentGlContext;

    // Create vertex position buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.modelData.positions,
      gl.STATIC_DRAW
    );

    // Create normal buffer
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.modelData.normals,
      gl.STATIC_DRAW
    );

    this.initialized = true;
  }

  /**
   * Update satellite position
   */
  updatePosition(newPosition) {
    this.position = newPosition;
  }

  /**
   * Update heading/rotation
   */
  updateHeading(heading) {
    this.heading = heading;
  }
}

export default SatelliteShape;
