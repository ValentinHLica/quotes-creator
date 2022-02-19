const quotes = [];

document
  .querySelectorAll("#quotesList .grid-item.qb.clearfix.bqQt")
  .forEach((e) => {
    const text = e
      .querySelector(`a[title="view quote"]`)
      .textContent.replace(/\\n/g, "")
      .trim();

    if (text !== "") {
      quotes.push(text);
    }
  });

copy(quotes);

// ffmpeg -i *.png -vf scale=1280:720 thumbnail.png

const authors = [];

document
  .querySelectorAll("div.bq_fl.indexContent.authorContent a.bq_on_link_cl")
  .forEach((item) => {
    const url = item.getAttribute("href");
    const name = item.textContent;

    authors.push({
      url,
      name,
    });
  });

copy(authors);
