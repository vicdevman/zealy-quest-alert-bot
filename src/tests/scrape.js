import {
  scrapePage
} from "../service/scrape.js";

scrapePage('https://zealy.io/cw/updatezhub/questboard').then((result) => {
  console.log(result.data.data);
});