import { Router, Request, Response } from 'express';
import { db } from '../services/database.service';
import type { Contact } from '../types';

const router = Router();

/**
 * GET /api/contacts
 * Get all contacts for user
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const contacts = db.getContacts(userId);

    return res.json({  // ADD return here
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({  // ADD return here
      success: false,
      error: 'Failed to fetch contacts',
    });
  }
});

/**
 * GET /api/contacts/:contactId
 * Get specific contact
 */
router.get('/:contactId', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const { contactId } = req.params;

    const contact = db.getContact(userId, contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    return res.json({  // ADD return here
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return res.status(500).json({  // ADD return here
      success: false,
      error: 'Failed to fetch contact',
    });
  }
});

/**
 * POST /api/contacts
 * Create new contact
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const contactData: Contact = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const contact = db.createContact(userId, contactData);

    return res.status(201).json({  // ADD return here
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return res.status(500).json({  // ADD return here
      success: false,
      error: 'Failed to create contact',
    });
  }
});

/**
 * PUT /api/contacts/:contactId
 * Update contact
 */
router.put('/:contactId', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const { contactId } = req.params;
    const updates = req.body;

    const contact = db.updateContact(userId, contactId, updates);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    return res.json({  // ADD return here
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    return res.status(500).json({  // ADD return here
      success: false,
      error: 'Failed to update contact',
    });
  }
});

/**
 * DELETE /api/contacts/:contactId
 * Delete contact
 */
router.delete('/:contactId', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const { contactId } = req.params;

    const success = db.deleteContact(userId, contactId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    return res.json({  // ADD return here
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return res.status(500).json({  // ADD return here
      success: false,
      error: 'Failed to delete contact',
    });
  }
});

export default router;
