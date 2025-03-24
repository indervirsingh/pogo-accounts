import * as express from "express"
import * as mongodb from "mongodb"
import { collections } from "./database"
import * as escape from "escape-html"

export const pogoAccountsRouter = express.Router()
pogoAccountsRouter.use(express.json())

// The route is "/" because all the endpoints from this file are registered under 'pogo-accounts' route
pogoAccountsRouter.get("/", async (_req, res) => {
    try {
        // The find() method works because we pass an empty object and get all data, 
        // The toArray() method will convert the cursor to an array
        const pogoAccounts = await collections.pogoAccounts.find({}).toArray()
        res.status(200).send(pogoAccounts)
    } catch (error) {
        res.status(500).send(escape(error.message))
    }
})


// Gets a pogo account by id

pogoAccountsRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id

        // ObjectId() converts the string id to an ObjectId
        const query = { _id: new mongodb.ObjectId(id) }
        // findOne() returns the pogoAccount with the given id
        const pogoAccount = await collections.pogoAccounts.findOne(query)
    

        if (pogoAccount) {
            res.status(200).send(pogoAccount)
        } else {
            res.status(404).send(`Failed to find a pogo account with id: ${id}`)
        }

    } catch (error) {
        res.status(500).send(`Failed to find a pogo account with id: ${escape(req?.params?.id)}`)
    }

})


// Creates a pogoAccount object in the database

pogoAccountsRouter.post("/", async (req, res) => {
    try {
        const pogoAccount = req?.body

        // insertOne() inserts the pogoAccount into the database
        const result = await collections.pogoAccounts.insertOne(pogoAccount)

        // The insertedId property contains the id of the inserted document
        const insertedId = result?.insertedId

        if (insertedId) {
            res.status(201).send(`Successfully created a pogo account with id: ${insertedId}`)
        } else {
            res.status(500).send(`Failed to create a pogo account`)
        }

    } catch (error) {
        res.status(500).send(escape(error.message))
    }
})


// Updates a pogoAccount object in the database

pogoAccountsRouter.put("/:id", async (req, res) => {
    res.send(req?.params)
    try {

        // Extract pogoAccount data to update via body
        const updated_pogoAccount = req?.body
        // Extract id via params
        const id = req?.params?.id

        // ObjectId() converts the string id to an ObjectId
        const query = { _id: new mongodb.ObjectId(id) }
        // updateOne() finds the pogoAccount with the given id and updates it
        const result = await collections.pogoAccounts.updateOne(query, { $set: updated_pogoAccount })

        if (result && result.matchedCount) {
            res.status(200).send(`Successfully updated ${escape(updated_pogoAccount.username)}`)
        } else if (!result.matchedCount) {
            res.status(404).send(`Failed to find account id: ${escape(id)}`)
        } else {
            res.status(304).send(`Failed to update account id: ${escape(id)}`)
        }

    } catch (error) {
        res.status(400).send(error.message)
    }
})

// Deletes a pogoAccount object in the database

pogoAccountsRouter.delete("/:id", async (req, res) => {
    try {
        // Extract & store data properly
        const id = req?.params?.id
        // ObjectId() converts the string id to an ObjectId
        const query = { _id: new mongodb.ObjectId(id) }
        
        // findOneAndDelete() finds the pogoAccount with the given id and deletes it
        const result = await collections.pogoAccounts.findOneAndDelete(query)

        if (result !== null) {
            res.status(200).send(`Successfully deleted ${escape(id)}`)
        } else {
            res.status(404).send(`Failed to find account id: ${escape(id)}`)
        }

    } catch (error) {
        res.status(500).send(escape(error.message))
    }
})


