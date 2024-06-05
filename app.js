const express = require('express')
const app = express();
const path = require('path')
const fs = require('fs')
const expressSession = require('express-session')
const flash = require("connect-flash")

app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.use(expressSession({
    secret: "hello",
    resave: false,
    saveUninitialized: false
}))

app.use(flash());
function name() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    let nm = `${day}-${month}-${year}`
    return nm
}
app.get("/", (req, res, next) => {
    try {
        fs.readdir("./files", (err, files) => {
            if (err) return res.status(500).send(err)
            res.render("index", { files: files })

        })
    }
    catch (err) {
        next(err)
    }
})

app.get("/create", (req, res, next) => {
    try {
        res.render("create")
    }
    catch {
        next(err)
    }
})

app.post("/save", (req, res, next) => {
    try {


        fs.writeFile(`./files/${req.body.name}-${name()}.txt`, `${req.body.message}`, (err) => {
            if (err) return res.status(500).send(err)
            res.redirect("/")
        })
    }
    catch (err) {
        next(err)
    }
})

app.get("/edit/:filename", (req, res, next) => {
    try {
        fs.readFile(`./files/${req.params.filename}`, "utf-8", (err, data) => {
            if (err) return res.status(500).send(err)
            res.render("edit", {
                data,
                name: req.params.filename
            })
        })
    }
    catch (err) {
        next(err)
    }
})
app.post("/edit", (req, res, next) => {
    try {
        if (req.body.name !== req.body.prevName) {
            fs.rename(`./files/${req.body.prevName}`, `./files/${req.body.name}`, (err) => {
                if (err) return res.status(500).send(err)
                fs.writeFile(`./files/${req.body.name}`, `${req.body.message}`, (err) => {
                    if (err) return res.status(500).send(err)
                    res.redirect("/")
                })

            })

        }
        else {
            fs.writeFile(`./files/${req.body.name}`, `${req.body.message}`, (err) => {
                if (err) return res.status(500).send(err)
                res.redirect("/")

            })
        }
    }
    catch (err) {
        next(err)
    }
})


app.get("/delete/:filename", (req, res, next) => {
    try {
        fs.unlink(`./files/${req.params.filename}`, (err) => {
            if (err) return res.status(500).send(err)
            res.redirect("/");
        })
    }
    catch (err) {
        next(err)
    }
})

app.get("/view/:filename", (req, res, next) => {
    try {
        fs.readdir("./files", (err, files) => {
            if (err) return res.status(500).send(err)
            fs.readFile(`./files/${req.params.filename}`, "utf-8", (err, data) => {
                if (err) return res.status(500).send(err)
                res.render("view", {
                    data,
                    name: req.params.filename,
                }
                )
            })
        })
    }
    catch (err) {
        next(err)
    }

})


app.get("*", (req, res) => {
    res.send("Not Found")
})
app.use((err, req, res, next) => {
    res.send(err.message)
})
app.listen(3000);

