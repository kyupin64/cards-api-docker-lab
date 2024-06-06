const express = require("express");
const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const fs = require("node:fs");
require("dotenv").config();

const users = require("./data/users.json");
const cards = require("./data/cards.json");
const port = process.env.port || 3000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
});

app.post("/getToken", (req, res) => {
    const { username, password } = req.body;
    const user = users.users.find(currUser => currUser.username === username);

    if (Object.keys(req.body)[0] === undefined) {
        return res.status(400).json({ errorMessage: "No user info to process" });
    };
    if (!user || user.password !== password) {
        return res.status(401).json({ errorMessage: "Invalid Credentials" });
    };

    const token = jwt.sign({username: user.username}, process.env.secret, {
        algorithm: "HS256",
        expiresIn: "15m",
    });

    return res.json({ token: token });
});

app.use(
    "/cards", 
    expressjwt({ secret: process.env.secret, algorithms: ["HS256"] })
);

app.get("/cards", (req, res) => {
    console.log(req.auth.username);
    if (Object.keys(req.query)[0]) {
        let filteredCards = cards.cards;

        Object.entries(req.query).forEach(([key, value]) => {
            if (Number(value)) value = Number(value);
            filteredCards = filteredCards.filter((card) => card[key] === value);
        });

        res.json({
            searchParams: req.query,
            matches: filteredCards.length,
            filteredCards: filteredCards
        });
    } else {
        res.json({ cards: cards.cards });
    };
});

function checkAdmin(req, res, next) {
    if (req.auth.username !== 'admin') {
        return res.status(403).json({ errorMessage: "Access denied" });
    }
    next();
};

app.post("/cards/create", checkAdmin, (req, res) => {
    const cardExists = cards.cards.some((card) => card.id === req.body.id);

    if (Object.keys(req.body)[0] === undefined) {
        return res.status(400).json({ errorMessage: "No card info to add" });
    };
    if (cardExists) {
        return res.status(400).json({ errorMessage: "Card ID already exists" });
    };

    cards.cards.push(req.body);
    fs.writeFile("./data/cards.json", JSON.stringify(cards, null, 2), (err) => {
        if (err) {
            return next(err);
        };
        res.json({
            message: "Successfully created new card",
            newCard: req.body,
            cards: cards.cards 
        });
    });
});

app.put("/cards/:id", checkAdmin, (req, res) => {
    const cardIndex = cards.cards.findIndex((card) => card.id === Number(req.params.id));
    const cardExists = cards.cards.some((card) => card.id === req.body.id);

    if (Object.keys(req.body)[0] === undefined) {
        return res.status(400).json({ errorMessage: "No card info to update" });
    };
    if (cardIndex === -1) {
        return res.status(404).json({ errorMessage: "Card ID could not be found" });
    };
    if (cardExists && req.body.id !== Number(req.params.id)) {
        return res.status(400).json({ errorMessage: "Updated card ID is already assigned to a card" });
    };

    Object.assign(cards.cards[cardIndex], req.body);
    fs.writeFile("./data/cards.json", JSON.stringify(cards, null, 2), (err) => {
        if (err) {
            return next(err);
        };
        res.json({
            message: "Successfully updated card",
            updatedCard: cards.cards[cardIndex],
            cards: cards.cards
        });
    });
});

app.delete("/cards/:id", checkAdmin, (req, res) => {
    const cardIndex = cards.cards.findIndex((card) => card.id === Number(req.params.id));

    if (cardIndex === -1) {
        return res.status(404).json({ errorMessage: "Card ID could not be found" });
    };

    const deletedCard = cards.cards.splice(cardIndex, 1);
    fs.writeFile("./data/cards.json", JSON.stringify(cards, null, 2), (err) => {
        if (err) {
            return next(err);
        };
        res.json({
            message: "Successfully deleted card",
            deletedCard: deletedCard,
            cards: cards.cards
        });
    });
});

app.use((err, req, res, next)=> {
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ errorMessage: "Invalid Token" });
    } else {
        console.log(err.stack);
        res.status(500).json({ errorMessage: "Something went wrong" });
    };
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});