import { writeFileSync } from "fs";

import axios from "axios";
import { CheerioAPI, load } from "cheerio";

import { pageUrl, alphabet } from "./config";
import { Author } from "./interface";

const getAuthors = async ($: CheerioAPI) => {
  const authors: Author[] = [];

  $("table.table.table-hover.table-bordered tbody tr").each(
    (index, element) => {
      const firstEl = $(element).find("td:first-child");
      const url = firstEl.find("a").attr("href").replace("/authors/", ""); // /authors/alelia-bundles-quotes
      const name = firstEl.text().trim();
      const profession = $(element).find("td:last-child").text().trim();

      const author: Author = {
        name,
        url,
        profession,
      };

      authors.push(author);
    }
  );

  return authors;
};

export const scrapeLetterAuthors = async () => {
  let authorsList: Author[] = [];

  for (const letter of alphabet) {
    console.log(`Scraping letter: ${letter}`);

    // https://www.brainyquote.com/authors/a
    const url = `${pageUrl}/authors/${letter}`;

    // Fetch HTML
    const { data } = await axios(url);
    const $ = load(data);

    authorsList = [...authorsList, ...(await getAuthors($))];

    // Get Page Count
    const paginationEl = $("ul.pagination.pagination-sm")
      .find("li.page-item:nth-last-child(2) a.page-link")
      .attr("href");

    if (paginationEl) {
      const pages = parseInt(
        paginationEl.replace(`/authors/${letter}`, "").trim(),
        10
      );

      for (let page = 2; page <= pages; page++) {
        console.log(`Scraping letter: ${letter}, page: ${page}`);

        const paginationUrl = `${url}${page}`;

        try {
          const { data } = await axios(paginationUrl);
          const $ = load(data);

          authorsList = [...authorsList, ...(await getAuthors($))];

          console.log(`Finished craping letter: ${letter}, page: ${page}`);
        } catch (error) {
          console.log(error);

          console.log(`Failed craping letter: ${letter}, page: ${page}`);
        }
      }
    }

    console.log(`Finished scraping letter: ${letter}`);
  }

  writeFileSync("./authors.json", JSON.stringify(authorsList));
};

const getQuotes = async ($: CheerioAPI) => {
  const quotes = [];

  $("#quotesList .grid-item.qb.clearfix.bqQt").each((index, element) => {
    const text = $(element)
      .find(`a[title="view quote"]`)
      .text()
      .replace(/\\n/g, "")
      .trim();
    const author = $(element)
      .find(`a[title="view author"]`)
      .text()
      .replace(/\\n/g, "")
      .trim();

    if (text !== "") {
      quotes.push({
        text,
        author,
      });
    }
  });

  return quotes;
};

export const getAuthorQuotes = async (authorUrl: string) => {
  // https://www.brainyquote.com/authors/albert-einstein-quotes
  const url = `${pageUrl}/authors/${authorUrl}`;

  // Fetch HTML
  const { data } = await axios(url);
  const $ = load(data);

  let quotes = [...(await getQuotes($))];

  // Get Page Count
  const paginationEl = $("ul.pagination.pagination-sm")
    .find("li.page-item:nth-last-child(2) a.page-link")
    .attr("href");

  if (paginationEl) {
    const pages = parseInt(
      paginationEl.replace(`/authors/${authorUrl}_`, "").trim(),
      10
    );

    for (let page = 2; page <= pages; page++) {
      console.log(`Scraping author: ${authorUrl}, page: ${page}`);

      const paginationUrl = `${url}_${page}`;

      try {
        const { data } = await axios(paginationUrl);
        const $ = load(data);

        quotes = [...quotes, ...(await getQuotes($))];

        console.log(`Finished craping author: ${authorUrl}, page: ${page}`);
      } catch (error) {
        // console.log(error);

        console.log(`Failed craping author: ${authorUrl}, page: ${page}`);
      }
    }
  }

  return quotes;
};
