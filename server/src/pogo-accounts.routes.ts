import * as express from "express"
import * as mongodb from "mongodb"
import { collections } from "./database"
import * as escape from "escape-html"
import * as rateLimit from "express-rate-limit"
import validator from 'validator'

// Enhanced sanitization function
function sanitizePogoAccount(account: any) {
    if (!account || typeof account !== 'object') {
        throw new Error('Invalid account data');
    }

    // Define allowed fields and their validation rules
    const allowedFields = {
        username: { required: true, maxLength: 50, pattern: /^[a-zA-Z0-9_-]+$/ },
        email: { required: true, maxLength: 100, isEmail: true },
        team: { required: true, enum: ['instinct', 'mystic', 'valor'] },
        country: { required: false, maxLength: 50, pattern: /^[a-zA-Z\s-]+$/ },
        birthday: { required: false, isDate: true },
        level: { required: false, isNumeric: true, min: 1, max: 50 }
    };

    const sanitizedAccount: any = {};

    for (const [field, rules] of Object.entries(allowedFields)) {
        const value = account[field];

        // Check if required field is missing
        if (rules.required && (!value || value.toString().trim() === '')) {
            throw new Error(`${field} is required`);
        }

        // Skip optional empty fields
        if (!value && !rules.required) {
            continue;
        }

        let sanitizedValue = value;

        // Type-specific validation and sanitization
        if (rules.isEmail && !validator.isEmail(value)) {
            throw new Error(`${field} must be a valid email address`);
        }

        if (rules.isNumeric && !validator.isNumeric(value.toString())) {
            throw new Error(`${field} must be a number`);
        }

        if (rules.isDate && !validator.isISO8601(value)) {
            throw new Error(`${field} must be a valid date`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            throw new Error(`${field} contains invalid characters`);
        }

        if (rules.enum && !rules.enum.includes(value)) {
            throw new Error(`${field} must be one of: ${rules.enum.join(', ')}`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            throw new Error(`${field} must be less than ${rules.maxLength} characters`);
        }

        if (rules.min && parseFloat(value) < rules.min) {
            throw new Error(`${field} must be at least ${rules.min}`);
        }

        if (rules.max && parseFloat(value) > rules.max) {
            throw new Error(`${field} must be at most ${rules.max}`);
        }

        // Sanitize the value
        if (typeof sanitizedValue === 'string') {
            sanitizedValue = escape(validator.escape(sanitizedValue.trim()));
        }

        sanitizedAccount[field] = sanitizedValue;
    }

    return sanitizedAccount;
}

// Validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
    return mongodb.ObjectId.isValid(id) && id.length === 24;
}

export const pogoAccountsRouter = express.Router()
pogoAccountsRouter.use(express.json({ limit: '10mb' })) // Limit payload size

// Enhanced rate limiter: maximum of 50 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Reduced from 100 for better security
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

pogoAccountsRouter.use(limiter);

// Security headers middleware
pogoAccountsRouter.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

// Get all pogo accounts
pogoAccountsRouter.get("/", async (_req, res) => {
    try {
        const pogoAccounts = await collections.pogoAccounts.find({}).limit(100).toArray()
        res.status(200).json(pogoAccounts)
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get a pogo account by id
pogoAccountsRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id

        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid account ID format' });
        }

        const query = { _id: new mongodb.ObjectId(id) }
        const pogoAccount = await collections.pogoAccounts.findOne(query)
    
        if (pogoAccount) {
            res.status(200).json(pogoAccount)
        } else {
            res.status(404).json({ error: 'Account not found' })
        }

    } catch (error) {
        console.error('Error fetching account:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create a pogoAccount object in the database
pogoAccountsRouter.post("/", async (req, res) => {
    try {
        const sanitizedAccount = sanitizePogoAccount(req?.body)
        
        // Check if account with same email already exists
        const existingAccount = await collections.pogoAccounts.findOne({ 
            email: sanitizedAccount.email 
        });
        
        if (existingAccount) {
            return res.status(409).json({ error: 'Account with this email already exists' });
        }

        const result = await collections.pogoAccounts.insertOne(sanitizedAccount)
        const insertedId = result?.insertedId

        if (insertedId) {
            res.status(201).json({ 
                message: 'Account created successfully', 
                id: insertedId 
            })
        } else {
            res.status(500).json({ error: 'Failed to create account' })
        }

    } catch (error) {
        console.error('Error creating account:', error);
        if (error.message.includes('required') || error.message.includes('invalid')) {
            res.status(400).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
})

// Update a pogoAccount object in the database
pogoAccountsRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id

        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid account ID format' });
        }

        const sanitizedAccount = sanitizePogoAccount(req?.body)
        const query = { _id: new mongodb.ObjectId(id) }
        
        const result = await collections.pogoAccounts.updateOne(query, { 
            $set: { 
                ...sanitizedAccount, 
                updatedAt: new Date() 
            } 
        })

        if (result && result.matchedCount) {
            res.status(200).json({ 
                message: 'Account updated successfully',
                username: sanitizedAccount.username 
            })
        } else if (!result.matchedCount) {
            res.status(404).json({ error: 'Account not found' })
        } else {
            res.status(304).json({ error: 'No changes made to account' })
        }

    } catch (error) {
        console.error('Error updating account:', error);
        if (error.message.includes('required') || error.message.includes('invalid')) {
            res.status(400).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
})

// Delete a pogoAccount object in the database
pogoAccountsRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id
        
        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid account ID format' });
        }

        const query = { _id: new mongodb.ObjectId(id) }
        const result = await collections.pogoAccounts.findOneAndDelete(query)

        if (result !== null) {
            res.status(200).json({ 
                message: 'Account deleted successfully',
                deletedId: id 
            })
        } else {
            res.status(404).json({ error: 'Account not found' })
        }

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
})


