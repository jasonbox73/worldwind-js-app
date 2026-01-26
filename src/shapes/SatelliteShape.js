import WorldWind from 'worldwindjs';

/**
 * Custom WorldWind shape that renders a 3D satellite model
 * Uses WorldWind's built-in shader for proper coordinate transformation
 */

// Shared texture (loaded once, shared across all satellites)
let sharedTexture = null;
let textureLoading = false;
let textureLoaded = false;
let textureImage = null;

function loadTextureImage(url) {
  if (textureImage || textureLoading) {
    return;
  }

  textureLoading = true;
  console.log('Loading satellite texture from:', url);

  const image = new Image();
  image.crossOrigin = 'anonymous';

  image.onload = () => {
    textureImage = image;
    textureLoaded = true;
    textureLoading = false;
    console.log('Satellite texture image loaded:', image.width, 'x', image.height);
  };

  image.onerror = (err) => {
    console.error('Failed to load satellite texture:', url, err);
    textureLoading = false;
  };

  image.src = url;
}

export class SatelliteShape {
  constructor(position, modelData, color, texturePath) {
    // Renderable interface properties
    this.enabled = true;
    this.displayName = 'Satellite';

    this.position = position; // WorldWind.Position
    this.modelData = modelData; // { positions, normals, texCoords, vertexCount }
    this.color = color; // WorldWind.Color
    this.texturePath = texturePath || '/space-satellite/textures/Satellite2_albedo.jpg';
    this.scale = 50000; // Scale factor for satellite size (50km)
    this.heading = 0; // Rotation angle

    // WebGL resources (created on first render)
    this.vertexBuffer = null;
    this.normalBuffer = null;
    this.texCoordBuffer = null;
    this.initialized = false;
    this.gpuTexture = null;

    // Start loading texture image
    loadTextureImage(this.texturePath);
  }

  /**
   * Render the 3D satellite model
   */
  render(dc) {
    try {
      if (!this.enabled) {
        return;
      }

      // Debug: Log on first render attempt
      if (!this.renderAttempted) {
        this.renderAttempted = true;
        console.log('SatelliteShape render called');
      }

      // Initialize WebGL buffers on first render
      if (!this.initialized) {
        this.initializeBuffers(dc);
      }

      const gl = dc.currentGlContext;

      // Use WorldWind's BasicTextureProgram for textured rendering
      let program;
      if (sharedTexture || this.gpuTexture) {
        program = dc.findAndBindProgram(WorldWind.BasicTextureProgram);
      } else {
        program = dc.currentProgram;
      }

      if (!program || !this.vertexBuffer) {
        if (!this.errorLogged) {
          this.errorLogged = true;
          console.log('Missing program or buffer:', { hasProgram: !!program, hasBuffer: !!this.vertexBuffer });
        }
        return;
      }

      // Debug: Log program uniforms once
      if (!this.debugLogged) {
        this.debugLogged = true;
        console.log('WorldWind program info:', {
          programName: program.constructor.name,
          programId: program.programId,
          colorLocation: program.colorLocation,
          vertexPointLocation: program.vertexPointLocation,
          normalVectorLocation: program.normalVectorLocation,
          vertexTexCoordLocation: program.vertexTexCoordLocation,
          textureUnit: program.textureUnit,
          textureSamplerLocation: program.textureSamplerLocation
        });
      }

      // Create GPU texture if image is loaded but texture isn't created yet
      if (textureLoaded && textureImage && !this.gpuTexture) {
        this.gpuTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.gpuTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        sharedTexture = this.gpuTexture;
        console.log('GPU texture created');
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

      // Apply to GL context using WorldWind's method
      program.loadModelviewProjection(gl, mvpMatrix);

      // Bind vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(
        program.vertexPointLocation,
        3, gl.FLOAT, false, 0, 0
      );
      gl.enableVertexAttribArray(program.vertexPointLocation);

      // Bind normal buffer for lighting
      if (this.normalBuffer && program.normalVectorLocation >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(
          program.normalVectorLocation,
          3, gl.FLOAT, false, 0, 0
        );
        gl.enableVertexAttribArray(program.normalVectorLocation);
      }


      // Bind texture if available
      const texture = sharedTexture || this.gpuTexture;
      if (texture) {
        // Bind texture to texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Use WorldWind's texture binding method if available
        if (program.loadTextureUnit) {
          program.loadTextureUnit(gl, gl.TEXTURE0);
        }
        if (program.loadTextureSampler) {
          program.loadTextureSampler(gl, 0);
        }

        // Set texture enabled flag if the program supports it
        if (program.loadTextureEnabled) {
          program.loadTextureEnabled(gl, true);
        }

        // Bind texture coordinates
        if (program.vertexTexCoordLocation >= 0 && this.texCoordBuffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
          gl.vertexAttribPointer(
            program.vertexTexCoordLocation,
            2, gl.FLOAT, false, 0, 0
          );
          gl.enableVertexAttribArray(program.vertexTexCoordLocation);
        }
      }

      // Set color (white to not tint the texture)
      if (program.loadColor) {
        program.loadColor(gl, WorldWind.Color.WHITE);
      } else if (program.loadUniformColor) {
        program.loadUniformColor(gl, WorldWind.Color.WHITE, program.colorLocation);
      }

      // Set opacity
      if (program.loadOpacity) {
        program.loadOpacity(gl, 1.0);
      }

      // Disable backface culling in case normals are inverted
      gl.disable(gl.CULL_FACE);

      // Draw the model
      gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertexCount);

      // Re-enable culling for other WorldWind rendering
      gl.enable(gl.CULL_FACE);

      // Cleanup texture coordinate attribute
      if (program.vertexTexCoordLocation >= 0 && this.texCoordBuffer) {
        gl.disableVertexAttribArray(program.vertexTexCoordLocation);
      }

    } catch (error) {
      console.error('Error rendering satellite:', error);
    }
  }

  /**
   * Initialize WebGL buffers
   */
  initializeBuffers(dc) {
    const gl = dc.currentGlContext;

    if (!this.modelData || !this.modelData.positions) {
      console.error('Invalid model data');
      return;
    }

    // Create vertex position buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.modelData.positions, gl.STATIC_DRAW);

    // Create normal buffer
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.STATIC_DRAW);

    // Create texture coordinate buffer
    if (this.modelData.texCoords && this.modelData.texCoords.length > 0) {
      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.modelData.texCoords, gl.STATIC_DRAW);
    }

    this.initialized = true;
    console.log('Satellite buffers initialized, vertex count:', this.modelData.vertexCount);
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
