import {
  scrapePage
} from "../service/scrape.js";

scrapePage('solstice-finance').then((result) => {
  console.log(result);
});