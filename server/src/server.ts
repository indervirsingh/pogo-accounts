import * as dotenv from "dotenv"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { connectToDatabase } from "./database"
import { pogoAccountsRouter } from "./pogo-accounts.routes"

// Load environment variables from the .env file
dotenv.config()

const ATLAS_URI = process.env.ATLAS_URI
const PORT = process.env.PORT || 5200
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:4200"

if (!ATLAS_URI) {
    console.error("No ATLAS_URI environment variable has been defined in .env file")
    process.exit(1)
}

connectToDatabase(ATLAS_URI)
    .then(() => {
        const app = express()
        
        // Security middleware
        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }))
        
        // CORS configuration
        app.use(cors({
            origin: CORS_ORIGIN,
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }))
        
        // Body parsing middleware with size limits
        app.use(express.json({ limit: '10mb' }))
        app.use(express.urlencoded({ extended: true, limit: '10mb' }))
        
        // API routes
        app.use("/pogo-accounts", pogoAccountsRouter)
        
        // Health check endpoint
        app.get("/health", (req, res) => {
            res.status(200).json({ status: "OK", timestamp: new Date().toISOString() })
        })
        
        // 404 handler
        app.use("*", (req, res) => {
            res.status(404).json({ error: "Endpoint not found" })
        })
        
        // Global error handler
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Unhandled error:', err)
            res.status(500).json({ error: "Internal server error" })
        })

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`)
            console.log(`🔒 CORS enabled for: ${CORS_ORIGIN}`)
        })

    })
    .catch(error => {
        console.error("Failed to connect to database:", error)
        process.exit(1)
    })