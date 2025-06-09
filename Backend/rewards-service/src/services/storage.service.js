

// backend/rewards-service/src/services/storage.service.js
// backend/rewards-service/src/services/storage.service.js
const cloudinary = require('../config/cloudinary'); // Uses the configured Cloudinary instance
const logger = require('../config/logger');

const uploadImage = (buffer, originalname, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      const errMsg = `Cannot upload empty file: ${originalname}`;
      logger.error(`[StorageService] Upload Error: ${errMsg}`);
      return reject(new Error(errMsg));
    }

    // Sanitize originalname for use as public_id (Cloudinary has restrictions)
    const baseName = originalname.substring(0, originalname.lastIndexOf('.')) || originalname;
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    // Add a unique suffix to prevent overwrites if names are not unique, or rely on Cloudinary's unique ID generation if public_id is not set.
    // For this example, let's make it somewhat unique, though Cloudinary handles true uniqueness if public_id is omitted or `unique_filename: true` is used.
    const public_id_suggestion = `${options.folder ? options.folder + '/' : ''}${sanitizedBaseName}-${Date.now()}`;


    logger.info(`[StorageService] Initiating Cloudinary upload for: ${originalname}, size: ${buffer.length} bytes, suggested public_id: ${public_id_suggestion}`);

    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: public_id_suggestion, // Using a unique public_id within the folder
        folder: options.folder || 'shikshaarthi/generic_uploads', // Specify a default folder
        resource_type: "auto", // Let Cloudinary detect resource type
        // Cloudinary's Node SDK does not directly support a `timeout` option in `upload_stream`.
        // Timeouts need to be managed externally (e.g., Promise.race in controller).
      },
      (error, result) => {
        if (error) {
          logger.error(`[StorageService] Cloudinary UPLOAD_STREAM CALLBACK ERROR for ${originalname} (Public ID: ${public_id_suggestion}): ${error.message || 'Unknown Cloudinary error'}`, { 
            errorName: error.name, 
            httpCode: error.http_code,
            // fullError: JSON.stringify(error) // Be cautious logging full error objects in production
          });
          return reject(error); // Pass the original error object
        }
        if (!result || !result.secure_url || !result.public_id) {
          const errMsg = `Cloudinary upload failed for ${originalname} (Public ID: ${public_id_suggestion}): No result, secure_url, or public_id returned.`;
          logger.error(`[StorageService] ${errMsg} Full result: ${JSON.stringify(result)}`);
          return reject(new Error(errMsg));
        }
        logger.info(`[StorageService] Cloudinary UPLOAD_STREAM CALLBACK SUCCESS for ${originalname}. URL: ${result.secure_url.substring(0,70)}... Public ID: ${result.public_id}`);
        resolve({ url: result.secure_url, cloudinaryId: result.public_id });
      }
    );

    // Important: Handle errors on the stream itself
    stream.on('error', (streamError) => {
      logger.error(`[StorageService] Cloudinary UPLOAD STREAM 'error' EVENT for ${originalname} (Public ID: ${public_id_suggestion}): ${streamError.message}`, streamError);
      // This ensures the promise is rejected if the stream encounters an error
      // (e.g., network issues before/during piping to Cloudinary).
      // The callback above might or might not be called in this case, so this is a safeguard.
      reject(streamError); 
    });
    
    // Write buffer to stream and end it
    try {
      stream.end(buffer);
      logger.info(`[StorageService] Buffer written to Cloudinary upload_stream for ${originalname} (Public ID: ${public_id_suggestion}). Waiting for Cloudinary callback.`);
    } catch (e) {
      const errMsg = `Error calling stream.end() for ${originalname} (Public ID: ${public_id_suggestion})`;
      logger.error(`[StorageService] ${errMsg}: ${e.message}`, e);
      return reject(new Error(`${errMsg}: ${e.message}`));
    }
  });
};

const deleteImage = (cloudinaryId) => {
  return new Promise((resolve, reject) => {
    if (!cloudinaryId) {
      logger.warn('[StorageService] Delete request: No cloudinaryId provided.');
      // Resolve to not break Promise.allSettled, but indicate no action.
      return resolve({ result: 'no_id', message: 'No Cloudinary ID provided, nothing to delete.' });
    }
    logger.info(`[StorageService] Initiating Cloudinary delete for ID: ${cloudinaryId}`);
    cloudinary.uploader.destroy(cloudinaryId, (error, result) => {
      if (error) {
        logger.error(`[StorageService] Cloudinary delete FAILED for ID ${cloudinaryId}: ${error.message || 'Unknown error'}`, error);
        return reject(error); // Pass the original error object
      }
      // Cloudinary's destroy result: { result: 'ok' } or { result: 'not found' }
      if (result && (result.result === 'ok' || result.result === 'not found')) {
        logger.info(`[StorageService] Cloudinary delete for ID ${cloudinaryId} completed. Result: ${result.result}`);
      } else {
         logger.warn(`[StorageService] Cloudinary delete for ID ${cloudinaryId} returned an unexpected result:`, result);
      }
      resolve(result); // Resolve with the result from Cloudinary
    });
  });
};

module.exports = { uploadImage, deleteImage };