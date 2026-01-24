/**
 * Animation Controller
 * Manages time-based animations for the Golden Dome visualization
 */

export class AnimationController {
  constructor(worldWindow) {
    this.wwd = worldWindow;
    this.animationTime = 0;
    this.isPlaying = true;
    this.speed = 1.0;
    this.animationFrameId = null;
    this.lastTimestamp = null;
    this.animatableObjects = [];
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.animationFrameId) {
      return; // Already running
    }

    console.log('[AnimationController] Starting animation loop with', this.animatableObjects.length, 'objects');
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Pause animation (keeps loop running but freezes time)
   */
  pause() {
    this.isPlaying = false;
  }

  /**
   * Resume animation
   */
  resume() {
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
  }

  /**
   * Set animation speed (1.0 = normal, 2.0 = 2x speed, 0.5 = half speed)
   */
  setSpeed(speed) {
    this.speed = Math.max(0.1, Math.min(4.0, speed));
  }

  /**
   * Register an object to be animated
   */
  registerAnimatable(obj) {
    console.log('[AnimationController] Registering object:', obj.constructor.name, 'has update:', typeof obj.update === 'function');
    this.animatableObjects.push(obj);
  }

  /**
   * Clear all animatable objects
   */
  clearAnimatables() {
    this.animatableObjects = [];
  }

  /**
   * Main animation loop
   */
  animate = () => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTimestamp) / 1000; // Convert to seconds
    this.lastTimestamp = currentTime;

    if (this.isPlaying) {
      this.animationTime += deltaTime * this.speed;

      // Log every 60 frames (~1 second)
      const secondChanged = Math.floor(this.animationTime) !== Math.floor(this.animationTime - deltaTime * this.speed);
      if (secondChanged) {
        console.log('[AnimationController] Time:', this.animationTime.toFixed(1), 'Objects:', this.animatableObjects.length);
        if (this.animatableObjects.length === 0) {
          console.warn('[AnimationController] WARNING: No objects registered!');
        }
      }

      // Update all animatable objects
      if (secondChanged && this.animatableObjects.length > 0) {
        const firstObj = this.animatableObjects[0];
        console.log('[AnimationController] First object type:', firstObj.constructor.name, 'has update:', typeof firstObj.update);
      }

      this.animatableObjects.forEach((obj, idx) => {
        try {
          if (obj.update && typeof obj.update === 'function') {
            obj.update(this.animationTime);
          } else if (secondChanged) {
            console.warn('[AnimationController] Object', idx, 'has no update method:', obj);
          }
        } catch (err) {
          if (secondChanged) {
            console.error('[AnimationController] Error updating object', idx, ':', err.message);
          }
        }
      });

      // Redraw the scene
      this.wwd.redraw();
    }

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Get current animation time
   */
  getTime() {
    return this.animationTime;
  }

  /**
   * Reset animation time to zero
   */
  reset() {
    this.animationTime = 0;
  }
}

export default AnimationController;
