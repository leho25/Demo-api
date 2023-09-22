const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki";
const characterUrl = "https://kimetsu-no-yaiba.fandom.com/wiki/";
//SET UP
const app = express();
app.use(express.json({ limit: "50mb" }));
dotenv.config();
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

//ROUTES
//GET ALL CHARACTER
app.get("/v1", (req, resp) => {
  const thumbnails = [];
  const limit = Number(req.query.limit);
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      $(".portal", html).each(function () {
        const name = $(this).find("a").attr("title");
        const url = $(this).find("a").attr("href");
        const image = $(this).find("a > img").attr("data-src");
        thumbnails.push({
          name: name,
          url: "https://demo-api-l0bs.onrender.com/v1" + url.split("/wiki")[1],
          image: image,
        });
      });
      if (limit && limit > 0) {
        resp.status(200).json(thumbnails.slice(0, limit));
      } else {
        resp.status(200).json(thumbnails);
      }
    });
  } catch (error) {
    resp.status(500).json(error);
  }
});

// GET A CHARACTER
app.get("/v1/:character", (req, resp) => {
  let url = characterUrl + req.params.character;
  const titles = [];
  const details = [];
  const galleries = [];
  const characters = [];
  const characterObj = {};
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      //Get gallery
      $(".wikia-gallery-item", html).each(function () {
        const gallery = $(this).find("a > img").attr("data-src");
        galleries.push(gallery);
      });
      $("aside", html).each(function () {
        const img = $(this).find("img").attr("src");

        //Get the title of character title
        $(this)
          .find("section > div > h3")
          .each(function () {
            titles.push($(this).text());
          });
        //Get character details
        $(this)
          .find("section > div > div")
          .each(function () {
            details.push($(this).text());
          });
        //Create object with title as key and detail as key
        if (img !== undefined) {
          console.log(galleries);
          for (let i = 0; i < titles.length; i++) {
            characterObj[titles[i].toLowerCase()] = details[i];
          }
          characters.push({
            name: req.params.character.replace("_", " "),
            gallery: galleries,
            image: img,
            ...characterObj,
          });
        }
      });
      resp.status(200).json(characters);
    });
  } catch (error) {
    resp.status(500).json(error);
  }
});
//RUN PORT
app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running...");
});
