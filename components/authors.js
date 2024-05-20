require('dotenv').config();

const authors = [
    {
        name: "Joel Orion",
        email: "joelorion13@gmail.com",
        topic: "business",
        pass: process.env.JOEL_ORION_FB_PASS,
        apiDetails: {
            userId: "x",
            token: process.env.JOEL_ORION_MEDIUM_TOKEN
        }
    },
    {
        name: "Natalie Baker",
        email: "natalie.bnyc0@gmail.com",
        topic: "health",
        pass: process.env.NATALIE_BAKER_FB_PASS
    },
    {
        name: "Osberg Conrad",
        email: "osbergconrad@gmail.com",
        topic: "travel",
        pass: process.env.OSBERG_CONRAD_FB_PASS
    },
    {
        name: "Mateo Sanchez",
        email: "mateosanchez2002r@gmail.com",
        topic: "food",
        pass: process.env.MATEO_SANCHEZ_FB_PASS
    },
    {
        name: "Nate Palmer",
        email: "natep1135@gmail.com",
        topic: "poetry",
        pass: process.env.NATE_PALMER_FB_PASS
    }
]

module.exports = {authors};