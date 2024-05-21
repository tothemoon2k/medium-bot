require('dotenv').config();

const authors = [
    {
        name: "Natalie Baker",
        email: "natalie.bnyc0@gmail.com",
        topic: "health",
        pass: process.env.NATALIE_BAKER_FB_PASS,
        apiDetails: {
            userId: "1c3dc8e97d601d4a1fe534246463df64bb6b2cf4a9518b4161fa3b6d493dd0812",
            token: process.env.NATALIE_BAKER_MEDIUM_TOKEN
        }
    },
    {
        name: "Osberg Conrad",
        email: "osbergconrad@gmail.com",
        topic: "travel",
        pass: process.env.OSBERG_CONRAD_FB_PASS,
        apiDetails: {
            userId: "1d96c06a77f6dadd6e6ea0c0c5efa95e0f08e32aa807b91bee6e88a778fd839af",
            token: process.env.OSBERG_CONRAD_MEDIUM_TOKEN
        }
    },
    {
        name: "Mateo Sanchez",
        email: "mateosanchez2002r@gmail.com",
        topic: "food",
        pass: process.env.MATEO_SANCHEZ_FB_PASS,
        apiDetails: {
            userId: "16a794507c5e3a9f174fa321c62141baa4c8f1275558be27b73407233ffd94d5e",
            token: process.env.MATEO_SANCHEZ_MEDIUM_TOKEN
        }
    },
    {
        name: "Nate Palmer",
        email: "natep1135@gmail.com",
        topic: "poetry",
        pass: process.env.NATE_PALMER_FB_PASS,
        apiDetails: {
            userId: "1681b7cc31fd0733548c09abbb7c9c9b5b2fda6c9ab4d783c6d542a7aec540f28",
            token: process.env.NATE_PALMER_MEDIUM_TOKEN
        }
    }
]

module.exports = {authors};