const quotes = [];

document
  .querySelectorAll("#quotesList .grid-item.qb.clearfix.bqQt")
  .forEach((e) => {
    const text = e
      .querySelector(`a[title="view quote"]`)
      .textContent.replace(/\\n/g, "")
      .trim();
    const author = e
      .querySelector(`a[title="view author"]`)
      .textContent.replace(/\\n/g, "")
      .trim();

    if (text !== "") {
      quotes.push({
        text,
        author,
      });
    }
  });

copy(quotes);
