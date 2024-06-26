import Artwork from '../models/ArtworkModel.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from 'cloudinary';
import { promises as fs } from 'fs';

export const getAllArtworks = async (req, res) => {
  const { search, location, sort } = req.query;
  // console.log(search, location, sort);
  const queryObject = {};
  if (search || location) {
    // Check if search or location is present
    if (search && location) {
      queryObject.$and = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: location, $options: 'i' } },
      ];
    } else if (search) {
      queryObject.title = { $regex: search, $options: 'i' };
    } else {
      queryObject.location = { $regex: location, $options: 'i' };
    }
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'title',
    'z-a': '-title',
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // ! setup pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 8;
  const skip = (page - 1) * limit;
  const artworks = await Artwork.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalArtworks = await Artwork.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalArtworks / limit);
  res.status(StatusCodes.OK).json({ totalArtworks, numOfPages, artworks });
};

export const getMyArtworks = async (req, res) => {
  const artworks = await Artwork.find({ createdBy: req.user.userId });
  // console.log(req.user.name);
  // console.log(artworks);
  res.status(StatusCodes.OK).json({ artworks });
};

export const createArtwork = async (req, res) => {
  try {
    const newArtwork = { ...req.body };
    if (req.file) {
      const response = await cloudinary.v2.uploader.upload(req.file.path);
      await fs.unlink(req.file.path);
      newArtwork.avatar = response.secure_url;
      newArtwork.avatarPublicId = response.public_id;
    }

    // Adding fields to newArtwork
    newArtwork.createdBy = req.user.userId;
    newArtwork.createdByName = req.user.name;

    const artwork = await Artwork.create(newArtwork);
    res.status(StatusCodes.CREATED).json({ artwork });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create artwork. Please try again later.',
      error: error.message,
    });
  }
};
export const getArtwork = async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);
  res.status(StatusCodes.OK).json({ artwork });
};

export const updateArtwork = async (req, res) => {
  try {
    // Find the existing artwork to get the current avatarPublicId
    const existingArtwork = await Artwork.findById(req.params.id);
    if (!existingArtwork) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Artwork not found' });
    }

    const newArtwork = { ...req.body };

    if (req.file) {
      try {
        const response = await cloudinary.v2.uploader.upload(req.file.path);

        await fs.unlink(req.file.path); // Delete file after successful upload
        newArtwork.avatar = response.secure_url;
        newArtwork.avatarPublicId = response.public_id;

        // If there was an existing avatar, delete the old one
        if (existingArtwork.avatarPublicId) {
          const destroyResponse = await cloudinary.v2.uploader.destroy(
            existingArtwork.avatarPublicId
          );
          console.log('Cloudinary destroy response:', destroyResponse);
        }
      } catch (uploadError) {
        console.error(uploadError);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to upload the new avatar. Please try again later.',
          error: uploadError.message,
        });
      }
    }

    // Update the existing artwork with newArtwork data
    for (const key in newArtwork) {
      existingArtwork[key] = newArtwork[key];
    }

    // Save the updated artwork
    const updatedArtwork = await existingArtwork.save();

    res
      .status(StatusCodes.OK)
      .json({ msg: 'Artwork modified', updatedArtwork });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update artwork. Please try again later.',
      error: error.message,
    });
  }
};

export const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Artwork not found' });
    }

    if (artwork.avatarPublicId) {
      await cloudinary.uploader.destroy(artwork.avatarPublicId);
    }

    await Artwork.findByIdAndDelete(req.params.id);

    res.status(StatusCodes.OK).json({ msg: 'Artwork deleted' });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to delete artwork. Please try again later.',
      error: error.message,
    });
  }
};
