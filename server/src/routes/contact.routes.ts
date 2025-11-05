import { Router, Request, Response } from 'express';
import { db } from '../services/database.service';
import { authenticate } from '../middleware/auth.middleware';
import { createContactValidation, updateContactValidation } from '../middleware/validation.middleware';
import { contactLimiter } from '../middleware/rateLimiting.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';
import type { Contact } from '../types';

const router = Router();

/**
 * GET /api/contacts
 * Get all contacts for authenticated user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const contacts = await db.getContacts(userId);

    return res.json({
      success: true,
      data: contacts,
    });
  })
);

/**
 * GET /api/contacts/:contactId
 * Get specific contact
 */
router.get(
  '/:contactId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { contactId } = req.params;

    const contact = await db.getContact(userId, contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    return res.json({
      success: true,
      data: contact,
    });
  })
);

/**
 * POST /api/contacts
 * Create new contact
 */
router.post(
  '/',
  authenticate,
  contactLimiter,
  createContactValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const contactData: Contact = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const contact = await db.createContact(userId, contactData);

    logger.info('Contact created', { userId, contactId: contact.id });

    return res.status(201).json({
      success: true,
      data: contact,
    });
  })
);

/**
 * PUT /api/contacts/:contactId
 * Update contact
 */
router.put(
  '/:contactId',
  authenticate,
  contactLimiter,
  updateContactValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { contactId } = req.params;
    const updates = req.body;

    const contact = await db.updateContact(userId, contactId, updates);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    logger.info('Contact updated', { userId, contactId });

    return res.json({
      success: true,
      data: contact,
    });
  })
);

/**
 * DELETE /api/contacts/:contactId
 * Delete contact
 */
router.delete(
  '/:contactId',
  authenticate,
  contactLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { contactId } = req.params;

    const success = await db.deleteContact(userId, contactId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    logger.info('Contact deleted', { userId, contactId });

    return res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  })
);

export default router;
