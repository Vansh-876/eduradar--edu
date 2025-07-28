const Joi = require('joi');

const listingSchema = Joi.object({
  listing: Joi.object({

      title: Joi.string().required().messages({
      'string.empty': 'Title is required'
    }),
    name: Joi.string().min(3).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long'
    }),
    location: Joi.string().required().messages({
      'string.empty': 'Location is required',
    }),

    category: Joi.string().valid('Bookstore', 'Library', 'Stationery', 'Cyber Cafe', 'Coaching').required(),

    openHours: Joi.string().required().messages({
      'string.empty': 'Open hours are required',
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Description is required',
    }),
    contact: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
      'string.pattern.base': 'Phone number must be 10 digits'
    }),
      alternateContact: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).messages({
      'string.pattern.base': 'Alternate contact must be a valid 10-digit number',
    }),

    whatsappNumber: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).messages({
      'string.pattern.base': 'WhatsApp number must be a valid 10-digit number',
    }),

    email: Joi.string().email().required().messages({
      'string.email': 'Email must be valid',
      'string.empty': 'Email is required'
    }),

    website: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Website must be a valid URL',
    }),

    googleMapLink: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Google Map link must be a valid URL',
    }),

    facebookPage: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Facebook page must be a valid URL',
    }),

    instagramPage: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Instagram page must be a valid URL',
    }),
    image: Joi.string().allow('', null),
      tags: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()  
    ).optional()
  }).required()
});

module.exports = { listingSchema };

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5'
    }),
    comment: Joi.string().min(3).required().messages({
      'string.empty': 'Comment is required',
      'string.min': 'Comment must be at least 3 characters long'
    })
  }).required()
});